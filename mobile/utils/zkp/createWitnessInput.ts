import { Identity } from "@semaphore-protocol/identity"
import { GroupUtils } from '../groupUtils'
import * as SecureStore from 'expo-secure-store';
import { maybeGetSnarkArtifacts } from './getSnarkArtifacts';
import { File } from 'expo-file-system/next';
import { hash } from "../hash"
import { IDENTITY_KEY } from '../../constants/identities';

// Custom type for our witness generation needs
type WitnessInput = {
    wasmBase64: string;
    zkeyFilePath: string;
    input: {
        secret: bigint;
        merkleProofLength: number;
        merkleProofIndices: number[];
        merkleProofSiblings: bigint[];
        scope: string;
        message: string;
    };
}

export async function createWitnessInput(scope: string, message: string, groupId: number): Promise<WitnessInput> {
    try {
        // Get identity from secure storage
        const storedIdentity = await SecureStore.getItemAsync(IDENTITY_KEY);
        if (!storedIdentity) {
            throw new Error("No identity found in secure storage");
        }
        
        const identity = Identity.import(storedIdentity);
        const group = await GroupUtils.createGroup(groupId);

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
        
        const wasmBase64 = (new File(snarkArtifacts.wasm)).base64();

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
            zkeyFilePath: snarkArtifacts.zkey,
            input
        };

    } catch (error) {
        console.error("Error preparing witness input:", error);
        throw error;
    }
}
