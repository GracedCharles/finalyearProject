import { useRouter } from 'expo-router'
import React from 'react'
import { Alert, Text, TouchableOpacity, View } from 'react-native'

export default function DemoMode() {
  const router = useRouter()

  const handleDemoSignIn = () => {
    Alert.alert(
      'Demo Mode',
      'This is a demo mode. In a real app, you would need to sign up with a valid email and password.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue Demo', 
          onPress: () => {
            // In demo mode, we'll skip authentication and go directly to the app
            setTimeout(() => {
              router.replace('/(tabs)/dashboard')
            }, 100)
          }
        }
      ]
    )
  }

  return (
    <View className="flex-1 bg-gray-50 p-6 justify-center">
      <View className="rounded-xl bg-white p-8 shadow-sm">
        <Text className="text-2xl font-semibold text-gray-800 mb-8 text-center">Demo Mode</Text>
        <Text className="text-center mb-6 text-gray-600">
          This is a demonstration of the Traffic Fine System. 
          In a real application, you would need to authenticate with Clerk.
        </Text>
      
      <TouchableOpacity 
        className="w-full bg-green-500 p-4 rounded-lg mb-4"
        onPress={handleDemoSignIn}
      >
        <Text className="text-white text-center font-bold">Continue in Demo Mode</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="w-full bg-blue-500 p-4 rounded-lg"
        onPress={() => router.back()}
      >
        <Text className="text-white text-center font-bold">Back to Sign In</Text>
      </TouchableOpacity>
      </View>
    </View>
  )
}
