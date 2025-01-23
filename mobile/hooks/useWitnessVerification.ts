import { useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import { createWitnessInput } from '../utils/zkp/createWitnessInput';
import { groth16Prove } from '@iden3/react-native-rapidsnark';
import { sendVerifyAccountRequest } from '../utils/gelatoRelayRequest';
import { packGroth16Proof } from "@zk-kit/utils";
import { useTaskStatus } from './useGelatoTaskStatus';

// Move constants to a config file later if needed
const GROUP_ID = 1;
const SERVICE_PROVIDER_ID = "1";
const MESSAGE = "3";

export function useWitnessVerification() {
  const webviewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [zkeyFilePath, setZkeyFilePath] = useState<string>('');
  const [merkleTreeDepth, setMerkleTreeDepth] = useState<number>(0);
  const { verificationStatus, setVerificationStatus, pollTaskStatus } = useTaskStatus();

  const handleGenerateWitness = async () => {
    setIsLoading(true);

    try {
      const scope = SERVICE_PROVIDER_ID;
      const message = MESSAGE;
      const groupId = GROUP_ID;

      const { wasmBase64, input, zkeyFilePath } = await createWitnessInput(scope, message, groupId);
      
      setZkeyFilePath(zkeyFilePath);
      setMerkleTreeDepth(input.merkleProofLength);
      
      const serializedInput = JSON.stringify(input, (_, value) => 
        typeof value === 'bigint' ? value.toString() : value
      );

      const injectedCode = `
        (function() {
          generateWitness("${wasmBase64}", ${serializedInput});
        })();
      `;
      webviewRef.current?.injectJavaScript(injectedCode);
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
        
      if (data.witness) {
        const zkeyPath = zkeyFilePath.replace('file://', '');
        const snarkProof = await groth16Prove(zkeyPath, data.witness);

        const parsedProof = JSON.parse(snarkProof.proof);
        const packedPoints = packGroth16Proof(parsedProof);
        const publicSignals = JSON.parse(snarkProof.pub_signals);

        const verifyParams = {
          groupId: GROUP_ID,
          proof: {
            points: packedPoints,
            merkleTreeRoot: publicSignals[0],
            nullifier: publicSignals[1],
            message: MESSAGE,
            scope: SERVICE_PROVIDER_ID,
            merkleTreeDepth: merkleTreeDepth
          }
        };

        setVerificationStatus('Sending verification request...');
        const { taskId } = await sendVerifyAccountRequest(verifyParams);
        setVerificationStatus(`Request sent!`);

        pollTaskStatus(taskId);
      }
    } catch (error) {
      console.error("Error:", error);
      setVerificationStatus('Verification failed: ' + (error as Error).message);
    }
    setIsLoading(false);
  };

  return {
    webviewRef,
    isLoading,
    verificationStatus,
    handleGenerateWitness,
    handleMessage
  };
} 