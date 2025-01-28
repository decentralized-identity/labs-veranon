import { View, Text, TextInput, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Identity } from "@semaphore-protocol/identity";
import { IDENTITY_KEY } from '../../constants/identities';
import { MANAGER_API_URL, MANAGER_API_KEY } from '@env';

export default function RegisterScreen() {
  const [identityUrl, setIdentityUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      
      if (!MANAGER_API_URL) {
        throw new Error('Manager API URL is not configured');
      }

      // Get identity from secure storage
      const storedIdentity = await SecureStore.getItemAsync(IDENTITY_KEY);
      if (!storedIdentity) {
        throw new Error("No identity found in secure storage");
      }
      
      const identity = Identity.import(storedIdentity);
      const identityCommitment = identity.commitment.toString();

      console.log('Making request with payload:', {
        identityUrl,
        identityCommitment: identityCommitment.substring(0, 20) + '...'
      });

      const response = await fetch(`${MANAGER_API_URL}/register-identity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': MANAGER_API_KEY,
        },

        body: JSON.stringify({
          identityUrl,
          identityCommitment,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      console.log('Identity registered successfully');
      
    } catch (error) {
      console.error('Registration error details:', {
        message: (error as Error).message,
      });
      
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <ScrollView
        contentContainerStyle={{
          padding: 24,
        }}
      >
        <Text className="text-3xl font-bold mb-6 text-center">Register</Text>

        <Text className="text-lg mb-6">
          To register, please provide the complete URL of your public identity profile. 
          The URL should include the full path to your profile information.
        </Text>

        <TextInput
          className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6"
          placeholder="Enter URL"
          placeholderTextColor="#666"
          value={identityUrl}
          onChangeText={setIdentityUrl}
        />

        <Pressable
          className={`${isLoading ? 'bg-blue-400' : 'bg-blue-500'} px-6 py-4 rounded-lg active:bg-blue-600`}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text className="text-white font-semibold text-lg text-center">
            {isLoading ? 'Registering...' : 'Register Identity'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
} 