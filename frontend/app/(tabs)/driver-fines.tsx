import React, { useState } from 'react'
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

// Define types
interface Fine {
  id: string
  driverName: string
  vehicleReg: string
  offense: string
  amount: number
  status: 'Paid' | 'Unpaid'
  issuedDate: string
  dueDate: string
}

export default function DriverFinesScreen() {
  const [fineId, setFineId] = useState('')
  const [driverLicense, setDriverLicense] = useState('')
  const [fines, setFines] = useState<Fine[]>([])
  const [searchType, setSearchType] = useState<'fineId' | 'license'>('fineId')

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
      // In a real app, this would call your backend API
      console.log('Searching for fines:', { searchType, fineId, driverLicense })
      
      // Mock data
      const mockFines: Fine[] = [
        {
          id: 'FN001',
          driverName: 'John Doe',
          vehicleReg: 'ABC123',
          offense: 'Speeding',
          amount: 100,
          status: 'Paid',
          issuedDate: '2023-05-15',
          dueDate: '2023-06-15',
        }
      ]
      
      setFines(mockFines)
      Alert.alert('Success', 'Fines retrieved successfully!')
    } catch (error) {
      console.error('Error searching fines:', error)
      Alert.alert('Error', 'Failed to search fines')
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
      >
        <Text className="text-white text-center font-bold">Search Fines</Text>
      </TouchableOpacity>
      
      {fines.length > 0 && (
        <View>
          <Text className="text-xl font-bold mb-4">Search Results</Text>
          {fines.map((fine) => (
            <View 
              key={fine.id} 
              className="border border-gray-200 rounded-lg p-4 mb-4"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-bold">Fine #{fine.id}</Text>
                <Text className={`px-2 py-1 rounded ${fine.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {fine.status}
                </Text>
              </View>
              
              <Text className="text-gray-600 mb-1">Driver: {fine.driverName}</Text>
              <Text className="text-gray-600 mb-1">Vehicle: {fine.vehicleReg}</Text>
              <Text className="text-gray-600 mb-1">Offense: {fine.offense}</Text>
              <Text className="text-gray-600 mb-1">Amount: ${fine.amount}</Text>
              <Text className="text-gray-600 mb-2">Due Date: {fine.dueDate}</Text>
              <Text className="text-gray-500 text-sm">Issued: {fine.issuedDate}</Text>
              
              {fine.status === 'Unpaid' && (
                <TouchableOpacity 
                  className="mt-3 bg-green-500 p-2 rounded"
                  onPress={() => handlePayFine(fine.id)}
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