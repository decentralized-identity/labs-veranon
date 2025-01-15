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
      // Always create a new identity
      const identity = new Identity();
      const exportedIdentity = identity.export();
      
      // Store the new identity
      await SecureStore.setItemAsync(PRIVATE_KEY_KEY, exportedIdentity);
      
      // Update state and log
      setIdentityCommitment(identity.commitment.toString());
      
      console.log("\nNew Identity Created:");
      console.log("------------------------");
      console.log("Commitment:", identity.commitment.toString());
      console.log("------------------------\n");
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
          Create New Identity
        </Text>
      </Pressable>

      {identityCommitment && (
        <Text className="mt-4 text-gray-700 text-center">
          Current Identity Commitment:{'\n'}{identityCommitment}
        </Text>
      )}
    </View>
  );
} 