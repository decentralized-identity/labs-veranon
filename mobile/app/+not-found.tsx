import { Link } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center p-5">
      <Text className="text-lg dark:text-white">Page not found</Text>
      <Link href="/" className="mt-4 py-2">
        <Text className="text-blue-500 dark:text-blue-400">Go back home</Text>
      </Link>
    </View>
  );
}
