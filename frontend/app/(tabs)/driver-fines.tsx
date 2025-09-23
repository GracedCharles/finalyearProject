import React, { useState } from 'react'
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
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
  const [fineId, setFineId] = useState('')
  const [driverLicense, setDriverLicense] = useState('')
  const [fines, setFines] = useState<Fine[]>([])
  const [searchType, setSearchType] = useState<'fineId' | 'license'>('fineId')
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (searchType === 'fineId' && !fineId) {
      Alert.alert('Error', 'Please enter a Fine ID')
      return
    }
    
    if (searchType === 'license' && !driverLicense) {
      Alert.alert('Error', 'Please enter a Driver License Number')
      return
    }

    try {
      setLoading(true)
      let result: Fine[] = []
      
      if (searchType === 'fineId') {
        // Search by fine ID
        const fine = await driverApi.getFineByFineId(fineId)
        result = [fine]
      } else {
        // Search by driver license number
        const response = await driverApi.searchFines({
          driverLicenseNumber: driverLicense
        })
        result = response.data
      }
      
      setFines(result)
    } catch (error) {
      console.error('Error searching fines:', error)
      Alert.alert('Error', 'Failed to search fines')
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
      <Text className="text-2xl font-bold mb-6">Fine Lookup</Text>
      
      <View className="flex-row mb-6">
        <TouchableOpacity 
          className={`flex-1 p-3 rounded-l-lg ${searchType === 'fineId' ? 'bg-blue-500' : 'bg-gray-200'}`}
          onPress={() => setSearchType('fineId')}
        >
          <Text className={`text-center ${searchType === 'fineId' ? 'text-white' : 'text-gray-700'}`}>By Fine ID</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 p-3 rounded-r-lg ${searchType === 'license' ? 'bg-blue-500' : 'bg-gray-200'}`}
          onPress={() => setSearchType('license')}
        >
          <Text className={`text-center ${searchType === 'license' ? 'text-white' : 'text-gray-700'}`}>By License</Text>
        </TouchableOpacity>
      </View>
      
      {searchType === 'fineId' ? (
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2">Search by Fine ID</Text>
          <TextInput
            className="w-full p-4 border border-gray-300 rounded-lg"
            value={fineId}
            placeholder="Enter Fine ID (e.g., FN001)"
            onChangeText={setFineId}
          />
        </View>
      ) : (
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2">Search by Driver License</Text>
          <TextInput
            className="w-full p-4 border border-gray-300 rounded-lg"
            value={driverLicense}
            placeholder="Enter Driver License Number"
            onChangeText={setDriverLicense}
          />
        </View>
      )}
      
      <TouchableOpacity 
        className="bg-blue-500 p-4 rounded-lg mb-6"
        onPress={handleSearch}
        disabled={loading}
      >
        <Text className="text-white text-center font-bold">
          {loading ? 'Searching...' : 'Search Fines'}
        </Text>
      </TouchableOpacity>
      
      {fines.length > 0 && (
        <View>
          <Text className="text-xl font-bold mb-4">Search Results</Text>
          {fines.map((fine) => (
            <View 
              key={fine._id} 
              className="border border-gray-200 rounded-lg p-4 mb-4"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-bold">Fine #{fine.fineId}</Text>
                <Text className={`px-2 py-1 rounded ${fine.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {fine.status}
                </Text>
              </View>
              
              <Text className="text-gray-600 mb-1">Driver: {fine.driverName}</Text>
              <Text className="text-gray-600 mb-1">Vehicle: {fine.vehicleRegistration}</Text>
              <Text className="text-gray-600 mb-1">Offense: {fine.offenseDetails || fine.offenseTypeId?.description}</Text>
              <Text className="text-gray-600 mb-1">Amount: MWK{fine.fineAmount}</Text>
              <Text className="text-gray-600 mb-2">Due Date: {new Date(fine.dueDate).toLocaleDateString()}</Text>
              <Text className="text-gray-500 text-sm">Issued: {new Date(fine.issuedAt).toLocaleDateString()}</Text>
              
              {fine.status !== 'PAID' && (
                <TouchableOpacity 
                  className="mt-3 bg-green-500 p-2 rounded"
                  onPress={() => handlePayFine(fine._id)}
                >
                  <Text className="text-white text-center">Pay Fine</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}