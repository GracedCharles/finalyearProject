import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { ReactNode, useEffect } from 'react';
import { setAuthToken } from '../utils/authHelpers';

const tokenCache = {
  getToken: (key: string) => SecureStore.getItemAsync(key),
  saveToken: (key: string, token: string) => SecureStore.setItemAsync(key, token),
  removeToken: (key: string) => SecureStore.deleteItemAsync(key),
};

function AuthTokenUpdater() {
  const { getToken } = useAuth();

  useEffect(() => {
    console.log('=== AUTH TOKEN UPDATER ===');
    console.log('AuthTokenUpdater component mounted');
    
    const updateToken = async () => {
      try {
        console.log('Updating auth token...');
        const token = await getToken();
        console.log('Token from Clerk:', token ? 'Available' : 'Not available');
        setAuthToken(token);
        console.log('Auth token updated in global variable');
      } catch (error) {
        console.error('Error updating auth token:', error);
      }
    };

    updateToken();

    // Set up an interval to periodically update the token
    const interval = setInterval(updateToken, 60000); // Update every minute

    return () => {
      console.log('Cleaning up AuthTokenUpdater interval');
      clearInterval(interval);
    };
  }, [getToken]);

  return null;
}

export default function ClerkProviderWrapper({ children }: { children: ReactNode }) {
  console.log('=== CLERK PROVIDER WRAPPER ===');
  console.log('ClerkProviderWrapper rendering');
  
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <AuthTokenUpdater />
      {children}
    </ClerkProvider>
  );
}