import React from 'react';
import { Text, View, Pressable, ScrollView, SafeAreaView, Modal } from "react-native";
import { Identity } from "@semaphore-protocol/identity";
import * as SecureStore from 'expo-secure-store';
import { useState, useEffect } from 'react';
import { IDENTITY_KEY } from '../../constants/identities';

export default function IdentityScreen() {
  const [identityCommitment, setIdentityCommitment] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    checkExistingIdentity();
  }, []);

  const checkExistingIdentity = async () => {
    try {
      const storedIdentity = await SecureStore.getItemAsync(IDENTITY_KEY);
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
      await SecureStore.setItemAsync(IDENTITY_KEY, exportedIdentity);
      
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

  const handlePressGenerate = () => {
    setShowConfirmModal(true);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <View style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={{ 
            paddingTop: 24, 
            paddingHorizontal: 24, 
            paddingBottom: 140 
          }}
        >
          <Text className="text-3xl font-bold mb-6 text-center">Identity Management</Text>
          
          <Text className="text-lg mb-6">
            Your identity is the foundation of anonymous verification. It's a unique value that allows you to prove your identity without revealing personal information.
          </Text>

          {identityCommitment ? (
            <>
              <View className="mb-6">
                <Text className="text-lg font-medium mb-2">Your Current Identity:</Text>
                <View className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <Text className="text-gray-700 font-mono text-sm break-all">
                    {identityCommitment}
                  </Text>
                </View>
              </View>

              {/* <View className="mb-6">
                <Text className="text-lg font-medium mb-2">Current Group Registrations:</Text>
                <View className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-700 text-base">Group 1</Text>
                    <Text className="text-sm text-gray-500">Registered</Text>
                  </View>
                </View>
              </View> */}
            </>
          ) : (
            <Text className="text-lg mb-6 text-gray-600 italic">
              No identity found. Create one to get started.
            </Text>
          )}
        </ScrollView>

        <View 
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} 
          className="px-6 py-6 bg-white border-t border-gray-200 pb-8"
        >
          <Pressable 
            className="bg-gray-500 px-6 py-4 rounded-lg active:bg-gray-600 mb-3 mx-12"
            onPress={handlePressGenerate}
          >
            <Text className="text-white font-semibold text-lg text-center">
              {identityCommitment ? 'Generate New Identity' : 'Create Identity'}
            </Text>
          </Pressable>

          <Text className="text-sm text-gray-600 text-center">
            Note: Creating a new identity will replace your existing one.
          </Text>
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={showConfirmModal}
          onRequestClose={() => setShowConfirmModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white rounded-lg p-6 m-6 w-5/6 max-w-sm">
              <Text className="text-xl font-bold mb-4">Confirm New Identity</Text>
              
              <Text className="text-gray-600 mb-6">
                Creating a new identity will permanently replace your existing one. Any group registrations associated with your current identity will be lost.
              </Text>

              <View className="flex-row justify-end">
                <Pressable
                  className="px-4 py-2 rounded-lg bg-gray-200 mr-4"
                  onPress={() => setShowConfirmModal(false)}
                >
                  <Text className="text-gray-800 font-medium">Cancel</Text>
                </Pressable>

                <Pressable
                  className="px-4 py-2 rounded-lg bg-blue-500"
                  onPress={() => {
                    setShowConfirmModal(false);
                    handlePress();
                  }}
                >
                  <Text className="text-white font-medium">Confirm</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
} 