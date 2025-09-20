import { useSignIn } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function VerifyEmailScreen() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // This verifies the user using email code that is delivered.
  const onPressVerify = async () => {
    if (!isLoaded || !signIn || !setActive) {
      Alert.alert('Error', 'Authentication system is not ready. Please try again.')
      return
    }

    if (!code) {
      Alert.alert('Error', 'Please enter the verification code.')
      return
    }

    try {
      setIsLoading(true)
      const completeSignIn = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code,
      })

      if (completeSignIn.status === 'complete') {
        await setActive({ session: completeSignIn.createdSessionId })
        // Redirect to account setup instead of dashboard
        router.replace('/(auth)/account-setup')
      } else {
        console.log('Verification incomplete:', completeSignIn)
        Alert.alert('Error', 'Email verification failed. Please try again.')
      }
    } catch (err: any) {
      console.log('Verification error:', err)
      
      // Handle specific error cases
      if (err.errors && err.errors.length > 0) {
        const error = err.errors[0]
        
        if (error.code === 'form_code_incorrect') {
          Alert.alert('Error', 'Invalid verification code. Please check and try again.')
        } else if (error.code === 'form_code_expired') {
          Alert.alert('Error', 'Verification code has expired. Please request a new one.')
        } else {
          Alert.alert('Error', error.message || 'An error occurred during verification. Please try again.')
        }
      } else {
        Alert.alert('Error', 'An unexpected error occurred during verification. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while Clerk initializes
  if (!isLoaded) {
    return (
      <View className="flex-1 bg-gray-100 p-6 justify-center items-center">
        <Text className="text-lg">Loading authentication...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-100 p-6 justify-center">
      <Text className="text-4xl text-center font-bold text-gray-800 mb-8">Traffic Fine System</Text>
      <View className="rounded-3xl bg-white p-8 shadow-sm">
        <Text className="text-2xl text-center font-semibold text-gray-800 mb-2">Verify Your Email</Text>
        <Text className="text-center text-gray-600 mb-8">We've sent a verification code to your email address</Text>
        
        <View className="w-full mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">Verification Code</Text>
          <TextInput
            value={code}
            placeholder="Enter verification code"
            className="w-full p-4 border border-gray-300 rounded-lg"
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            editable={!isLoading}
          />
        </View>
        
        <TouchableOpacity 
          className="w-full bg-blue-600 p-4 rounded-lg mb-4"
          onPress={onPressVerify}
          disabled={isLoading}
        >
          <Text className="text-white text-center font-medium">
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="w-full bg-gray-200 p-4 rounded-lg"
          onPress={async () => {
            try {
              if (signIn) {
                // Get the email address ID from the sign-in object
                const emailAddressId = signIn.identifier;
                
                await signIn.prepareFirstFactor({
                  strategy: 'email_code',
                  emailAddressId: signIn.identifier || '',
                })
                Alert.alert('Code Resent', 'A new verification code has been sent to your email.')
              }
            } catch (err: any) {
              console.log('Resend code error:', err)
              Alert.alert('Error', 'Failed to resend code. Please try again.')
            }
          }}
          disabled={isLoading}
        >
          <Text className="text-gray-700 text-center font-medium">Resend Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}