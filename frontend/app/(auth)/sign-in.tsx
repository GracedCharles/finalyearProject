import { useOAuth, useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  // Handle Google OAuth sign-in
  const onGoogleSignIn = async () => {
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
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle phone number sign-in
  const onPhoneSignIn = () => {
    router.push('/(auth)/phone-signin')
  }

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return

    if (!emailAddress || !password) {
      Alert.alert('Error', 'Please enter both email and password.')
      return
    }

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        // Use setTimeout to ensure navigation happens after state update
        setTimeout(() => {
          router.replace('/(tabs)')
        }, 100)
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2))
        Alert.alert('Error', 'Sign-in process incomplete. Please try again.')
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
      
      // Handle specific error cases
      if (err.errors && err.errors.length > 0) {
        const error = err.errors[0]
        if (error.code === 'form_identifier_not_found') {
          Alert.alert(
            'Account Not Found',
            'No account found with this email address. Please check your email or sign up for a new account.',
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
    }
  }

  return (
    <View className="flex-1 bg-gray-100 p-6 justify-center">
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
          onPress={onSignInPress}
          disabled={isLoading}
        >
          <Text className="text-white text-center font-medium">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
        
        <View className="flex-row items-center justify-center gap-2 mb-4">
          <Text className="text-gray-600 text-center">Don't have an account?</Text>
          <Link href="/(auth)/sign-up">
            <Text className="text-blue-600 font-medium text-center">Sign up</Text>
          </Link>
        </View>
      </View>
    </View>
  )
}