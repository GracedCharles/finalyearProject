import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
import ErrorBoundary from "../src/components/ErrorBoundary";

const queryClient = new QueryClient();

// Get Clerk publishable key from environment
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_placeholder";

// For development, we'll use a placeholder key if none is provided
if (!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  console.warn(
    "Warning: No Clerk publishable key found. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file for full functionality."
  );
}

// Custom Clerk provider that disables telemetry
const CustomClerkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clerk provider options
  const clerkOptions = {
    publishableKey,
    tokenCache,
    // Try to disable telemetry by not including it
  };

  return (
    <ClerkProvider {...clerkOptions}>
      {children}
    </ClerkProvider>
  );
};

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <CustomClerkProvider>
          <QueryClientProvider client={queryClient}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ title: "Home" }} />
              <Stack.Screen name="onboarding" options={{ title: "Onboarding" }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </QueryClientProvider>
        </CustomClerkProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}