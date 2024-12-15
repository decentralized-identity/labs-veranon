import { Text, View, Pressable } from "react-native";
import { Identity } from "@semaphore-protocol/identity";
import * as SecureStore from 'expo-secure-store';
import { useState, useEffect } from 'react';

const PRIVATE_KEY_KEY = 'semaphore_private_key-1';

export default function IdentityScreen() {
  const [identityCommitment, setIdentityCommitment] = useState<string | null>(null);

  useEffect(() => {
    checkExistingIdentity();
  }, []);

  const checkExistingIdentity = async () => {
    try {
      const storedIdentity = await SecureStore.getItemAsync(PRIVATE_KEY_KEY);
      if (storedIdentity) {
        // Use the proper import method to recreate identity from stored base64 string
        const identity = Identity.import(storedIdentity);
        setIdentityCommitment(identity.commitment.toString());
        console.log("Found existing identity commitment:", identity.commitment.toString());
      }
    } catch (error) {
      console.error("Error checking identity:", error);
    }
  };

  const handlePress = async () => {
    try {
      const storedIdentity = await SecureStore.getItemAsync(PRIVATE_KEY_KEY);
      
      if (storedIdentity) {
        // If we already have an identity, just display it
        const identity = Identity.import(storedIdentity);
        console.log("Using existing identity commitment:", identity.commitment.toString());
        return;
      }

      // Create a new random identity
      const identity = new Identity();
      
      // Export the identity to base64 string for storage
      const exportedIdentity = identity.export();
      await SecureStore.setItemAsync(PRIVATE_KEY_KEY, exportedIdentity);
      
      setIdentityCommitment(identity.commitment.toString());
      
      console.log("New Semaphore Identity Created!");
      console.log("Commitment:", identity.commitment.toString());
    } catch (error) {
      console.error("Error creating/storing identity:", error);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 justify-center items-center p-4">
      <Pressable 
        className="bg-blue-500 px-6 py-3 rounded-lg active:bg-blue-600"
        onPress={handlePress}
      >
        <Text className="text-white font-semibold text-lg">
          {identityCommitment ? 'Check Identity' : 'Create Identity'}
        </Text>
      </Pressable>

      {identityCommitment && (
        <Text className="mt-4 text-gray-700 text-center">
          Identity Commitment:{'\n'}{identityCommitment}
        </Text>
      )}
    </View>
  );
} 