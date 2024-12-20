// lib/semaphore.ts
import { Identity } from "@semaphore-protocol/identity"
import { GroupUtils } from '../utils/groupUtils'
import * as SecureStore from 'expo-secure-store';
import { maybeGetSnarkArtifacts } from './getSnarkArtifacts';
import * as FileSystem from 'expo-file-system';
import { hash } from "./hash"

const PRIVATE_KEY_KEY = 'semaphore_private_key-1';
const GROUP_ID = '1';

// Custom type for our witness generation needs
type WitnessInput = {
    wasmBase64: string;
    input: {
        secret: bigint;
        merkleProofLength: number;
        merkleProofIndices: number[];
        merkleProofSiblings: bigint[];
        scope: string;
        message: string;
    };
}

export async function createWitnessInput(): Promise<WitnessInput> {
    try {
        // 1. Get identity from secure storage
        const storedIdentity = await SecureStore.getItemAsync(PRIVATE_KEY_KEY);
        if (!storedIdentity) {
            throw new Error("No identity found in secure storage");
        }
        
        const identity = Identity.import(storedIdentity);
        const group = await GroupUtils.createGroup(GROUP_ID);

        // Get artifacts and convert WASM to base64
        const snarkArtifacts = await maybeGetSnarkArtifacts({
            parameters: [group.depth]
        });

        const wasmBase64 = await FileSystem.readAsStringAsync(snarkArtifacts.wasm, {
            encoding: FileSystem.EncodingType.Base64
        });

        // Prepare the input for the circuit
        const message = "test-message";
        const scope = "test-scope";
        const leafIndex = group.indexOf(identity.commitment);
        const merkleProof = group.generateMerkleProof(leafIndex);

        const merkleProofIndices = [];
        const merkleProofSiblings = merkleProof.siblings;

        for (let i = 0; i < group.depth; i += 1) {
            merkleProofIndices.push((merkleProof.index >> i) & 1);
            if (merkleProofSiblings[i] === undefined) {
                merkleProofSiblings[i] = 0n;
            }
        }

        // Return only what's needed for witness generation
        return {
            wasmBase64,
            input: {
                secret: identity.secretScalar,
                merkleProofLength: merkleProof.siblings.length,
                merkleProofIndices,
                merkleProofSiblings,
                scope: hash(scope),
                message: hash(message)
            }
        };

    } catch (error) {
        console.error("Error preparing witness input:", error);
        throw error;
    }
}
