import { Stack } from "expo-router";
import React from "react";

export default function AuthRoutesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Sign In" }} />
      <Stack.Screen name="sign-up" options={{ title: "Sign Up" }} />
      <Stack.Screen name="verify-email" options={{ title: "Verify Email" }} />
      <Stack.Screen name="account-setup" options={{ title: "Account Setup" }} />
      <Stack.Screen name="demo" options={{ title: "Demo Mode" }} />
      <Stack.Screen name="phone-signin" options={{ title: "Phone Sign In" }} />
      <Stack.Screen name="phone-signup" options={{ title: "Phone Sign Up" }} />
    </Stack>
  );
}