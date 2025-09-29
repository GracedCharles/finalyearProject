import { useUser } from '@clerk/clerk-expo'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { driverApi, User, userApi } from '../../src/utils/api'
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

export default function DriverFinesScreen() {
  const router = useRouter()
  const { user } = useUser()
  const [fines, setFines] = useState<LocalFine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const lastUpdateRef = useRef<number>(0)

  const fetchFines = async (driverLicenseNumber: string, searchTerm: string = '') => {
    try {
      console.log('Fetching fines for license number:', driverLicenseNumber);
      // Don't set loading to true for real-time updates to avoid UI flickering
      setError(null)
      const response = await driverApi.searchFines({
        driverLicenseNumber,
        page: 1,
        limit: 50
      })
      
      console.log('Fines API response:', response);
      
      // The backend returns { data: [], totalPages, currentPage }
      if (response && Array.isArray(response.data)) {
        console.log('Number of fines found:', response.data.length);
        // Filter by search term if provided
        let filteredFines = response.data as LocalFine[]
        if (searchTerm) {
          filteredFines = filteredFines.filter(fine => 
            fine.fineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fine.vehicleRegistration.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fine.offenseDetails.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
        setFines(filteredFines)
      } else {
        console.log('No fines data in response');
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
    const fetchDriverData = async () => {
      try {
        console.log('Fetching driver profile data');
        // Fetch user profile first to get driver license number
        const profile = await userApi.getCurrentUser();
        console.log('User profile:', profile);
        setUserProfile(profile)
        
        const driverLicenseNumber = profile.driverLicenseNumber
        console.log('Driver license number:', driverLicenseNumber)
        
        if (!driverLicenseNumber) {
          setError('Driver license number not found in your profile. Please update your profile.')
          setLoading(false)
          return
        }
        
        // Connect to real-time service
        realtimeService.connect()
        
        fetchFines(driverLicenseNumber, searchQuery)
      } catch (error: any) {
        console.error('Error fetching driver data:', error)
        setError(error.message || 'Failed to load driver data')
        setLoading(false)
      }
    }

    fetchDriverData()
    
    // Set up real-time listeners
    const handlePaymentProcessed = (data: any) => {
      console.log('Real-time payment processed:', data)
      // Throttle updates to prevent excessive requests - only update if it's been more than 2 seconds since last update
      const now = Date.now()
      if (now - lastUpdateRef.current > 2000) {
        lastUpdateRef.current = now
        // Refresh the fines list to reflect payment status changes
        if (userProfile?.driverLicenseNumber) {
          fetchFines(userProfile.driverLicenseNumber, searchQuery)
        } else if (userProfile === null) {
          // If userProfile is still null, fetch it first
          userApi.getCurrentUser().then(profile => {
            if (profile.driverLicenseNumber) {
              fetchFines(profile.driverLicenseNumber, searchQuery)
            }
          }).catch(error => {
            console.error('Error fetching profile for real-time update:', error)
          })
        }
      }
    }
    
    realtimeService.on('paymentProcessed', handlePaymentProcessed)
    
    // Cleanup
    return () => {
      realtimeService.off('paymentProcessed', handlePaymentProcessed)
    }
  }, [searchQuery])

  const handleSearch = () => {
    if (userProfile?.driverLicenseNumber) {
      fetchFines(userProfile.driverLicenseNumber, searchQuery)
    }
  }

  const handleRefresh = () => {
    if (userProfile?.driverLicenseNumber) {
      fetchFines(userProfile.driverLicenseNumber, searchQuery)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return styles.statusPaid
      case 'OVERDUE': return styles.statusOverdue
      default: return styles.statusPending
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID': return 'Paid'
      case 'OVERDUE': return 'Overdue'
      default: return 'Pending'
    }
  }

  const handlePayFine = (fineId: string) => {
    // Navigate to the payment processing screen with the fine ID
    router.push(`/(tabs)/process-payment?fineId=${fineId}`)
  }

  const renderFineItem = ({ item }: { item: LocalFine }) => (
    <View style={styles.fineItem}>
      <View style={styles.fineHeader}>
        <View>
          <Text style={styles.fineId}>{item.fineId}</Text>
          <Text style={styles.fineDetail}>Driver: {item.driverName}</Text>
          <Text style={styles.fineDetail}>License: {item.driverLicenseNumber}</Text>
          <Text style={styles.fineDetail}>Vehicle: {item.vehicleRegistration}</Text>
        </View>
        <View style={[styles.statusBadge, getStatusColor(item.status)]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.fineBody}>
        <Text style={styles.offenseDetails}>{item.offenseDetails}</Text>
        <View style={styles.amountRow}>
          <Text style={styles.amount}>Amount: MKW{item.fineAmount.toLocaleString()}</Text>
          <Text style={styles.dueDate}>Due: {formatDate(item.dueDate)}</Text>
        </View>
        <Text style={styles.issuedDate}>Issued: {formatDate(item.issuedAt)}</Text>
      </View>
      
      {item.status !== 'PAID' && (
        <TouchableOpacity 
          style={styles.payButton}
          onPress={() => handlePayFine(item._id)}
        >
          <Text style={styles.payButtonText}>Pay Fine</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.content} className='pb-14 mb-8'>
        
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by fine ID, vehicle, or offense"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <MaterialCommunityIcons name="magnify" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.errorMessage}>{error}</Text>
          </View>
        )}
        
        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading fines...</Text>
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
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="ticket" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No fines found matching your search' : 'No traffic fines found'}
                </Text>
                <Text style={styles.emptySubtext}>
                  All fines have been paid or none have been issued yet.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6', // gray-100
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  welcomeCard: {
    backgroundColor: '#3b82f6', // blue-500
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  welcomeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  licenseText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  connectionStatus: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  connected: {
    backgroundColor: '#dcfce7', // green-100
    borderColor: '#4ade80', // green-500
    borderWidth: 1,
  },
  disconnected: {
    backgroundColor: '#fee2e2', // red-100
    borderColor: '#f87171', // red-500
    borderWidth: 1,
  },
  connectionStatusText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db', // gray-300
    borderRightWidth: 0,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    backgroundColor: 'white',
  },
  searchButton: {
    backgroundColor: '#3b82f6', // blue-500
    padding: 16,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#fee2e2', // red-100
    borderWidth: 1,
    borderColor: '#f87171', // red-400
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  errorTitle: {
    color: '#b91c1c', // red-700
    fontWeight: 'bold',
  },
  errorMessage: {
    color: '#dc2626', // red-600
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#4b5563', // gray-600
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6b7280', // gray-500
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#9ca3af', // gray-400
    textAlign: 'center',
    marginTop: 8,
  },
  fineItem: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb', // gray-200
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  fineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  fineId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937', // gray-900
  },
  fineDetail: {
    color: '#4b5563', // gray-600
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
  },
  statusPaid: {
    backgroundColor: '#dcfce7', // green-100
    borderColor: '#4ade80', // green-500
  },
  statusOverdue: {
    backgroundColor: '#fee2e2', // red-100
    borderColor: '#f87171', // red-500
  },
  statusPending: {
    backgroundColor: '#fef9c3', // yellow-100
    borderColor: '#facc15', // yellow-500
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  fineBody: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb', // gray-100
  },
  offenseDetails: {
    fontWeight: '500',
    color: '#1f2937', // gray-900
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  amount: {
    color: '#4b5563', // gray-600
  },
  dueDate: {
    color: '#4b5563', // gray-600
  },
  issuedDate: {
    color: '#6b7280', // gray-500
    fontSize: 12,
    marginTop: 4,
  },
  payButton: {
    marginTop: 12,
    backgroundColor: '#10b981', // green-500
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
})