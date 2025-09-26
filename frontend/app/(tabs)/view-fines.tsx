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
  const [error, setError] = useState<string | null>(null)

  // Fetch fines from API
  useEffect(() => {
    const fetchFines = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fineApi.getOfficerFines()
        // The backend returns { fines: [], totalPages, currentPage } for officer fines
        // but the frontend API type expects { data: [], totalPages, currentPage }
        const finesArray = (response as any).fines || response.data || []
        if (Array.isArray(finesArray)) {
          setFines(finesArray)
        } else {
          setFines([])
        }
      } catch (error: any) {
        console.error('Error fetching fines:', error)
        setError(error.message || 'Failed to load fines')
        setFines([]) // Set to empty array on error
        Alert.alert('Error', error.message || 'Failed to load fines')
      } finally {
        setLoading(false)
      }
    }

    fetchFines()
  }, [])

  const filteredFines = fines.filter(fine => {
    if (filter === 'all') return true
    return fine.status === filter
  })

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
      
      {/* Error message */}
      {error && (
        <View className="bg-red-100 border border-red-400 rounded-lg p-4 mb-4">
          <Text className="text-red-700 font-medium">Error</Text>
          <Text className="text-red-600 mt-1">{error}</Text>
        </View>
      )}
      
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
      
      {filteredFines && filteredFines.length > 0 ? (
        filteredFines.map((fine) => (
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
        ))
      ) : (
        <Text className="text-center text-gray-500 mt-10">No fines found</Text>
      )}
    </ScrollView>
  )
}