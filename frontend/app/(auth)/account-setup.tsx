import { useUser } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function AccountSetupScreen() {
  const { user } = useUser()
  const router = useRouter()

  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [address, setAddress] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!firstName || !lastName) {
      Alert.alert('Error', 'Please enter your first and last name.')
      return
    }

    try {
      setIsLoading(true)
      
      // Debug log
      console.log('Starting account setup...')
      console.log('User object:', user)
      console.log('First name:', firstName)
      console.log('Last name:', lastName)
      console.log('Phone number:', phoneNumber)
      console.log('API URL:', process.env.EXPO_PUBLIC_API_URL)
      
      // Check if API URL is defined
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000' // Use 10.0.2.2 for Android emulator
      console.log('Using API URL:', apiUrl)
      
      // Test if the API is reachable first
      try {
        console.log('Testing API connectivity...')
        const testResponse = await fetch(`${apiUrl}/health`, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout for test
        });
        console.log('API connectivity test status:', testResponse.status);
        if (!testResponse.ok) {
          throw new Error(`API test failed with status ${testResponse.status}`);
        }
      } catch (testError) {
        console.error('API connectivity test failed:', testError);
        Alert.alert('Connection Error', `Unable to connect to the backend server at ${apiUrl}. Please ensure the server is running and accessible.`);
        setIsLoading(false);
        return;
      }
      
      // Bypassing Clerk update for now, focusing on backend sync
      console.log('Bypassing Clerk update, storing only in backend...')
      
      // Sync with backend MongoDB
      console.log('Syncing with backend...')
      
      // Add timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`${apiUrl}/api/users/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include Clerk authentication token
          'Authorization': `Bearer ${await user?.getToken()}`,
        },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          address: address,
          phoneNumber: phoneNumber,
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId);
      
      console.log('Backend response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.log('Backend error response:', errorText)
        throw new Error(`Failed to sync with backend: ${response.status} ${errorText}`)
      }

      const responseData = await response.json()
      console.log('Backend response data:', responseData)

      console.log('Account setup completed successfully')
      // Navigate to dashboard after successful setup
      router.replace('/(tabs)/dashboard')
    } catch (error: any) {
      console.error('Account setup error:', error)
      if (error.name === 'AbortError') {
        Alert.alert('Error', 'Request timeout. Please check your network connection and ensure the backend server is running.')
      } else if (error.message.includes('Failed to fetch')) {
        Alert.alert('Error', 'Unable to connect to the backend server. Please ensure the server is running and accessible.')
      } else {
        Alert.alert('Error', `Failed to complete account setup: ${error.message || 'Please try again.'}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-gray-100 p-6 justify-center">
      <Text className="text-4xl text-center font-bold text-gray-800 mb-2">Traffic Fine System</Text>
      <Text className="text-center text-gray-600 mb-8">Complete your profile setup</Text>
      
      <View className="rounded-3xl bg-white p-8 shadow-sm">
        <Text className="text-2xl text-center font-semibold text-gray-800 mb-6">Account Setup</Text>
        <Text className="text-center text-gray-600 mb-8">Please provide your details to complete your account setup</Text>
        
        <View className="w-full mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">First Name *</Text>
          <TextInput
            value={firstName}
            placeholder="Enter your first name"
            className="w-full p-4 border border-gray-300 rounded-lg"
            onChangeText={setFirstName}
            editable={!isLoading}
          />
        </View>
        
        <View className="w-full mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Last Name *</Text>
          <TextInput
            value={lastName}
            placeholder="Enter your last name"
            className="w-full p-4 border border-gray-300 rounded-lg"
            onChangeText={setLastName}
            editable={!isLoading}
          />
        </View>
        
        <View className="w-full mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Address</Text>
          <TextInput
            value={address}
            placeholder="Enter your address"
            className="w-full p-4 border border-gray-300 rounded-lg"
            onChangeText={setAddress}
            editable={!isLoading}
          />
        </View>
        
        <View className="w-full mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">Phone Number</Text>
          <TextInput
            value={phoneNumber}
            placeholder="Enter your phone number"
            className="w-full p-4 border border-gray-300 rounded-lg"
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            editable={!isLoading}
          />
        </View>
        
        <TouchableOpacity 
          className="w-full bg-blue-600 p-4 rounded-lg"
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <View className="flex-row justify-center items-center">
              <ActivityIndicator color="white" size="small" />
              <Text className="text-white text-center font-medium ml-2">Saving...</Text>
            </View>
          ) : (
            <Text className="text-white text-center font-medium">Complete Setup</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}