import { useUser } from '@clerk/clerk-expo'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native'
import { driverApi, User, userApi } from '../../src/utils/api'
import { realtimeService } from '../../src/utils/realtime'

// Define types
interface Payment {
  _id: string
  paymentId: string
  fineId: {
    fineId: string
    offenseTypeId: {
      description: string
    }
  }
  amount: number
  paymentMethod: string
  transactionId: string
  status: string
  paidAt: string
}

export default function PaymentHistoryScreen() {
  const { user } = useUser()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const lastUpdateRef = useRef<number>(0)

  // Fetch payment history
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch user profile first to get driver license number
        const profile = await userApi.getCurrentUser();
        setUserProfile(profile);
        
        const driverLicenseNumber = profile.driverLicenseNumber;
        
        if (!driverLicenseNumber) {
          setError('Driver license number not found in your profile. Please update your profile.');
          setLoading(false);
          return;
        }
        
        // Connect to real-time service
        realtimeService.connect()
        
        // Fetch payment history
        const response = await driverApi.getPaymentHistory(driverLicenseNumber, {
          page: 1,
          limit: 20
        });
        
        // Handle the response structure from the backend
        const paymentsArray = response.data || []
        if (Array.isArray(paymentsArray)) {
          setPayments(paymentsArray)
        } else {
          setPayments([])
        }
      } catch (error: any) {
        console.error('Error fetching payment history:', error)
        setError(error.message || 'Failed to load payment history')
        setPayments([])
        Alert.alert('Error', error.message || 'Failed to load payment history')
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentHistory()
    
    // Set up real-time listeners
    const handlePaymentProcessed = (data: any) => {
      console.log('Real-time payment processed in payment history:', data);
      // Throttle updates to prevent excessive requests
      const now = Date.now()
      if (now - lastUpdateRef.current > 2000) {
        lastUpdateRef.current = now
        // Refresh the payment history
        fetchPaymentHistory();
      }
    };
    
    realtimeService.on('paymentProcessed', handlePaymentProcessed);
    
    // Cleanup
    return () => {
      realtimeService.off('paymentProcessed', handlePaymentProcessed);
    };
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Loading payment history...</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-4">
        
        {/* Error message */}
        {error && (
          <View className="bg-red-100 border border-red-400 rounded-lg p-4 mb-4">
            <Text className="text-red-700 font-medium">Error</Text>
            <Text className="text-red-600 mt-1">{error}</Text>
          </View>
        )}
        
        {payments && payments.length > 0 ? (
          <View className="space-y-4">
            {payments.map((payment) => (
              <View 
                key={payment._id} 
                className="bg-white border border-gray-200 rounded-lg p-4 shadow"
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-lg font-bold">Payment #{payment.paymentId}</Text>
                  <Text className={`px-2 py-1 rounded text-xs ${payment.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {payment.status}
                  </Text>
                </View>
                
                <Text className="text-gray-600 mb-1">Fine ID: {payment.fineId?.fineId || 'N/A'}</Text>
                <Text className="text-gray-600 mb-1">Offense: {payment.fineId?.offenseTypeId?.description || 'N/A'}</Text>
                <Text className="text-gray-600 mb-1">Amount: MWK{payment.amount?.toLocaleString() || '0'}</Text>
                <Text className="text-gray-600 mb-1">Method: {payment.paymentMethod}</Text>
                <Text className="text-gray-600">Date: {formatDate(payment.paidAt)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-white border border-gray-200 rounded-lg p-8 items-center">
            <MaterialCommunityIcons name="cash-remove" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 text-center mt-4">No payment history found</Text>
            <Text className="text-gray-400 text-center mt-2">You haven't made any payments yet</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}