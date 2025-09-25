import React, { useEffect, useState } from 'react'
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { fineApi } from '../../src/utils/api'

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
  offenseTypeId: {
    description: string
  }
}

export default function ViewFinesScreen() {
  const [fines, setFines] = useState<Fine[]>([])
  const [filter, setFilter] = useState<'all' | 'PAID' | 'PENDING'>('all')
  const [loading, setLoading] = useState(true)

  // Fetch fines from API
  useEffect(() => {
    const fetchFines = async () => {
      try {
        setLoading(true)
        const response = await fineApi.getOfficerFines()
        // Fix: Access the fines array from the response object
        // The backend returns { fines: [], totalPages, currentPage } but the type says { data: [], totalPages, currentPage }
        // We need to handle this discrepancy
        const finesArray = (response as any).fines || response.data || []
        setFines(finesArray)
      } catch (error) {
        console.error('Error fetching fines:', error)
        Alert.alert('Error', 'Failed to load fines')
      } finally {
        setLoading(false)
      }
    }

    fetchFines()
  }, [])

  // Fix: Add a check to ensure fines is an array before filtering
  const filteredFines = Array.isArray(fines) ? fines.filter(fine => {
    if (filter === 'all') return true
    return fine.status === filter
  }) : []

  const handleViewDetails = (fineId: string) => {
    Alert.alert('Fine Details', `Viewing details for fine ${fineId}`)
    // In a real app, this would navigate to a fine details screen
  }

  if (loading) {
    return (
      <View className="flex-1 bg-white p-6 justify-center">
        <Text className="text-center">Loading fines...</Text>
      </View>
    )
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
          className={`flex-1 p-3 ${filter === 'PAID' ? 'bg-blue-500' : 'bg-gray-200'}`}
          onPress={() => setFilter('PAID')}
        >
          <Text className={`text-center ${filter === 'PAID' ? 'text-white' : 'text-gray-700'}`}>Paid</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 p-3 rounded-r-lg ${filter === 'PENDING' ? 'bg-blue-500' : 'bg-gray-200'}`}
          onPress={() => setFilter('PENDING')}
        >
          <Text className={`text-center ${filter === 'PENDING' ? 'text-white' : 'text-gray-700'}`}>Unpaid</Text>
        </TouchableOpacity>
      </View>
      
      {filteredFines.map((fine) => (
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
          <Text className="text-gray-600 mb-2">Amount: MWK{fine.fineAmount}</Text>
          <Text className="text-gray-500 text-sm">Issued: {new Date(fine.issuedAt).toLocaleDateString()}</Text>
          
          <TouchableOpacity 
            className="mt-3 bg-blue-100 p-2 rounded"
            onPress={() => handleViewDetails(fine._id)}
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