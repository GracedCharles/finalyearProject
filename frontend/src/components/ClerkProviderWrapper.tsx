import { ClerkProvider } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { ReactNode } from 'react';

const tokenCache = {
  getToken: (key: string) => SecureStore.getItemAsync(key),
  saveToken: (key: string, token: string) => SecureStore.setItemAsync(key, token),
  removeToken: (key: string) => SecureStore.deleteItemAsync(key),
};

export default function ClerkProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      {children}
    </ClerkProvider>
  );
}