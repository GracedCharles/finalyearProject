import { Stack } from "expo-router";
import React from "react";
import ErrorBoundary from "../../src/components/ErrorBoundary";

export default function AuthRoutesLayout() {
  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: "Sign In" }} />
        <Stack.Screen name="sign-in" options={{ title: "Sign In" }} />
        <Stack.Screen name="sign-up" options={{ title: "Sign Up" }} />
        <Stack.Screen name="verify-email" options={{ title: "Verify Email" }} />
        <Stack.Screen name="account-setup" options={{ title: "Account Setup" }} />
      </Stack>
    </ErrorBoundary>
  );
}