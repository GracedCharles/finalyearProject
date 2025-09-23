import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import React from 'react';

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth()

  // Show loading while checking auth state
  if (!isLoaded) {
    return null
  }

  // Redirect based on authentication status
  if (isSignedIn) {
    return <Redirect href="/(tabs)/dashboard" />
  } else {
    return <Redirect href="/(auth)" />
  }
}