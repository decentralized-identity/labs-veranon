import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTitle: () => (
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>VerAnon</Text>
          </View>
        ),
        tabBarActiveTintColor: '#3b82f6', // blue-500
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="identity"
        options={{
          tabBarLabel: 'Identity',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="register"
        options={{
          tabBarLabel: 'Register',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'add-circle' : 'add-circle-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="verify"
        options={{
          tabBarLabel: 'Verify',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
