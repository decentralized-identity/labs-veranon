import { Text, View, Pressable } from 'react-native';
import { WebView } from 'react-native-webview';
import { useWitnessVerification } from '../../hooks/useWitnessVerification';
import { getWitnessWebViewContent } from '@/utils/zkp/witnessWebView';

export default function Verify() {
  const {
    webviewRef,
    isLoading,
    verificationStatus,
    handleGenerateWitness,
    handleMessage
  } = useWitnessVerification();

  return (
    <View className="flex-1">
      <View className="h-0 w-0">
        <WebView
          ref={webviewRef}
          source={{ html: getWitnessWebViewContent() }}
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
