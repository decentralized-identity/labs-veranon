import { Text, View, Pressable } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRef, useState } from 'react';

export default function Verify() {
  const webviewRef = useRef<WebView>(null);
  const [witness, setWitness] = useState<string | null>(null);

  const htmlContent = `
    <html>
      <head>
        <script src="https://unpkg.com/snarkjs@latest/dist/snarkjs.min.js"></script>
      </head>
      <body>
        <script>
          async function generateWitness() {
            try {
              // snarkjs.wtns.calculate()
              const mockWitness = { witness: "witness" };
              window.ReactNativeWebView.postMessage(JSON.stringify(mockWitness));
            } catch (error) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ error: error.message }));
            }
          }
        </script>
      </body>
    </html>
  `;

  const handlePress = () => {
    console.log('Triggering witness generation...');
    webviewRef.current?.injectJavaScript('generateWitness()');
  };

  const handleWebViewMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.error) {
      console.error('Witness generation error:', data.error);
      return;
    }
    console.log('Witness generated:', data.witness);
    setWitness(data.witness);
  };

  return (
    <View className="flex-1">
      <View className="h-0 w-0">
        <WebView
          ref={webviewRef}
          source={{ html: htmlContent }}
          onMessage={handleWebViewMessage}
        />
      </View>
      
      <View className="flex-1 items-center justify-center bg-white">
        <Pressable
          onPress={handlePress}
          className="bg-blue-500 px-6 py-3 rounded-lg active:bg-blue-600"
        >
          <Text className="text-white font-semibold text-lg">
            Generate Witness
          </Text>
        </Pressable>
        
        {witness && (
          <Text className="mt-4 text-gray-700">
            Witness Generated: {witness}
          </Text>
        )}
      </View>
    </View>
  );
} 