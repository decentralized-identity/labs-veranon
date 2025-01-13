// lib/semaphore.ts
import { Identity } from "@semaphore-protocol/identity"
import { GroupUtils } from './groupUtils'
import * as SecureStore from 'expo-secure-store';
import { maybeGetSnarkArtifacts } from './getSnarkArtifacts';
import * as FileSystem from 'expo-file-system';
import { hash } from "./hash"

const PRIVATE_KEY_KEY = 'semaphore_private_key-1';
const GROUP_ID = '2';

// Custom type for our witness generation needs
type WitnessInput = {
    wasmBase64: string;
    zkeyBase64: string;
    input: {
        secret: bigint;
        merkleProofLength: number;
        merkleProofIndices: number[];
        merkleProofSiblings: bigint[];
        scope: string;
        message: string;
    };
}

export async function createWitnessInput(scope: string, message: string): Promise<WitnessInput> {
    try {
        // Get identity from secure storage
        const storedIdentity = await SecureStore.getItemAsync(PRIVATE_KEY_KEY);
        if (!storedIdentity) {
            throw new Error("No identity found in secure storage");
        }
        
        const identity = Identity.import(storedIdentity);
        const group = await GroupUtils.createGroup(GROUP_ID);

        const groupDepth = group.depth;

        // Get artifacts and convert WASM to base64
        const snarkArtifacts = await maybeGetSnarkArtifacts({
            parameters: [groupDepth],
            version: "4.0.0"
        });

        const wasmBase64 = await FileSystem.readAsStringAsync(snarkArtifacts.wasm, {
            encoding: FileSystem.EncodingType.Base64
        });

        const zkeyBase64 = await FileSystem.readAsStringAsync(snarkArtifacts.zkey, {
            encoding: FileSystem.EncodingType.Base64
        });

        // Prepare the input for the circuit
        const leafIndex = group.indexOf(identity.commitment);
        const merkleProof = group.generateMerkleProof(leafIndex);

        const merkleProofIndices: number[] = [];
        const merkleProofSiblings = merkleProof.siblings;

        for (let i = 0; i < groupDepth; i += 1) {
            merkleProofIndices.push((merkleProof.index >> i) & 1);
            if (merkleProofSiblings[i] === undefined) {
                merkleProofSiblings[i] = 0n;
            }
        }

        const input = {
            secret: identity.secretScalar,
            merkleProofLength: merkleProof.siblings.length,
            merkleProofIndices,
            merkleProofSiblings,
            scope: hash(scope),
            message: hash(message)
        };

        return {
            wasmBase64,
            zkeyBase64,
            input
        };

    } catch (error) {
        console.error("Error preparing witness input:", error);
        throw error;
    }
}
