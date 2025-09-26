import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { driverApi } from '../../src/utils/api'

// Define types
interface Fine {
  _id: string
  fineId: string
  driverName: string
  vehicleRegistration: string
  offenseDetails: string
  fineAmount: number
  status: 'PENDING' | 'PAID' | 'OVERDUE'
  issuedAt: string
  dueDate: string
  offenseTypeId: {
    description: string
  }
}

export default function DriverFinesScreen() {
  const [user, setUser] = useState<{ firstName?: string; lastName?: string } | null>(null)
  const [driverLicense, setDriverLicense] = useState('')
  const [fines, setFines] = useState<Fine[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user's fines when component mounts
  useEffect(() => {
    // In a real app, you would get the driver's license from their profile
    // For now, we'll use a placeholder
    const licenseNumber = 'DL001' // This should come from user profile
    setDriverLicense(licenseNumber)
    fetchFines(licenseNumber)
  }, [])

  const fetchFines = async (license: string) => {
    try {
      setDataLoading(true)
      setError(null)
      const response = await driverApi.searchFines({
        driverLicenseNumber: license
      })
      // Ensure response.data is an array before setting it
      if (response && Array.isArray(response.data)) {
        setFines(response.data)
      } else {
        setFines([]) // Set to empty array if data is not an array
      }
    } catch (error) {
      console.error('Error fetching fines:', error)
      setError('Failed to load fines')
      setFines([]) // Set to empty array on error
    } finally {
      setDataLoading(false)
    }
  }

  const handleRefresh = async () => {
    if (!driverLicense) {
      Alert.alert('Error', 'Driver license not found')
      return
    }

    try {
      setLoading(true)
      const response = await driverApi.searchFines({
        driverLicenseNumber: driverLicense
      })
      // Ensure response.data is an array before setting it
      if (response && Array.isArray(response.data)) {
        setFines(response.data)
      } else {
        setFines([]) // Set to empty array if data is not an array
      }
    } catch (error) {
      console.error('Error refreshing fines:', error)
      Alert.alert('Error', 'Failed to refresh fines')
      setFines([]) // Set to empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handlePayFine = (fineId: string) => {
    Alert.alert(
      'Pay Fine',
      'This would redirect to the payment screen',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Proceed', onPress: () => console.log('Proceed with payment for', fineId) }
      ]
    )
  }

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mb-6">My Fines</Text>
      
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Driver License Number</Text>
        <View className="flex-row">
          <TextInput
            className="flex-1 p-4 border border-gray-300 rounded-l-lg bg-gray-100"
            value={driverLicense}
            placeholder="Enter Driver License Number"
            onChangeText={setDriverLicense}
            editable={false} // For clerks, this should be fixed to their license
          />
          <TouchableOpacity 
            className="bg-blue-500 p-4 rounded-r-lg justify-center"
            onPress={handleRefresh}
            disabled={loading}
          >
            <Text className="text-white text-center font-bold">
              {loading ? 'Refreshing...' : 'Refresh'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {dataLoading ? (
        <View className="flex-1 justify-center items-center py-10">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Loading your fines...</Text>
        </View>
      ) : error ? (
        <View className="bg-red-100 border border-red-400 rounded-lg p-4 mb-6">
          <Text className="text-red-700 font-medium">Error</Text>
          <Text className="text-red-600 mt-1">{error}</Text>
          <TouchableOpacity 
            className="mt-3 bg-red-500 p-2 rounded"
            onPress={handleRefresh}
          >
            <Text className="text-white text-center">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : fines && fines.length > 0 ? (
        <View>
          <Text className="text-xl font-bold mb-4">Your Fines ({fines.length})</Text>
          {fines.map((fine) => (
            <View 
              key={fine._id} 
              className="border border-gray-200 rounded-lg p-4 mb-4"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-bold">Fine #{fine.fineId}</Text>
                <Text className={`px-2 py-1 rounded text-xs ${fine.status === 'PAID' ? 'bg-green-100 text-green-800' : fine.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {fine.status}
                </Text>
              </View>
              
              <Text className="text-gray-600 mb-1">Driver: {fine.driverName}</Text>
              <Text className="text-gray-600 mb-1">Vehicle: {fine.vehicleRegistration}</Text>
              <Text className="text-gray-600 mb-1">Offense: {fine.offenseDetails || (fine.offenseTypeId && fine.offenseTypeId.description) || 'N/A'}</Text>
              <Text className="text-gray-600 mb-1">Amount: MWK{fine.fineAmount ? fine.fineAmount.toLocaleString() : '0'}</Text>
              <Text className="text-gray-600 mb-2">Due Date: {fine.dueDate ? new Date(fine.dueDate).toLocaleDateString() : 'N/A'}</Text>
              <Text className="text-gray-500 text-sm">Issued: {fine.issuedAt ? new Date(fine.issuedAt).toLocaleDateString() : 'N/A'}</Text>
              
              {fine.status !== 'PAID' && (
                <TouchableOpacity 
                  className="mt-3 bg-green-500 p-2 rounded"
                  onPress={() => handlePayFine(fine._id)}
                >
                  <Text className="text-white text-center">Pay Fine (MWK{fine.fineAmount ? fine.fineAmount.toLocaleString() : '0'})</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View className="flex-1 justify-center items-center py-10">
          <MaterialCommunityIcons name="ticket" size={48} color="#9CA3AF" />
          <Text className="text-gray-500 text-center mt-4">No fines found for this license</Text>
          <TouchableOpacity 
            className="mt-4 bg-blue-500 p-3 rounded"
            onPress={handleRefresh}
          >
            <Text className="text-white text-center">Refresh</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}