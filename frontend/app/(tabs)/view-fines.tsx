import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { fineApi } from '../../src/utils/api'
import { realtimeService } from '../../src/utils/realtime'

// Define the Fine type
interface LocalFine {
  _id: string
  fineId: string
  driverLicenseNumber: string
  driverName: string
  vehicleRegistration: string
  offenseDetails: string
  fineAmount: number
  issuedAt: string
  dueDate: string
  status: 'PENDING' | 'PAID' | 'OVERDUE'
}

export default function ViewFinesScreen() {
  const router = useRouter()
  const [fines, setFines] = useState<LocalFine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchFines = async (searchTerm: string = '') => {
    try {
      setLoading(true)
      setError(null)
      const response = await fineApi.getOfficerFines({
        search: searchTerm
      })
      // The backend returns { data: [], totalPages, currentPage }
      if (response && Array.isArray(response.data)) {
        setFines(response.data as LocalFine[])
      } else {
        setFines([])
      }
    } catch (error: any) {
      console.error('Error fetching fines:', error)
      setError(error.message || 'Failed to load fines')
      setFines([])
      Alert.alert('Error', error.message || 'Failed to load fines')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFines()
    
    // Set up real-time listeners
    const handleFineIssued = (data: any) => {
      console.log('Real-time fine issued in view fines:', data);
      // Fetch updated fines list
      fetchFines(searchQuery);
    };
    
    const handlePaymentProcessed = (data: any) => {
      console.log('Real-time payment processed in view fines:', data);
      // Fetch updated fines list to reflect payment status changes
      fetchFines(searchQuery);
    };
    
    realtimeService.on('fineIssued', handleFineIssued);
    realtimeService.on('paymentProcessed', handlePaymentProcessed);
    
    // Cleanup
    return () => {
      realtimeService.off('fineIssued', handleFineIssued);
      realtimeService.off('paymentProcessed', handlePaymentProcessed);
    };
  }, [searchQuery])

  const handleSearch = () => {
    fetchFines(searchQuery)
  }

  const handleRefresh = () => {
    fetchFines(searchQuery)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 border-green-500'
      case 'OVERDUE': return 'bg-red-100 border-red-500'
      default: return 'bg-yellow-100 border-yellow-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID': return 'Paid'
      case 'OVERDUE': return 'Overdue'
      default: return 'Pending'
    }
  }

  const renderFineItem = ({ item }: { item: LocalFine }) => (
    <View className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow">
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-lg font-bold text-gray-900">{item.fineId}</Text>
          <Text className="text-gray-600">Driver: {item.driverName}</Text>
          <Text className="text-gray-600">License: {item.driverLicenseNumber}</Text>
          <Text className="text-gray-600">Vehicle: {item.vehicleRegistration}</Text>
        </View>
        <View className={`px-3 py-1 rounded-full border ${getStatusColor(item.status)}`}>
          <Text className="text-sm font-medium">{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View className="mt-3 pt-3 border-t border-gray-100">
        <Text className="font-medium text-gray-900">{item.offenseDetails}</Text>
        <View className="flex-row justify-between mt-2">
          <Text className="text-gray-600">Amount: MKW{item.fineAmount.toLocaleString()}</Text>
          <Text className="text-gray-600">Due: {formatDate(item.dueDate)}</Text>
        </View>
        <Text className="text-gray-500 text-sm mt-1">Issued: {formatDate(item.issuedAt)}</Text>
      </View>
      
      {item.status !== 'PAID' && (
        <TouchableOpacity 
          className="mt-3 bg-blue-500 p-3 rounded-lg"
          onPress={() => router.push(`/(tabs)/process-payment?fineId=${item._id}`)}
        >
          <Text className="text-white text-center font-bold">Process Payment</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  return (
    <View className="flex-1 bg-gray-100">
      <View className="p-4 pb-14 mb-8">
        
        {/* Search Bar */}
        <View className="flex-row mb-6">
          <TextInput
            className="flex-1 p-4 border border-gray-300 rounded-l-lg"
            placeholder="Search by license, vehicle, or fine ID"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity 
            className="bg-blue-500 p-4 rounded-r-lg"
            onPress={handleSearch}
          >
            <MaterialCommunityIcons name="magnify" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Real-time connection status */}
        {/* <View className={`p-3 rounded-lg mb-4 ${realtimeService.isConnected() ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'}`}>
          <Text className={`font-medium ${realtimeService.isConnected() ? 'text-green-800' : 'text-red-800'}`}>
            {realtimeService.isConnected() ? 'Real-time updates connected' : 'Real-time updates disconnected'}
          </Text>
        </View> */}
        
        {/* Error message */}
        {error && (
          <View className="bg-red-100 border border-red-400 rounded-lg p-4 mb-4">
            <Text className="text-red-700 font-medium">Error</Text>
            <Text className="text-red-600 mt-1">{error}</Text>
          </View>
        )}
        
        {/* Loading indicator */}
        {loading && (
          <View className="flex-1 justify-center items-center py-10">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="mt-4 text-gray-600">Loading fines...</Text>
          </View>
        )}
        
        {/* Fines list */}
        {!loading && (
          <FlatList
            data={fines}
            renderItem={renderFineItem}
            keyExtractor={(item) => item._id}
            refreshing={loading}
            onRefresh={handleRefresh}
            className="pb-14"
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-10">
                <MaterialCommunityIcons name="ticket" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-4 text-center">
                  {searchQuery ? 'No fines found matching your search' : 'No fines issued yet'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  )
}