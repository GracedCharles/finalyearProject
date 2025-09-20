import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
import ClerkProviderWrapper from "../src/components/ClerkProviderWrapper";
import ErrorBoundary from "../src/components/ErrorBoundary";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ClerkProviderWrapper>
          <QueryClientProvider client={queryClient}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ title: "Home" }} />
              <Stack.Screen name="onboarding" options={{ title: "Onboarding" }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </QueryClientProvider>
        </ClerkProviderWrapper>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}