import { useUser } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

// Define types
interface OffenseType {
  id: string
  code: string
  description: string
  amount: number
}

export default function IssueFineScreen() {
  const { user } = useUser()
  const router = useRouter()
  
  const [driverLicense, setDriverLicense] = useState('')
  const [vehicleReg, setVehicleReg] = useState('')
  const [offenseType, setOffenseType] = useState('')
  const [offenseTypes, setOffenseTypes] = useState<OffenseType[]>([])
  const [driverName, setDriverName] = useState('')

  // Mock function to fetch offense types (would be replaced with API call)
  useEffect(() => {
    // In a real app, this would fetch from your backend API
    const mockOffenseTypes: OffenseType[] = [
      { id: '1', code: 'SPD001', description: 'Speeding', amount: 100 },
      { id: '2', code: 'RAN002', description: 'Running Red Light', amount: 150 },
      { id: '3', code: 'PARK003', description: 'Illegal Parking', amount: 50 },
    ]
    setOffenseTypes(mockOffenseTypes)
  }, [])

  // Mock function to fetch driver name (would be replaced with API call)
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
      // In a real app, this would call your backend API to issue the fine
      console.log('Issuing fine:', { driverLicense, vehicleReg, offenseType })
      Alert.alert('Success', 'Fine issued successfully!')
      
      // Reset form
      setDriverLicense('')
      setVehicleReg('')
      setOffenseType('')
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
              key={type.id}
              className={`p-4 border-b border-gray-200 ${offenseType === type.id ? 'bg-blue-100' : ''}`}
              onPress={() => setOffenseType(type.id)}
            >
              <Text className="font-medium">{type.description}</Text>
              <Text className="text-gray-600">Code: {type.code} - Amount: ${type.amount}</Text>
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