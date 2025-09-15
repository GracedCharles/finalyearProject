import { useOAuth, useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { safeErrorLog, safeLog } from '../../src/utils/safeJson'

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  // Handle Google OAuth sign-up
  const onGoogleSignUp = async () => {
    try {
      setIsLoading(true)
      const { createdSessionId, setActive } = await startOAuthFlow()
      
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId })
        // Use setTimeout to ensure navigation happens after state update
        setTimeout(() => {
          router.replace('/(tabs)/dashboard')
        }, 100)
      }
    } catch (err: any) {
      safeErrorLog('Google OAuth error:', err)
      Alert.alert('Error', 'Failed to sign up with Google. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle the submission of the sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) {
      Alert.alert('Error', 'Authentication system is not ready. Please try again.')
      return
    }

    if (!emailAddress || !password) {
      Alert.alert('Error', 'Please enter both email and password.')
      return
    }

    try {
      setIsLoading(true)
      
      // Create the user on Clerk
      const signUpAttempt = await signUp.create({
        emailAddress,
        password,
      })

      // Check if we're using a placeholder key (demo mode)
      if (!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 
          process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY === 'pk_test_placeholder') {
        // In demo mode, skip email verification
        Alert.alert(
          'Demo Mode',
          'Email verification is disabled in demo mode. You can now sign in with your credentials.',
          [
            { text: 'OK', onPress: () => router.replace('/(auth)/sign-in') }
          ]
        )
        return
      }

      // Send the email verification
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Change the UI to our pending section.
      setPendingVerification(true)
      Alert.alert('Verification Email Sent', 'Please check your email and enter the verification code.')
    } catch (err: any) {
      safeErrorLog('Sign up error:', err)
      
      // Handle specific error cases
      if (err.errors && err.errors.length > 0) {
        const error = err.errors[0]
        console.log('Error code:', error.code)
        if (error.code === 'form_password_pwned') {
          Alert.alert(
            'Password Security Issue',
            'This password has been found in a data breach. Please choose a stronger, unique password with at least 8 characters including uppercase, lowercase, numbers and symbols.',
            [{ text: 'OK' }]
          )
        } else if (error.code === 'form_identifier_exists') {
          Alert.alert(
            'Account Already Exists',
            'An account with this email already exists. Please sign in instead.',
            [
              { text: 'OK' },
              { text: 'Sign In', onPress: () => router.push('/(auth)/sign-in') }
            ]
          )
        } else {
          Alert.alert('Error', error.message || 'An error occurred during sign up. Please try again.')
        }
      } else {
        Alert.alert('Error', 'An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // This verifies the user using email code that is delivered.
  const onPressVerify = async () => {
    if (!isLoaded) {
      Alert.alert('Error', 'Authentication system is not ready. Please try again.')
      return
    }

    if (!code) {
      Alert.alert('Error', 'Please enter the verification code.')
      return
    }

    try {
      setIsLoading(true)
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })

      safeLog('Verification result:', completeSignUp)

      if (completeSignUp.status === 'complete') {
        // Check if we have a session ID
        if (completeSignUp.createdSessionId) {
          await setActive({ session: completeSignUp.createdSessionId })
          // Use setTimeout to ensure navigation happens after state update
          setTimeout(() => {
            router.replace('/(tabs)/dashboard')
          }, 100)
        } else {
          // If no session ID, the user needs to sign in
          Alert.alert('Success', 'Email verified successfully. Please sign in with your credentials.')
          setTimeout(() => {
            router.replace('/(auth)/sign-in')
          }, 100)
        }
      } else if (completeSignUp.status === 'missing_requirements') {
        // Check what's missing
        if (completeSignUp.unverifiedFields?.includes('email_address')) {
          Alert.alert('Error', 'Email verification is still required.')
        } else {
          Alert.alert('Error', 'Additional verification required. Please try again.')
        }
      } else {
        safeErrorLog('Verification error:', completeSignUp)
        Alert.alert('Error', 'Email verification failed. Please try again.')
      }
    } catch (err: any) {
      safeErrorLog('Verification error:', err)
      
      // Handle specific error cases
      if (err.errors && err.errors.length > 0) {
        const error = err.errors[0]
        console.log('Verification error code:', error.code)
        if (error.code === 'verification_already_verified') {
          Alert.alert(
            'Already Verified',
            'This email has already been verified. You can now sign in.',
            [
              { text: 'OK', onPress: () => {
                  setPendingVerification(false)
                  setCode('')
                  router.replace('/(auth)/sign-in')
                } 
              }
            ]
          )
        } else if (error.code === 'form_code_incorrect') {
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

  return (
    <View className="flex-1 bg-gray-100 p-6 justify-center">
      <Text className="text-4xl text-center font-bold text-gray-800 mb-8">Traffic Fine System</Text>
      <View className="rounded-3xl bg-white p-8 shadow-sm">
        {!pendingVerification && (
          <>
            <Text className="text-2xl text-center font-semibold text-gray-800 mb-2">Create Your Account</Text>
            <Text className="text-center text-gray-600 mb-8">Enter your email and password to continue</Text>
          
          {/* Google Sign Up Button */}
          <TouchableOpacity 
            className="w-full bg-white p-4 rounded-lg mb-4 flex-row items-center justify-center border border-gray-200"
            onPress={onGoogleSignUp}
            disabled={isLoading}
          >
            <Text className="text-gray-700 text-center font-medium ml-2">Continue with Google</Text>
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
              onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
            />
          </View>
          
          <View className="w-full mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
            <TextInput
              value={password}
              placeholder="Enter your password"
              secureTextEntry={true}
              className="w-full p-4 border border-gray-300 rounded-lg"
              onChangeText={(password) => setPassword(password)}
            />
          </View>
          
          <TouchableOpacity 
            className="w-full bg-blue-600 p-4 rounded-lg mb-4"
            onPress={onSignUpPress}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-medium">
              {isLoading ? 'Signing up...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
          
          <View className="flex-row items-center justify-center gap-2 mb-4">
            <Text className="text-gray-600 text-center">Already have an account?</Text>
            <Link href="/(auth)/sign-in">
              <Text className="text-blue-600 font-medium text-center">Sign in</Text>
            </Link>
          </View>
          </>
        )}

        {pendingVerification && (
          <>
            <Text className="text-2xl text-center font-semibold text-gray-800 mb-2">Verify Your Email</Text>
            <Text className="text-center text-gray-600 mb-8">We've sent a verification code to your email</Text>
          
          <View className="w-full mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Verification Code</Text>
            <TextInput
              value={code}
              placeholder="Enter verification code"
              className="w-full p-4 border border-gray-300 rounded-lg"
              onChangeText={(code) => setCode(code)}
              keyboardType="number-pad"
              maxLength={6}
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
            className="w-full bg-gray-200 p-4 rounded-lg mb-4"
            onPress={async () => {
              try {
                if (signUp) {
                  await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
                  Alert.alert('Code Resent', 'A new verification code has been sent to your email.')
                }
              } catch (err: any) {
                safeErrorLog('Resend code error:', err)
                Alert.alert('Error', 'Failed to resend code. Please try again.')
              }
            }}
            disabled={isLoading}
          >
            <Text className="text-gray-700 text-center font-medium">Resend Code</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="w-full bg-gray-200 p-4 rounded-lg"
            onPress={() => {
              setPendingVerification(false)
              setCode('')
            }}
          >
            <Text className="text-gray-700 text-center font-medium">Back to Sign Up</Text>
          </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  )
}