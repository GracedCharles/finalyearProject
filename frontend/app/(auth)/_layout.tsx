import { Stack } from "expo-router";
import React, { useEffect } from "react";
import ErrorBoundary from "../../src/components/ErrorBoundary";
import { disableClerkTelemetry } from "../../src/utils/clerkUtils";

export default function AuthRoutesLayout() {
  useEffect(() => {
    // Disable Clerk telemetry to prevent the error
    disableClerkTelemetry();
  }, []);

  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: "Sign In" }} />
        <Stack.Screen name="sign-up" options={{ title: "Sign Up" }} />
        <Stack.Screen name="verify-email" options={{ title: "Verify Email" }} />
        <Stack.Screen name="account-setup" options={{ title: "Account Setup" }} />
        <Stack.Screen name="demo" options={{ title: "Demo Mode" }} />
      </Stack>
    </ErrorBoundary>
  );
}