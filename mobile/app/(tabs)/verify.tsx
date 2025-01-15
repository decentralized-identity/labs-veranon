import { Text, View, Pressable } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRef, useState } from 'react';
import { createWitnessInput } from '../../utils/createWitnessInput';
import { witnessCalculatorCode } from '@/utils/witnessCalculator';
import { groth16Prove } from '@iden3/react-native-rapidsnark';

export default function Verify() {
  const webviewRef = useRef<WebView>(null);
  const [witnessStatus, setWitnessStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [zkeyBase64, setZkeyBase64] = useState<string>('');

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
    setWitnessStatus('Preparing witness data...');

    try {
      // TODO: get scope and message from UI inputs
      const scope = "2";
      const message = "3";
      const { wasmBase64, input, zkeyBase64 } = await createWitnessInput(scope, message);
      setZkeyBase64(zkeyBase64);
      
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
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setWitnessStatus('Error: ' + message);
      setIsLoading(false);
    }
  };

  const handleMessage = async (event: any) => {
    try {
        const data = JSON.parse(event.nativeEvent.data);
        
        if (data.witness) {
            const proof = await groth16Prove(zkeyBase64, data.witness);

            console.log("\nVerification Inputs:");
            console.log("------------------------");
            console.log("Proof:", JSON.stringify(JSON.parse(proof.proof), null, 2));
            console.log("Public Signals:", JSON.stringify(JSON.parse(proof.pub_signals), null, 2));
        }
    } catch (error) {
        console.error("Error:", error);
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
            {isLoading ? 'Generating...' : 'Generate Witness'}
          </Text>
        </Pressable>
        
        {witnessStatus && (
          <Text className="mt-4 text-gray-700">
            {witnessStatus}
          </Text>
        )}
      </View>
    </View>
  );
}