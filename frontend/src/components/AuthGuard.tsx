import { useAuth } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

interface AuthGuardProps {
  children: React.ReactNode
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    // Check if we're in demo mode (you can set this via AsyncStorage or a global state)
    // For now, we'll check if the user came from demo mode
    const checkDemoMode = () => {
      // In a real app, you might store this in AsyncStorage
      // For now, we'll allow demo mode if Clerk is not properly configured
      if (!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 
          process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY === 'pk_test_placeholder') {
        setIsDemoMode(true)
        return
      }
      
      if (isLoaded && !isSignedIn) {
        // Redirect to sign-in page if not authenticated
        setTimeout(() => {
          router.replace('/(auth)')
        }, 100)
      }
    }

    checkDemoMode()
  }, [isLoaded, isSignedIn, router])

  // Show loading indicator while checking auth state
  if (!isLoaded && !isDemoMode) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4">Loading...</Text>
      </View>
    )
  }

  // Allow access in demo mode or if signed in
  return (isSignedIn || isDemoMode) ? <>{children}</> : null
}
