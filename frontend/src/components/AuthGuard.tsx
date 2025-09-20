import { useAuth, useUser } from '@clerk/clerk-expo'
import { usePathname, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

interface AuthGuardProps {
  children: React.ReactNode
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    // Check if we're in demo mode
    const checkDemoMode = () => {
      // In a real app, you might store this in AsyncStorage
      // For now, we'll allow demo mode if Clerk is not properly configured
      if (!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 
          process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY === 'pk_test_dXNhYmxlLXN1bmZpc2gtMS5jbGVyay5hY2NvdW50cy5kZXYk') {
        setIsDemoMode(true)
        return
      }
      
      if (isLoaded && !isSignedIn) {
        console.log('User not signed in, redirecting to auth')
        // Redirect to sign-in page if not authenticated
        router.replace('/(auth)')
      } else if (isLoaded && isSignedIn) {
        console.log('User is signed in')
        console.log('Current pathname:', pathname)
        console.log('User first name:', user?.firstName)
        console.log('User last name:', user?.lastName)
        
        // Check if user is on the account setup page
        if (pathname !== '/(auth)/account-setup') {
          console.log('Not on account setup page, checking if setup is needed')
          // If user doesn't have firstName/lastName or they're empty, redirect to account setup
          if (!user?.firstName || !user?.lastName || user.firstName.trim() === '' || user.lastName.trim() === '') {
            console.log('User needs to complete account setup, redirecting')
            router.replace('/(auth)/account-setup')
          } else {
            console.log('User has completed account setup')
          }
        } else {
          console.log('Already on account setup page')
        }
      }
    }

    checkDemoMode()
  }, [isLoaded, isSignedIn, user, router, pathname])

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