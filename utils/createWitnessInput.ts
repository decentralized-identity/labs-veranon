import { Identity } from "@semaphore-protocol/identity"
import { GroupUtils } from './groupUtils'
import * as SecureStore from 'expo-secure-store';
import { maybeGetSnarkArtifacts } from './getSnarkArtifacts';
import { File } from 'expo-file-system/next';
import { hash } from "./hash"

const PRIVATE_KEY_KEY = 'semaphore_private_key-1';

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

const GROUP_ID = 2;

export async function createWitnessInput(scope: string, message: string): Promise<WitnessInput> {
    try {
        // Get identity from secure storage
        const storedIdentity = await SecureStore.getItemAsync(PRIVATE_KEY_KEY);
        if (!storedIdentity) {
            throw new Error("No identity found in secure storage");
        }
        
        const identity = Identity.import(storedIdentity);
        const group = await GroupUtils.createGroup(GROUP_ID);

        const leafIndex = group.indexOf(identity.commitment);
        const merkleProof = group.generateMerkleProof(leafIndex);

        const merkleProofIndices: number[] = [];
        const merkleProofSiblings = merkleProof.siblings;
        const merkleProofLength = merkleProofSiblings.length;

        // Get artifacts and convert WASM to base64
        const snarkArtifacts = await maybeGetSnarkArtifacts({
            parameters: [merkleProofLength],
            version: "4.0.0"
        });

        const wasmFile = new File(snarkArtifacts.wasm);
        const zkeyFile = new File(snarkArtifacts.zkey);
        
        const wasmBase64 = wasmFile.base64();
        const zkeyBase64 = zkeyFile.base64();

        console.log("--------------------------------")
        console.log("Merkle proof siblings:", merkleProofSiblings);
        console.log("Merkle proof length:", merkleProofLength);
        
        for (let i = 0; i < merkleProofLength; i += 1) {
          merkleProofIndices.push((merkleProof.index >> i) & 1);
          if (merkleProofSiblings[i] === undefined) {
            merkleProofSiblings[i] = 0n;
          }
        }

        console.log("Merkle proof indices:", merkleProofIndices);
        console.log("--------------------------------")
        console.log("Identity commitment:", identity.commitment.toString());

        const input = {
            secret: identity.secretScalar,
            merkleProofLength,
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
