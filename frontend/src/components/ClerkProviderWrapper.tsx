import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import React, { useEffect } from "react";
import { clerkProviderOptions, disableClerkTelemetry } from "../utils/clerkUtils";

interface ClerkProviderWrapperProps {
  children: React.ReactNode;
}

// Get Clerk publishable key from environment
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_placeholder";

const ClerkProviderWrapper: React.FC<ClerkProviderWrapperProps> = ({ children }) => {
  useEffect(() => {
    // Disable Clerk telemetry to prevent the error
    disableClerkTelemetry();
  }, []);

  // Clerk provider options with telemetry disabled
  const clerkOptions = {
    publishableKey,
    tokenCache,
    ...clerkProviderOptions,
  };

  return (
    <ClerkProvider {...clerkOptions}>
      {children}
    </ClerkProvider>
  );
};

export default ClerkProviderWrapper;