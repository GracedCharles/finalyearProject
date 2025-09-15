import { Redirect } from 'expo-router'

export default function AuthIndex() {
  // Redirect to sign-in page by default
  return <Redirect href="/(auth)/sign-in" />
}