import { useSignIn } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import React from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function VerifyEmailScreen() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [code, setCode] = React.useState('')

  // This verifies the user using email code that is delivered.
  const onPressVerify = async () => {
    if (!isLoaded) return

    try {
      const completeSignIn = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code,
      })

      if (completeSignIn.status === 'complete') {
        await setActive({ session: completeSignIn.createdSessionId })
        router.replace('/(tabs)/dashboard')
      } else {
        console.error(JSON.stringify(completeSignIn, null, 2))
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <View className="flex-1 justify-center items-center bg-white p-6">
      <Text className="text-3xl font-bold mb-8">Verify Email</Text>
      <Text className="text-center mb-6">
        We've sent a verification code to your email address. Please enter it below.
      </Text>
      
      <TextInput
        value={code}
        placeholder="Verification Code"
        className="w-full p-4 border border-gray-300 rounded-lg mb-6"
        onChangeText={(code) => setCode(code)}
      />
      
      <TouchableOpacity 
        className="w-full bg-blue-500 p-4 rounded-lg"
        onPress={onPressVerify}
      >
        <Text className="text-white text-center font-bold">Verify Email</Text>
      </TouchableOpacity>
    </View>
  )
}