import { useOAuth, useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native'

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
          router.replace('/(tabs)')
        }, 100)
      }
    } catch (err: any) {
      console.error('Google OAuth error:', err)
      Alert.alert('Error', 'Failed to sign up with Google. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle phone number sign-up
  const onPhoneSignUp = () => {
    router.push('/(auth)/phone-signup')
  }

  // Handle the submission of the sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    if (!emailAddress || !password) {
      Alert.alert('Error', 'Please enter both email and password.')
      return
    }

    try {
      setIsLoading(true)
      
      // Create the user on Clerk
      await signUp.create({
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
      console.error(JSON.stringify(err, null, 2))
      
      // Handle specific error cases
      if (err.errors && err.errors.length > 0) {
        const error = err.errors[0]
        if (error.code === 'form_password_pwned') {
          Alert.alert(
            'Password Security Issue',
            'This password has been found in a data breach. Please choose a stronger, unique password.',
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
          Alert.alert('Error', error.message || 'An error occurred during sign up.')
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
    if (!isLoaded) return

    if (!code) {
      Alert.alert('Error', 'Please enter the verification code.')
      return
    }

    try {
      setIsLoading(true)
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId })
        // Use setTimeout to ensure navigation happens after state update
        setTimeout(() => {
          router.replace('/(tabs)')
        }, 100)
      } else if (completeSignUp.status === 'missing_requirements') {
        // Check what's missing
        if (completeSignUp.unverifiedFields?.includes('email_address')) {
          Alert.alert('Error', 'Email verification is still required.')
        } else {
          Alert.alert('Error', 'Additional verification required. Please try again.')
        }
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2))
        Alert.alert('Error', 'Email verification failed. Please try again.')
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
      
      // Handle specific error cases
      if (err.errors && err.errors.length > 0) {
        const error = err.errors[0]
        if (error.code === 'verification_already_verified') {
          Alert.alert(
            'Already Verified',
            'This email has already been verified. You can now sign in.',
            [
              { text: 'OK', onPress: () => router.replace('/(auth)/sign-in') }
            ]
          )
        } else if (error.code === 'form_code_incorrect') {
          Alert.alert('Error', 'Invalid verification code. Please check and try again.')
        } else if (error.code === 'form_code_expired') {
          Alert.alert('Error', 'Verification code has expired. Please request a new one.')
        } else {
          Alert.alert('Error', error.message || 'An error occurred during verification.')
        }
      } else {
        Alert.alert('Error', 'An unexpected error occurred during verification.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-gray-50 p-6 justify-center">
      <View className="rounded-xl bg-white p-8 shadow-sm">
        {!pendingVerification && (
          <>
            <Text className="text-2xl font-semibold text-gray-800 mb-8 text-center">Create Your Account</Text>
          
          {/* Google Sign Up Button */}
          <TouchableOpacity 
            className="w-full bg-red-500 p-4 rounded-lg mb-4 flex-row items-center justify-center"
            onPress={onGoogleSignUp}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-bold ml-2">Sign up with Google</Text>
          </TouchableOpacity>
          
          {/* Phone Sign Up Button */}
          <TouchableOpacity 
            className="w-full bg-green-500 p-4 rounded-lg mb-6 flex-row items-center justify-center"
            onPress={onPhoneSignUp}
          >
            <Text className="text-white text-center font-bold ml-2">Sign up with Phone</Text>
          </TouchableOpacity>
          
          {/* Divider */}
          <View className="flex-row items-center w-full mb-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500">or</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>
          
          {/* Email/Password Form */}
          <TextInput
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Email"
            className="w-full p-4 border border-gray-300 rounded-lg mb-4"
            onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
          />
          
          <TextInput
            value={password}
            placeholder="Password"
            secureTextEntry={true}
            className="w-full p-4 border border-gray-300 rounded-lg mb-6"
            onChangeText={(password) => setPassword(password)}
          />
          
          <TouchableOpacity 
            className="w-full bg-blue-500 p-4 rounded-lg mb-4"
            onPress={onSignUpPress}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-bold">
              {isLoading ? 'Signing up...' : 'Sign up with Email'}
            </Text>
          </TouchableOpacity>
          
            <View className="flex-row gap-2 justify-center">
              <Text className="text-gray-600">Already have an account?</Text>
              <Link href="/(auth)/sign-in">
                <Text className="text-blue-600 font-medium">Sign in</Text>
              </Link>
            </View>
          </>
        )}

        {pendingVerification && (
          <>
            <Text className="text-2xl font-semibold text-gray-800 mb-8 text-center">Verify Your Email</Text>
            <Text className="text-center mb-6 text-gray-600">
              We've sent a verification code to your email address. Please enter it below.
            </Text>
          
          <TextInput
            value={code}
            placeholder="Verification Code"
            className="w-full p-4 border border-gray-300 rounded-lg mb-6"
            onChangeText={(code) => setCode(code)}
            keyboardType="number-pad"
            maxLength={6}
          />
          
          <TouchableOpacity 
            className="w-full bg-blue-500 p-4 rounded-lg mb-4"
            onPress={onPressVerify}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-bold">
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="w-full bg-gray-500 p-4 rounded-lg mb-4"
            onPress={async () => {
              try {
                if (signUp) {
                  await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
                  Alert.alert('Code Resent', 'A new verification code has been sent to your email.')
                }
              } catch (err) {
                Alert.alert('Error', 'Failed to resend code. Please try again.')
              }
            }}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-bold">Resend Code</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="w-full bg-gray-300 p-4 rounded-lg"
            onPress={() => {
              setPendingVerification(false)
              setCode('')
            }}
          >
            <Text className="text-gray-700 text-center font-bold">Back to Sign Up</Text>
          </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  )
}