import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { useEffect, type ReactNode } from 'react';
import { setAuthToken } from '../lib/authHelpers';

// Make sure to add your Clerk publishable key to your environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key. Please set VITE_CLERK_PUBLISHABLE_KEY in your environment variables.");
}

function AuthTokenUpdater() {
  const { getToken } = useAuth();

  useEffect(() => {
    console.log('=== ADMIN DASHBOARD AUTH TOKEN UPDATER ===');
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
  console.log('=== ADMIN DASHBOARD CLERK PROVIDER WRAPPER ===');
  console.log('ClerkProviderWrapper rendering');
  
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
    >
      <AuthTokenUpdater />
      {children}
    </ClerkProvider>
  );
}