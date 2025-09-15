import 'expo-router/entry';
import { Platform } from 'react-native';
import { initializeClerk } from './src/utils/clerkUtils';

// Initialize Clerk with telemetry disabled
if (Platform.OS === 'web') {
  initializeClerk();
}