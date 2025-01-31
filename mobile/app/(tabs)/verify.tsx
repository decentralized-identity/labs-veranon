import { Text, View, Pressable, TextInput } from 'react-native';
import { WebView } from 'react-native-webview';
import { useWitnessVerification } from '../../hooks/useWitnessVerification';
import { getWitnessWebViewContent } from '@/utils/zkp/witnessWebView';
import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';

export default function Verify() {
  const params = useLocalSearchParams();
  const [scope, setScope] = useState('');
  const [message, setMessage] = useState('');
  const [isPreFilled, setIsPreFilled] = useState(false);

  const {
    webviewRef,
    isLoading,
    verificationStatus,
    handleGenerateWitness,
    handleMessage
  } = useWitnessVerification({ scope, message });

  useEffect(() => {
    const serviceProviderId = params.serviceProviderId as string;
    const accountId = params.accountId as string;
    
    console.log("Received params:", { serviceProviderId, accountId });
    
    if (serviceProviderId && accountId) {
      console.log("Setting scope and message");
      setScope(serviceProviderId);
      setMessage(accountId);
      setIsPreFilled(true);
    }
  }, [params.serviceProviderId, params.accountId]);

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
        <TextInput
          value={scope}
          onChangeText={setScope}
          placeholder="Enter Service Provider ID"
          className={`w-64 p-3 mb-4 border border-gray-300 rounded-lg ${
            isPreFilled ? 'bg-gray-100' : ''
          }`}
          keyboardType="numeric"
          editable={!isPreFilled}
        />
        
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Enter Account ID"
          className={`w-64 p-3 mb-4 border border-gray-300 rounded-lg ${
            isPreFilled ? 'bg-gray-100' : ''
          }`}
          keyboardType="numeric"
          editable={!isPreFilled}
        />

        <Pressable
          onPress={handleGenerateWitness}
          disabled={isLoading || !scope || !message}
          className={`${
            isLoading || !scope || !message ? 'bg-gray-400' : 'bg-blue-500 active:bg-blue-600'
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
