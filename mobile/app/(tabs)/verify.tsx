import { Text, View, Pressable, ScrollView } from 'react-native';
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
    
    if (serviceProviderId && accountId) {
      console.log("Setting scope and message");
      setScope(serviceProviderId);
      setMessage(accountId);
      setIsPreFilled(true);
    }
  }, [params.serviceProviderId, params.accountId]);

  return (
    <View className="flex-1 bg-white">
      <View className="h-0 w-0">
        <WebView
          ref={webviewRef}
          source={{ html: getWitnessWebViewContent() }}
          onMessage={handleMessage}
          javaScriptEnabled
          originWhitelist={['*']}
        />
      </View>
      
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Text className="text-4xl font-extrabold text-center mb-2">
          {params.applicationName}
        </Text>
        <Text className="text-xl text-center mb-6">
          is requesting ID Verification
        </Text>

        {/* <Text className="text-sm font-medium mb-2 text-gray-700">Service Provider ID</Text>
        <TextInput
          value={scope}
          onChangeText={setScope}
          placeholder="Enter Service Provider ID"
          className={`w-full p-4 mb-4 border border-gray-200 rounded-lg ${
            isPreFilled ? 'bg-gray-50' : 'bg-gray-50'
          }`}
          keyboardType="numeric"
          editable={!isPreFilled}
        />
        
        <Text className="text-sm font-medium mb-2 text-gray-700">Account ID</Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Enter Account ID"
          className={`w-full p-4 mb-6 border border-gray-200 rounded-lg ${
            isPreFilled ? 'bg-gray-50' : 'bg-gray-50'
          }`}
          keyboardType="numeric"
          editable={!isPreFilled}
        /> */}

        <Pressable
          onPress={handleGenerateWitness}
          disabled={isLoading || !scope || !message}
          className={`${
            isLoading || !scope || !message ? 'bg-gray-400' : 'bg-blue-500 active:bg-blue-600'
          } px-6 py-4 rounded-lg`}
        >
          <Text className="text-white font-semibold text-lg text-center">
            {isLoading ? 'Verifying...' : 'Verify Account'}
          </Text>
        </Pressable>

        {verificationStatus && (
          <Text className="mt-4 text-blue-600 font-medium text-center">
            {verificationStatus}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
