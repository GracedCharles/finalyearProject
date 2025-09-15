import { useSignIn } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import React from 'react'
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function PhoneSignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [phoneNumber, setPhoneNumber] = React.useState('')
  const [code, setCode] = React.useState('')
  const [isCodeSent, setIsCodeSent] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  // Send verification code to phone
  const sendCode = async () => {
    if (!isLoaded) return

    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number.')
      return
    }

    try {
      setIsLoading(true)
      await signIn.create({
        strategy: 'phone_code',
        phoneNumber: phoneNumber,
      })
      setIsCodeSent(true)
      Alert.alert('Code Sent', 'Verification code has been sent to your phone.')
    } catch (err: any) {
      console.error('Phone sign-in error:', err)
      
      // Handle specific error cases
      if (err.errors && err.errors.length > 0) {
        const error = err.errors[0]
        if (error.code === 'phone_number_not_supported') {
          Alert.alert(
            'Country Not Supported',
            'Phone numbers from your country are currently not supported. Please use email authentication instead.',
            [
              { text: 'OK' },
              { text: 'Use Email', onPress: () => router.replace('/(auth)/sign-in') }
            ]
          )
        } else {
          Alert.alert('Error', error.message || 'Failed to send verification code. Please try again.')
        }
      } else {
        Alert.alert('Error', 'Failed to send verification code. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Verify the code
  const verifyCode = async () => {
    if (!isLoaded) return

    if (!code) {
      Alert.alert('Error', 'Please enter the verification code.')
      return
    }

    try {
      setIsLoading(true)
      const signInAttempt = await signIn.attemptFirstFactor({
        strategy: 'phone_code',
        code: code,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        // Use setTimeout to ensure navigation happens after state update
        setTimeout(() => {
          router.replace('/(tabs)')
        }, 100)
      } else {
        Alert.alert('Error', 'Verification failed. Please try again.')
      }
    } catch (err: any) {
      console.error('Code verification error:', err)
      Alert.alert('Error', 'Invalid verification code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Resend code
  const resendCode = async () => {
    await sendCode()
  }

  return (
    <View className="flex-1 bg-gray-50 p-6 justify-center">
      <View className="rounded-xl bg-white p-8 shadow-sm">
        <Text className="text-2xl font-semibold text-gray-800 mb-8 text-center">Phone Sign In</Text>
      
      {!isCodeSent ? (
        <>
          <Text className="text-center mb-6 text-gray-600">
            Enter your phone number to receive a verification code
          </Text>
          
          <TextInput
            value={phoneNumber}
            placeholder="+1 (555) 123-4567"
            keyboardType="phone-pad"
            className="w-full p-4 border border-gray-300 rounded-lg mb-6"
            onChangeText={setPhoneNumber}
          />
          
          <TouchableOpacity 
            className="w-full bg-blue-500 p-4 rounded-lg mb-4"
            onPress={sendCode}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-bold">
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text className="text-center mb-6 text-gray-600">
            Enter the verification code sent to {phoneNumber}
          </Text>
          
          <TextInput
            value={code}
            placeholder="123456"
            keyboardType="number-pad"
            className="w-full p-4 border border-gray-300 rounded-lg mb-6"
            onChangeText={setCode}
            maxLength={6}
          />
          
          <TouchableOpacity 
            className="w-full bg-blue-500 p-4 rounded-lg mb-4"
            onPress={verifyCode}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-bold">
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="w-full bg-gray-500 p-4 rounded-lg mb-4"
            onPress={resendCode}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-bold">Resend Code</Text>
          </TouchableOpacity>
        </>
      )}
      
      <TouchableOpacity 
        className="w-full bg-gray-300 p-4 rounded-lg"
        onPress={() => router.back()}
      >
        <Text className="text-gray-700 text-center font-bold">Back to Sign In</Text>
      </TouchableOpacity>
      </View>
    </View>
  )
}
