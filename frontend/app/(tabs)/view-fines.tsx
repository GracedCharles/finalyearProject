import React, { useEffect, useState } from 'react'
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'

// Define types
interface Fine {
  id: string
  driverName: string
  vehicleReg: string
  offense: string
  amount: number
  status: 'Paid' | 'Unpaid'
  issuedDate: string
}

export default function ViewFinesScreen() {
  const [fines, setFines] = useState<Fine[]>([])
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all')

  // Mock data (would be replaced with API call)
  useEffect(() => {
    // In a real app, this would fetch from your backend API
    const mockFines: Fine[] = [
      {
        id: 'FN001',
        driverName: 'John Doe',
        vehicleReg: 'ABC123',
        offense: 'Speeding',
        amount: 100,
        status: 'Paid',
        issuedDate: '2023-05-15',
      },
      {
        id: 'FN002',
        driverName: 'Jane Smith',
        vehicleReg: 'XYZ789',
        offense: 'Running Red Light',
        amount: 150,
        status: 'Unpaid',
        issuedDate: '2023-05-16',
      },
      {
        id: 'FN003',
        driverName: 'Bob Johnson',
        vehicleReg: 'DEF456',
        offense: 'Illegal Parking',
        amount: 50,
        status: 'Unpaid',
        issuedDate: '2023-05-17',
      },
    ]
    setFines(mockFines)
  }, [])

  const filteredFines = fines.filter(fine => {
    if (filter === 'all') return true
    return fine.status.toLowerCase() === filter
  })

  const handleViewDetails = (fineId: string) => {
    Alert.alert('Fine Details', `Viewing details for fine ${fineId}`)
    // In a real app, this would navigate to a fine details screen
  }

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mb-6">Issued Fines</Text>
      
      <View className="flex-row mb-6">
        <TouchableOpacity 
          className={`flex-1 p-3 rounded-l-lg ${filter === 'all' ? 'bg-blue-500' : 'bg-gray-200'}`}
          onPress={() => setFilter('all')}
        >
          <Text className={`text-center ${filter === 'all' ? 'text-white' : 'text-gray-700'}`}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 p-3 ${filter === 'paid' ? 'bg-blue-500' : 'bg-gray-200'}`}
          onPress={() => setFilter('paid')}
        >
          <Text className={`text-center ${filter === 'paid' ? 'text-white' : 'text-gray-700'}`}>Paid</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 p-3 rounded-r-lg ${filter === 'unpaid' ? 'bg-blue-500' : 'bg-gray-200'}`}
          onPress={() => setFilter('unpaid')}
        >
          <Text className={`text-center ${filter === 'unpaid' ? 'text-white' : 'text-gray-700'}`}>Unpaid</Text>
        </TouchableOpacity>
      </View>
      
      {filteredFines.map((fine) => (
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
          <Text className="text-gray-600 mb-2">Amount: ${fine.amount}</Text>
          <Text className="text-gray-500 text-sm">Issued: {fine.issuedDate}</Text>
          
          <TouchableOpacity 
            className="mt-3 bg-blue-100 p-2 rounded"
            onPress={() => handleViewDetails(fine.id)}
          >
            <Text className="text-blue-700 text-center">View Details</Text>
          </TouchableOpacity>
        </View>
      ))}
      
      {filteredFines.length === 0 && (
        <Text className="text-center text-gray-500 mt-10">No fines found</Text>
      )}
    </ScrollView>
  )
}