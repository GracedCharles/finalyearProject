import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { Fine, fineApi, OffenseType } from '../../src/utils/api'

// Define types
interface LocalFine extends Omit<Fine, 'offenseTypeId'> {
  offenseTypeId: OffenseType & {
    description: string
  }
}

export default function ViewFinesScreen() {
  const [fines, setFines] = useState<LocalFine[]>([])
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
        
        // The backend returns { fines: [], totalPages, currentPage }
        if (response && Array.isArray(response.fines)) {
          setFines(response.fines as LocalFine[])
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
        <View className="flex-row justify-center items-center">
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text className="text-gray-600 ml-2">Loading fines...</Text>
        </View>
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
          <Text className="text-red-500 text-sm mt-2">
            Please make sure the backend server is running
          </Text>
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
            <Text className="text-gray-600 mb-2">Amount: MWK{fine.fineAmount.toLocaleString()}</Text>
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
        <View className="bg-gray-50 border border-gray-200 rounded-lg p-8 items-center">
          <Text className="text-gray-500 text-center">No fines found</Text>
          <Text className="text-gray-400 text-center mt-2">
            {filter === 'all' ? 'No fines have been issued yet' : 
             filter === 'PAID' ? 'No paid fines found' : 
             'No unpaid fines found'}
          </Text>
        </View>
      )}
    </ScrollView>
  )
}