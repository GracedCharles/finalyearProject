import { useUser } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { fineApi, offenseApi } from '../../src/utils/api'

// Define types
interface OffenseType {
  _id: string
  code: string
  description: string
  amount: number
  category?: string
}

export default function IssueFineScreen() {
  const { user } = useUser()
  const router = useRouter()
  
  const [driverLicense, setDriverLicense] = useState('')
  const [vehicleReg, setVehicleReg] = useState('')
  const [offenseType, setOffenseType] = useState('')
  const [offenseTypes, setOffenseTypes] = useState<OffenseType[]>([])
  const [driverName, setDriverName] = useState('')

  // Fetch offense types from API
  useEffect(() => {
    const fetchOffenseTypes = async () => {
      try {
        const types = await offenseApi.getOffenseTypes();
        setOffenseTypes(types);
      } catch (error) {
        console.error('Error fetching offense types:', error);
        Alert.alert('Error', 'Failed to load offense types');
      }
    };

    fetchOffenseTypes();
  }, [])

  // In a real app, you might have an API to fetch driver name
  // For now, we'll keep the mock implementation
  const fetchDriverName = async (licenseNumber: string) => {
    // In a real app, this would call your backend API
    if (licenseNumber) {
      // Simulate API delay
      setTimeout(() => {
        setDriverName('John Doe') // Mock driver name
      }, 500)
    } else {
      setDriverName('')
    }
  }

  useEffect(() => {
    fetchDriverName(driverLicense)
  }, [driverLicense])

  const handleIssueFine = async () => {
    if (!driverLicense || !vehicleReg || !offenseType) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    try {
      // Call the backend API to issue the fine
      const result = await fineApi.issueFine({
        driverLicenseNumber: driverLicense,
        driverName: driverName || 'Unknown Driver',
        vehicleRegistration: vehicleReg,
        offenseTypeId: offenseType,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
      });
      
      console.log('Fine issued successfully:', result);
      Alert.alert('Success', 'Fine issued successfully!')
      
      // Reset form
      setDriverLicense('')
      setVehicleReg('')
      setOffenseType('')
      setDriverName('')
    } catch (error) {
      console.error('Error issuing fine:', error)
      Alert.alert('Error', 'Failed to issue fine')
    }
  }

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mb-6">Issue Traffic Fine</Text>
      
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Officer Information</Text>
        <Text className="text-gray-600">Name: {user?.firstName} {user?.lastName}</Text>
        <Text className="text-gray-600">ID: {user?.id}</Text>
      </View>
      
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Driver Information</Text>
        <TextInput
          className="w-full p-4 border border-gray-300 rounded-lg mb-4"
          value={driverLicense}
          placeholder="Driver License Number"
          onChangeText={setDriverLicense}
        />
        {driverName ? (
          <Text className="text-green-600 mb-2">Driver Name: {driverName}</Text>
        ) : (
          <Text className="text-gray-500 mb-2">Enter license number to fetch driver name</Text>
        )}
      </View>
      
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Vehicle Information</Text>
        <TextInput
          className="w-full p-4 border border-gray-300 rounded-lg"
          value={vehicleReg}
          placeholder="Vehicle Registration"
          onChangeText={setVehicleReg}
        />
      </View>
      
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Offense Details</Text>
        <View className="border border-gray-300 rounded-lg">
          {offenseTypes.map((type) => (
            <TouchableOpacity
              key={type._id}
              className={`p-4 border-b border-gray-200 ${offenseType === type._id ? 'bg-blue-100' : ''}`}
              onPress={() => setOffenseType(type._id)}
            >
              <Text className="font-medium">{type.description}</Text>
              <Text className="text-gray-600">Code: {type.code} - Amount: MWK{type.amount}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <TouchableOpacity 
        className="bg-blue-500 p-4 rounded-lg"
        onPress={handleIssueFine}
      >
        <Text className="text-white text-center font-bold">Issue Fine</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}