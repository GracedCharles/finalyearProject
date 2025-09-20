import { useOAuth, useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Page() {
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Clerk hooks - v2.15.0 has better initialization
  const { isLoaded, signIn, setActive } = useSignIn()
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })
  
  const router = useRouter()

  // Handle Google OAuth sign-in
  const onGoogleSignIn = async () => {
    if (!isLoaded || !startOAuthFlow) {
      Alert.alert('Error', 'Authentication system is not ready. Please try again.')
      return
    }
    
    try {
      setIsLoading(true)
      const { createdSessionId, setActive: oauthSetActive } = await startOAuthFlow()
      
      if (createdSessionId && oauthSetActive) {
        await oauthSetActive({ session: createdSessionId })
        router.replace('/(tabs)/dashboard')
      }
    } catch (err: any) {
      console.log('Google OAuth error:', err)
      // Check if it's a user cancellation error
      if (err?.errors?.[0]?.code === 'oauth_callback_error') {
        // User cancelled, no need to show error
        return
      }
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded || !signIn || !setActive) {
      Alert.alert('Error', 'Authentication system is not ready. Please try again.')
      return
    }

    if (!emailAddress || !password) {
      Alert.alert('Error', 'Please enter both email and password.')
      return
    }

    try {
      setIsLoading(true)
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/(tabs)/dashboard')
      } else {
        // Handle incomplete sign-in
        if (signInAttempt.status === 'needs_first_factor') {
          Alert.alert('Verification Required', 'Please check your email for verification code.')
        } else if (signInAttempt.status === 'needs_second_factor') {
          Alert.alert('2FA Required', 'Please enter your two-factor authentication code.')
        } else {
          Alert.alert('Incomplete', 'Sign-in process not completed. Please try again.')
        }
      }
    } catch (err: any) {
      console.log('Sign in error:', err)
      
      // Handle specific error cases
      if (err.errors && err.errors.length > 0) {
        const error = err.errors[0]
        
        if (error.code === 'form_identifier_not_found') {
          Alert.alert(
            'Account Not Found',
            'No account found with this email address.',
            [
              { text: 'OK' },
              { text: 'Sign Up', onPress: () => router.push('/(auth)/sign-up') }
            ]
          )
        } else if (error.code === 'form_password_incorrect') {
          Alert.alert('Error', 'Incorrect password. Please try again.')
        } else {
          Alert.alert('Error', error.message || 'An error occurred during sign in.')
        }
      } else {
        Alert.alert('Error', 'An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while Clerk initializes
  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 p-6 justify-center items-center">
        <Text className="text-lg">Loading authentication...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-6 justify-center">
      <Text className="text-4xl text-center font-bold text-gray-800 mb-8">Traffic Fine System</Text>
      <View className="rounded-3xl bg-white p-8 shadow-sm">
        <Text className="text-2xl text-center font-semibold text-gray-800 mb-2">Sign In to Your Account</Text>
        <Text className="text-center text-gray-600 mb-8">Enter your email and password to continue</Text>
        
        {/* Google Sign In Button */}
        <TouchableOpacity 
          className="w-full bg-white p-4 rounded-lg mb-4 flex-row items-center justify-center border border-gray-200"
          onPress={onGoogleSignIn}
          disabled={isLoading}
        >
          <Image source={require('../../assets/google.png')} className="w-6 h-6 mr-2" />
          <Text className="text-gray-700 text-center font-medium ml-2">
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>
        
        {/* Divider */}
        <View className="flex-row items-center w-full mb-6">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="mx-4 text-gray-500 text-sm">or continue with email</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>
        
        {/* Email/Password Form */}
        <View className="w-full mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
          <TextInput
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Enter your email"
            className="w-full p-4 border border-gray-300 rounded-lg"
            onChangeText={setEmailAddress}
            editable={!isLoading}
          />
        </View>
        
        <View className="w-full mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
          <TextInput
            value={password}
            placeholder="Enter your password"
            secureTextEntry={true}
            className="w-full p-4 border border-gray-300 rounded-lg"
            onChangeText={setPassword}
            editable={!isLoading}
          />
        </View>
        
        <TouchableOpacity 
          className="w-full bg-blue-600 p-4 rounded-lg mb-4"
          onPress={onSignInPress}
          disabled={isLoading}
        >
          <Text className="text-white text-center font-medium">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
        
        <View className="flex-row items-center justify-center gap-2 mb-4">
          <Text className="text-gray-600 text-center">Don't have an account?</Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text className="text-blue-600 font-medium text-center">Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  )
}