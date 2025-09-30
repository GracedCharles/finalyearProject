import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { driverApi, User, userApi } from '../../src/utils/api'

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
  const [isOfficer, setIsOfficer] = useState(false)

  // Fetch user's fines when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile to get driver license number
        const profile: User = await userApi.getCurrentUser();
        setUser({
          firstName: profile.firstName,
          lastName: profile.lastName
        });
        
        // Check if user is an officer or clerk
        const userIsOfficer = profile.role !== 'clerk';
        setIsOfficer(userIsOfficer);
        
        const licenseNumber = profile.driverLicenseNumber;
        if (licenseNumber && !userIsOfficer) {
          // For clerks, auto-fill their own license number
          setDriverLicense(licenseNumber);
          fetchFines(licenseNumber);
        } else if (userIsOfficer) {
          // For officers, leave it blank so they can enter any license number
          setDataLoading(false);
        } else {
          setError('Driver license number not found in your profile');
          setDataLoading(false);
        }
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
        setDataLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchFines = async (license: string) => {
    if (!license) {
      setError('Please enter a driver license number');
      return;
    }
    
    try {
      setDataLoading(true)
      setError(null)
      
      // Directly call the API without type casting to see raw response
      const response: any = await driverApi.searchFines({
        driverLicenseNumber: license
      })
      
      console.log('Driver fines API response:', response);
      
      // Handle the actual response structure from the backend
      // The backend returns { fines: [], totalPages, currentPage } 
      const finesArray = response.fines || response.data || []
      
      if (Array.isArray(finesArray)) {
        setFines(finesArray)
      } else {
        setFines([]) // Set to empty array if data is not an array
      }
    } catch (error: any) {
      console.error('Error fetching fines:', error)
      setError(error.message || 'Failed to load fines')
      setFines([]) // Set to empty array on error
    } finally {
      setDataLoading(false)
    }
  }

  const handleRefresh = async () => {
    if (!driverLicense) {
      Alert.alert('Error', 'Please enter a driver license number')
      return
    }

    await fetchFines(driverLicense);
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

  if (dataLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Loading fines...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-6">
      
      {/* Error message */}
      {error && (
        <View className="bg-red-100 border border-red-400 rounded-lg p-4 mb-4">
          <Text className="text-red-700 font-medium">Error</Text>
          <Text className="text-red-600 mt-1">{error}</Text>
        </View>
      )}
      
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">
          {isOfficer ? 'Search Driver Fines' : 'My Fines'}
        </Text>
        <View className="flex-row">
          <TextInput
            className="flex-1 p-4 border border-gray-300 rounded-l-lg"
            value={driverLicense}
            placeholder="Enter Driver License Number"
            onChangeText={setDriverLicense}
            editable={isOfficer} // Only officers can edit, clerks see their fixed license
          />
          <TouchableOpacity 
            className="bg-blue-500 p-4 rounded-r-lg justify-center"
            onPress={handleRefresh}
            disabled={loading || (!isOfficer && !driverLicense)}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <MaterialCommunityIcons name="magnify" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
        {!isOfficer && (
          <Text className="text-gray-500 text-sm mt-2">
            Viewing fines for your license number
          </Text>
        )}
      </View>
      
      {fines && fines.length > 0 ? (
        <View className="space-y-4">
          {fines.map((fine) => (
            <View 
              key={fine._id} 
              className="border border-gray-200 rounded-lg p-4"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-bold">Fine #{fine.fineId}</Text>
                <Text className={`px-2 py-1 rounded text-xs ${fine.status === 'PAID' ? 'bg-green-100 text-green-800' : fine.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {fine.status}
                </Text>
              </View>
              
              <Text className="text-gray-600 mb-1">Offense: {fine.offenseDetails || fine.offenseTypeId?.description}</Text>
              <Text className="text-gray-600 mb-1">Amount: MWK{fine.fineAmount.toLocaleString()}</Text>
              <Text className="text-gray-600 mb-2">Due Date: {new Date(fine.dueDate).toLocaleDateString()}</Text>
              <Text className="text-gray-600 mb-2">Issued: {new Date(fine.issuedAt).toLocaleDateString()}</Text>
              
              {fine.status !== 'PAID' && (
                <TouchableOpacity 
                  className="mt-2 bg-green-500 p-2 rounded"
                  onPress={() => handlePayFine(fine._id)}
                >
                  <Text className="text-white text-center font-medium">Pay Fine</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      ) : !isOfficer || driverLicense ? (
        <View className="bg-gray-50 border border-gray-200 rounded-lg p-8 items-center">
          <MaterialCommunityIcons name="ticket-outline" size={48} color="#9CA3AF" />
          <Text className="text-gray-500 text-center mt-4">No fines found</Text>
          <Text className="text-gray-400 text-center mt-2">
            {isOfficer 
              ? 'No fines found for this driver license number' 
              : 'You don\'t have any traffic fines at this time'}
          </Text>
        </View>
      ) : (
        <View className="bg-gray-50 border border-gray-200 rounded-lg p-8 items-center">
          <MaterialCommunityIcons name="text-search" size={48} color="#9CA3AF" />
          <Text className="text-gray-500 text-center mt-4">Enter a driver license number</Text>
          <Text className="text-gray-400 text-center mt-2">
            Officers can search for fines by entering a driver's license number
          </Text>
        </View>
      )}
    </ScrollView>
  )
}