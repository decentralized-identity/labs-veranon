import { Text, View, Pressable } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRef, useState } from 'react';
import { createWitnessInput } from '../../utils/createWitnessInput';
import { witnessCalculatorCode } from '@/utils/witnessCalculator';
import { groth16Prove } from '@iden3/react-native-rapidsnark';
import { sendVerifyAccountRequest } from '../../utils/gelatoRelayRequest';
import { packGroth16Proof } from "@zk-kit/utils";
import { useTaskStatus } from '../../hooks/useGelatoTaskStatus';

// Temp constants for testing
const GROUP_ID = 1;
const SERVICE_PROVIDER_ID = "1";
const MESSAGE = "3";

export default function Verify() {
  const webviewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [zkeyFilePath, setZkeyFilePath] = useState<string>('');
  const [merkleTreeDepth, setMerkleTreeDepth] = useState<number>(0);
  const { verificationStatus, setVerificationStatus, pollTaskStatus } = useTaskStatus();

  const htmlContent = `
  <html>
    <head>
      <script>
        ${witnessCalculatorCode}

        async function generateWitness(wasmBase64, input) {
          try {
            // Convert base64 WASM to ArrayBuffer
            const binary = base64ToArrayBuffer(wasmBase64);
            
            // Build the witness calculator
            const witnessCalculator = await builder(binary);
            
            // Calculate the witness
            const witness = await witnessCalculator.calculateWTNSBin(input);
            
            // Convert witness to base64 for transfer
            const witnessBase64 = arrayBufferToBase64(witness);
            
            // Send result back to React Native
            window.ReactNativeWebView.postMessage(JSON.stringify({ witness: witnessBase64 }));
          } catch (err) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
              error: err.message,
              stack: err.stack 
            }));
          }
        }

        // Helper functions
        function base64ToArrayBuffer(base64) {
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return bytes.buffer;
        }

        function arrayBufferToBase64(buffer) {
          const binary = Array.from(new Uint8Array(buffer))
            .map(b => String.fromCharCode(b))
            .join('');
          return btoa(binary);
        }
      </script>
    </head>
    <body>
      <div>Ready for witness generation...</div>
    </body>
  </html>
  `;

  const handleGenerateWitness = async () => {
    setIsLoading(true);

    try {
      const scope = SERVICE_PROVIDER_ID;
      const message = MESSAGE;
      const groupId = GROUP_ID;

      const { wasmBase64, input, zkeyFilePath } = await createWitnessInput(scope, message, groupId);
      
      setZkeyFilePath(zkeyFilePath);
      setMerkleTreeDepth(input.merkleProofLength);
      
      // Serialize input for JavaScript
      const serializedInput = JSON.stringify(input, (_, value) => 
        typeof value === 'bigint' ? value.toString() : value
      );

      // Inject the JavaScript code
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
        // Adjust path format for groth16Prove
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

        // Send verification request via Gelato
        setVerificationStatus('Sending verification request...');
        const { taskId } = await sendVerifyAccountRequest(verifyParams);
        setVerificationStatus(`Request sent!`);

        // Start polling for status
        pollTaskStatus(taskId);
      }
    } catch (error) {
      console.error("Error:", error);
      setVerificationStatus('Verification failed: ' + (error as Error).message);
    }
    setIsLoading(false);
  };

  return (
    <View className="flex-1">
      <View className="h-0 w-0">
        <WebView
          ref={webviewRef}
          source={{ html: htmlContent }}
          onMessage={handleMessage}
          javaScriptEnabled
          originWhitelist={['*']}
        />
      </View>
      
      <View className="flex-1 items-center justify-center bg-white">
        <Pressable
          onPress={handleGenerateWitness}
          disabled={isLoading}
          className={`${
            isLoading ? 'bg-gray-400' : 'bg-blue-500 active:bg-blue-600'
          } px-6 py-3 rounded-lg`}
        >
          <Text className="text-white font-semibold text-lg">
            {isLoading ? 'Verifying...' : 'Verify Account'}
          </Text>
        </Pressable>

        {verificationStatus && (
          <Text className="mt-4 text-blue-600 font-medium">
            {verificationStatus}
          </Text>
        )}
      </View>
    </View>
  );
}
