import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { driverApi, fineApi, User, userApi } from '../../src/utils/api'

// Define types
interface Fine {
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

export default function ProcessPaymentScreen() {
  const router = useRouter()
  const { fineId } = useLocalSearchParams()
  const [fine, setFine] = useState<Fine | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [isDriver, setIsDriver] = useState(false)

  // Fetch user profile to determine if user is a driver
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await userApi.getCurrentUser();
        setUserProfile(profile);
        // Check if user is a driver (has a driver license number)
        setIsDriver(!!profile.driverLicenseNumber);
      } catch (error: any) {
        console.error('Error fetching user profile:', error)
        setError(error.message || 'Failed to load user profile')
      }
    }

    fetchUserProfile()
  }, [])

  // Fetch fine details
  useEffect(() => {
    const fetchFine = async () => {
      if (!fineId || !userProfile) return

      try {
        setLoading(true)
        setError(null)
        
        let response;
        if (isDriver && userProfile.driverLicenseNumber) {
          // Use driver API for drivers
          response = await driverApi.getDriverFineById(fineId as string, userProfile.driverLicenseNumber)
        } else {
          // Use officer API for officers
          response = await fineApi.getFineById(fineId as string)
        }
        
        setFine(response)
      } catch (error: any) {
        console.error('Error fetching fine:', error)
        setError(error.message || 'Failed to load fine details')
        Alert.alert('Error', error.message || 'Failed to load fine details')
      } finally {
        setLoading(false)
      }
    }

    if (userProfile) {
      fetchFine()
    }
  }, [fineId, userProfile, isDriver])

  const handlePayment = async () => {
    if (!fine) return

    if (!paymentMethod) {
      Alert.alert('Error', 'Please select a payment method')
      return
    }

    if (paymentMethod === 'AIRTEL_MONEY' || paymentMethod === 'TNM_MPAMBA') {
      if (!phoneNumber) {
        Alert.alert('Error', 'Please enter your phone number')
        return
      }
    }

    if (paymentMethod === 'VISA') {
      if (!cardNumber || !expiryDate || !cvv) {
        Alert.alert('Error', 'Please enter all card details')
        return
      }
    }

    try {
      setProcessing(true)
      setError(null)
      
      // Generate a mock transaction ID
      const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`
      
      // Process payment
      const response = await fineApi.processPayment({
        fineId: fine.fineId,
        paymentMethod,
        transactionId,
        payerId: paymentMethod === 'VISA' ? cardNumber : phoneNumber
      })

      Alert.alert('Success', 'Payment processed successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ])
    } catch (error: any) {
      console.error('Error processing payment:', error)
      setError(error.message || 'Failed to process payment')
      Alert.alert('Error', error.message || 'Failed to process payment')
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Loading fine details...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-4">
        <View className="bg-red-100 border border-red-400 rounded-lg p-4 mb-4">
          <Text className="text-red-700 font-medium">Error</Text>
          <Text className="text-red-600 mt-1">{error}</Text>
        </View>
        <TouchableOpacity 
          className="bg-blue-500 p-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white text-center font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!fine) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-4">
        <Text className="text-gray-600 text-center">Fine not found</Text>
        <TouchableOpacity 
          className="bg-blue-500 p-3 rounded-lg mt-4"
          onPress={() => router.back()}
        >
          <Text className="text-white text-center font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-6">Process Payment</Text>
        
        {/* Fine Details */}
        <View className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow">
          <Text className="text-lg font-bold mb-2">Fine Details</Text>
          <View className="border-t border-gray-100 pt-2">
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-600">Fine ID:</Text>
              <Text className="font-medium">{fine.fineId}</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-600">Driver:</Text>
              <Text className="font-medium">{fine.driverName}</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-600">License:</Text>
              <Text className="font-medium">{fine.driverLicenseNumber}</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-600">Vehicle:</Text>
              <Text className="font-medium">{fine.vehicleRegistration}</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-600">Offense:</Text>
              <Text className="font-medium">{fine.offenseDetails}</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-600">Amount:</Text>
              <Text className="font-bold text-lg">MKW{fine.fineAmount.toLocaleString()}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Due Date:</Text>
              <Text className="font-medium">{formatDate(fine.dueDate)}</Text>
            </View>
          </View>
        </View>
        
        {/* Payment Method Selection */}
        <View className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow">
          <Text className="text-lg font-bold mb-4">Select Payment Method</Text>
          
          <View className="space-y-3">
            <TouchableOpacity 
              className={`p-4 border rounded-lg ${paymentMethod === 'AIRTEL_MONEY' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              onPress={() => setPaymentMethod('AIRTEL_MONEY')}
            >
              <Text className="font-medium">Airtel Money</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`p-4 border rounded-lg ${paymentMethod === 'TNM_MPAMBA' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              onPress={() => setPaymentMethod('TNM_MPAMBA')}
            >
              <Text className="font-medium">TNM Mpamba</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`p-4 border rounded-lg ${paymentMethod === 'VISA' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              onPress={() => setPaymentMethod('VISA')}
            >
              <Text className="font-medium">Visa Card</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Payment Details */}
        {paymentMethod && (
          <View className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow">
            <Text className="text-lg font-bold mb-4">Payment Details</Text>
            
            {(paymentMethod === 'AIRTEL_MONEY' || paymentMethod === 'TNM_MPAMBA') && (
              <View>
                <Text className="text-gray-700 mb-2">Phone Number</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-4 mb-4"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
                <Text className="text-gray-500 text-sm">
                  You will receive a prompt on your {paymentMethod === 'AIRTEL_MONEY' ? 'Airtel Money' : 'TNM Mpamba'} app to confirm payment
                </Text>
              </View>
            )}
            
            {paymentMethod === 'VISA' && (
              <View>
                <Text className="text-gray-700 mb-2">Card Number</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-4 mb-4"
                  placeholder="Enter card number"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  keyboardType="numeric"
                />
                
                <View className="flex-row">
                  <View className="flex-1 mr-2">
                    <Text className="text-gray-700 mb-2">Expiry Date</Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg p-4 mb-4"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChangeText={setExpiryDate}
                    />
                  </View>
                  
                  <View className="flex-1 ml-2">
                    <Text className="text-gray-700 mb-2">CVV</Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg p-4 mb-4"
                      placeholder="CVV"
                      value={cvv}
                      onChangeText={setCvv}
                      keyboardType="numeric"
                      secureTextEntry
                    />
                  </View>
                </View>
                
                <Text className="text-gray-500 text-sm">
                  Your payment information is securely processed
                </Text>
              </View>
            )}
          </View>
        )}
        
        {/* Error message */}
        {error && (
          <View className="bg-red-100 border border-red-400 rounded-lg p-4 mb-4">
            <Text className="text-red-700 font-medium">Error</Text>
            <Text className="text-red-600 mt-1">{error}</Text>
          </View>
        )}
        
        {/* Process Payment Button */}
        <TouchableOpacity 
          className={`bg-green-500 p-4 rounded-lg mb-6 ${processing ? 'opacity-50' : ''}`}
          onPress={handlePayment}
          disabled={processing || !paymentMethod}
        >
          {processing ? (
            <View className="flex-row justify-center items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white text-center font-bold ml-2">Processing Payment...</Text>
            </View>
          ) : (
            <Text className="text-white text-center font-bold">
              Pay MKW{fine?.fineAmount.toLocaleString() || '0'}
            </Text>
          )}
        </TouchableOpacity>
        
        {/* Cancel Button */}
        <TouchableOpacity 
          className="bg-gray-500 p-4 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white text-center font-bold">Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}