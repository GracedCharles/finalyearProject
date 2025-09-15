import { useUser } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import React from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function AccountSetupScreen() {
  const { user } = useUser()
  const router = useRouter()

  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')

  const handleCompleteSetup = async () => {
    if (!firstName || !lastName) {
      return
    }

    try {
      // Update user profile
      await user?.update({
        firstName,
        lastName,
      })

      // Navigate to main app
      router.replace('/(tabs)/dashboard')
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  return (
    <View className="flex-1 justify-center items-center bg-white p-6">
      <Text className="text-3xl font-bold mb-8">Complete Your Profile</Text>
      <Text className="text-center mb-6 text-gray-600">
        Please provide your name to complete your account setup.
      </Text>
      
      <TextInput
        value={firstName}
        placeholder="First Name"
        className="w-full p-4 border border-gray-300 rounded-lg mb-4"
        onChangeText={setFirstName}
      />
      
      <TextInput
        value={lastName}
        placeholder="Last Name"
        className="w-full p-4 border border-gray-300 rounded-lg mb-6"
        onChangeText={setLastName}
      />
      
      <TouchableOpacity 
        className="w-full bg-blue-500 p-4 rounded-lg"
        onPress={handleCompleteSetup}
      >
        <Text className="text-white text-center font-bold">Complete Setup</Text>
      </TouchableOpacity>
    </View>
  )
}