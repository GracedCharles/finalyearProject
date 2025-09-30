import { useUser } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { driverApi, fineApi, offenseApi, User } from '../../src/utils/api'

// Define types
interface OffenseType {
  _id: string
  code: string
  description: string
  amount: number
  category?: string
}

interface Driver {
  _id: string
  firstName: string
  lastName: string
  email: string
  driverLicenseNumber: string
}

export default function IssueFineScreen() {
  const { user } = useUser()
  const router = useRouter()
  
  const [driverLicense, setDriverLicense] = useState('')
  const [vehicleReg, setVehicleReg] = useState('')
  const [offenseType, setOffenseType] = useState('')
  const [offenseTypes, setOffenseTypes] = useState<OffenseType[]>([])
  const [driver, setDriver] = useState<Driver | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchingDriver, setFetchingDriver] = useState(false)

  // Fetch offense types from API
  useEffect(() => {
    const fetchOffenseTypes = async () => {
      try {
        setError(null)
        const types = await offenseApi.getOffenseTypes();
        setOffenseTypes(types);
      } catch (error: any) {
        console.error('Error fetching offense types:', error);
        setError(error.message || 'Failed to load offense types');
        Alert.alert('Error', 'Failed to load offense types');
      }
    };

    fetchOffenseTypes();
  }, [])

  // Fetch driver information when license number changes
  const fetchDriverInfo = async (licenseNumber: string) => {
    if (!licenseNumber) {
      setDriver(null)
      return
    }

    try {
      setFetchingDriver(true)
      setError(null)
      
      // Call the backend API to fetch driver information
      const driverData: User = await driverApi.getDriverByLicense(licenseNumber)
      
      // Convert User type to Driver type
      const driverInfo: Driver = {
        _id: driverData._id,
        firstName: driverData.firstName,
        lastName: driverData.lastName,
        email: driverData.email,
        driverLicenseNumber: driverData.driverLicenseNumber || ''
      }
      
      setDriver(driverInfo)
    } catch (error: any) {
      console.error('Error fetching driver info:', error)
      setDriver(null)
      // Only show error if it's not a 404 (driver not found)
      if (error.message && !error.message.includes('404')) {
        setError(error.message || 'Failed to fetch driver information')
      }
    } finally {
      setFetchingDriver(false)
    }
  }

  useEffect(() => {
    // Debounce the driver info fetch to avoid too many API calls
    const timeoutId = setTimeout(() => {
      if (driverLicense) {
        fetchDriverInfo(driverLicense)
      } else {
        setDriver(null)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [driverLicense])

  const handleIssueFine = async () => {
    if (!driverLicense || !vehicleReg || !offenseType) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    if (!driver) {
      Alert.alert('Error', 'Please enter a valid driver license number')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Call the backend API to issue the fine
      const result = await fineApi.issueFine({
        driverLicenseNumber: driverLicense,
        driverName: `${driver.firstName} ${driver.lastName}`,
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
      setDriver(null)
    } catch (error: any) {
      console.error('Error issuing fine:', error)
      setError(error.message || 'Failed to issue fine')
      Alert.alert('Error', error.message || 'Failed to issue fine')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mb-6">Issue Traffic Fine</Text>
      
      {/* Error message */}
      {error && (
        <View className="bg-red-100 border border-red-400 rounded-lg p-4 mb-4">
          <Text className="text-red-700 font-medium">Error</Text>
          <Text className="text-red-600 mt-1">{error}</Text>
        </View>
      )}
      
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Officer Information</Text>
        <Text className="text-gray-600">Name: {user?.firstName} {user?.lastName}</Text>
        <Text className="text-gray-600">ID: {user?.id}</Text>
      </View>
      
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Driver Information</Text>
        <View className="flex-row items-center">
          <TextInput
            className="flex-1 p-4 border border-gray-300 rounded-lg mb-4"
            value={driverLicense}
            placeholder="Driver License Number"
            onChangeText={setDriverLicense}
          />
          {fetchingDriver && (
            <ActivityIndicator size="small" color="#3B82F6" className="ml-2" />
          )}
        </View>
        {driver ? (
          <View className="bg-green-100 border border-green-400 rounded-lg p-3 mb-2">
            <Text className="text-green-800 font-medium">Driver Found:</Text>
            <Text className="text-green-700">Name: {driver.firstName} {driver.lastName}</Text>
            <Text className="text-green-700">Email: {driver.email}</Text>
          </View>
        ) : driverLicense ? (
          <Text className="text-red-600 mb-2">Driver not found for this license number</Text>
        ) : (
          <Text className="text-gray-500 mb-2">Enter license number to fetch driver information</Text>
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
        className={`bg-blue-500 p-4 mb-8 rounded-lg ${loading ? 'opacity-50' : ''}`}
        onPress={handleIssueFine}
        disabled={loading || !driver}
      >
        <Text className="text-white text-center font-bold">
          {loading ? 'Issuing Fine...' : 'Issue Fine'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}