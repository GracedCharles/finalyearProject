import { useRouter } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export default function OnboardingScreen() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.replace('/(auth)')
  }

  return (
    <View className="flex-1 justify-center items-center bg-white p-6">
      <View className="items-center mb-12">
        <Text className="text-4xl font-bold mb-4 text-blue-600">Traffic Fine System</Text>
        <Text className="text-xl text-gray-600 text-center mb-8">
          Digital traffic fine management for officers and drivers
        </Text>
      </View>

      <View className="w-full mb-8">
        <View className="flex-row items-center mb-4">
          <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-4">
            <Text className="text-white font-bold">1</Text>
          </View>
          <Text className="text-lg">Issue traffic fines digitally</Text>
        </View>
        
        <View className="flex-row items-center mb-4">
          <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-4">
            <Text className="text-white font-bold">2</Text>
          </View>
          <Text className="text-lg">Track fine payments</Text>
        </View>
        
        <View className="flex-row items-center mb-4">
          <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-4">
            <Text className="text-white font-bold">3</Text>
          </View>
          <Text className="text-lg">Generate reports and analytics</Text>
        </View>
      </View>

      <TouchableOpacity 
        className="w-full bg-blue-500 p-4 rounded-lg"
        onPress={handleGetStarted}
      >
        <Text className="text-white text-center font-bold text-lg">Get Started</Text>
      </TouchableOpacity>
    </View>
  )
}