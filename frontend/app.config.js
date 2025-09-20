export default {
  expo: {
    name: "frontend",
    slug: "frontend",
    scheme: "trafficfinesystem",
    extra: {
      clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    },
    plugins: [
      "expo-secure-store"
    ],
  },
};
