import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-white px-6">
      <View className="py-12">
        <Text className="text-3xl font-bold mb-6 text-center">Welcome to VerAnon</Text>
        
        <Text className="text-lg mb-4">
          Securely and anonymously verify your identity in a few easy steps.
        </Text>

        <Text className="text-lg mb-4">
          Getting started is simple:
        </Text>
        
        <View className="mb-4 pl-4">
          <Pressable 
            onPress={() => router.push('/identity')}
            className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200 active:bg-gray-100"
          >
            <Text className="text-lg font-medium">1. Manage your identity and registrations</Text>
            <Text className="text-gray-600 mt-1">Tap to manage your identity →</Text>
          </Pressable>

          <Pressable 
            onPress={() => router.push('/register')}
            className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200 active:bg-gray-100"
          >
            <Text className="text-lg font-medium">2. Establish a new registration</Text>
            <Text className="text-gray-600 mt-1">Tap to create registration →</Text>
          </Pressable>

          <Pressable 
            onPress={() => router.push('/verify')}
            className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200 active:bg-gray-100"
          >
            <Text className="text-lg font-medium">3. Verify your identity anonymously</Text>
            <Text className="text-gray-600 mt-1">Tap to verify →</Text>
          </Pressable>
        </View>

        <Text className="text-lg mb-4">
          Register your identity once, and you'll be able to verify yourself with multiple participating applications - all while keeping your personal information completely private.
        </Text>
      </View>
    </ScrollView>
  );
} 