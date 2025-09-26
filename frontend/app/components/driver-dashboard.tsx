import { useUser } from '@clerk/clerk-expo'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { driverApi, DriverDashboardStats } from '../../src/utils/api'

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

// Define icon name type
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface StatCard {
  title: string;
  value: string | number;
  icon: IconName;
  color: string;
  textColor: string;
}

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  color: string;
  iconColor: string;
  onPress: () => void;
}

export default function DriverDashboardScreen() {
  const { user } = useUser()
  const [stats, setStats] = useState<DriverDashboardStats>({
    activeFines: 0,
    totalPaid: 0,
    overdueFines: 0,
    totalOutstanding: 0
  })
  
  const [recentFines, setRecentFines] = useState<Fine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch driver dashboard data
  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch driver dashboard stats
        const dashboardStats: DriverDashboardStats = await driverApi.getDashboardStats();
        setStats(dashboardStats)
        
        // For demo purposes, we'll use mock data for recent fines
        // In a real implementation, you would fetch this data from your backend
        setTimeout(() => {
          setRecentFines([
            {
              _id: '1',
              fineId: 'FN-2023-001',
              driverName: 'John Doe',
              vehicleRegistration: 'ABC123',
              offenseDetails: 'Speeding',
              fineAmount: 2500,
              status: 'PENDING',
              issuedAt: new Date().toISOString(),
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              offenseTypeId: {
                description: 'Speeding'
              }
            },
            {
              _id: '2',
              fineId: 'FN-2023-002',
              driverName: 'John Doe',
              vehicleRegistration: 'ABC123',
              offenseDetails: 'Parking Violation',
              fineAmount: 1500,
              status: 'PAID',
              issuedAt: new Date().toISOString(),
              dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              offenseTypeId: {
                description: 'Parking Violation'
              }
            }
          ])
          
          setLoading(false)
        }, 1000)
      } catch (error: any) {
        console.error('Error fetching driver data:', error)
        setError(error.message || 'Failed to load dashboard data')
        setLoading(false)
      }
    }

    fetchDriverData()
  }, [])

  // Quick action items for drivers
  const quickActions: QuickAction[] = [
    {
      id: 'view-fines',
      title: 'View My Fines',
      subtitle: 'Check all traffic fines',
      icon: 'ticket-account',
      color: 'bg-red-500',
      iconColor: 'white',
      onPress: () => Alert.alert('Action', 'Navigate to view fines screen')
    },
    {
      id: 'payment-history',
      title: 'Payment History',
      subtitle: 'View past fine payments',
      icon: 'cash-multiple',
      color: 'bg-green-500',
      iconColor: 'white',
      onPress: () => Alert.alert('Action', 'Navigate to payment history screen')
    },
    {
      id: 'make-payment',
      title: 'Make Payment',
      subtitle: 'Pay outstanding fines',
      icon: 'cash',
      color: 'bg-blue-500',
      iconColor: 'white',
      onPress: () => Alert.alert('Action', 'Navigate to payment screen')
    }
  ]

  // Stat cards data for drivers
  const statCards: StatCard[] = [
    {
      title: 'Active Fines',
      value: stats.activeFines,
      icon: 'ticket',
      color: 'bg-red-500',
      textColor: 'text-white'
    },
    {
      title: 'Total Paid',
      value: `MKW${stats.totalPaid.toLocaleString()}`,
      icon: 'cash-check',
      color: 'bg-green-500',
      textColor: 'text-white'
    },
    {
      title: 'Overdue Fines',
      value: stats.overdueFines,
      icon: 'ticket-percent',
      color: 'bg-orange-500',
      textColor: 'text-white'
    },
    {
      title: 'Total Outstanding',
      value: `MKW${stats.totalOutstanding.toLocaleString()}`,
      icon: 'account-clock',
      color: 'bg-violet-400',
      textColor: 'text-white'
    }
  ]

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
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-4">
        {/* Welcome Header */}
        <View className="bg-blue-500 to-purple-600 rounded-2xl p-8 mb-6 shadow-lg">
          <Text className="text-2xl text-white font-bold mb-2">Welcome back, {user?.firstName} {user?.lastName}!</Text>
          <Text className="text-white text-opacity-90 mt-2">Driver Dashboard</Text>
        </View>

        {/* Loading indicator */}
        {loading && (
          <View className="flex-1 justify-center items-center py-10">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="mt-4 text-gray-600">Loading dashboard data...</Text>
          </View>
        )}

        {/* Error message */}
        {error && (
          <View className="bg-red-100 border border-red-400 rounded-lg p-4 mb-6">
            <Text className="text-red-700 font-medium">Connection Error</Text>
            <Text className="text-red-600 mt-1">{error}</Text>
            <Text className="text-red-500 text-sm mt-2">
              Please make sure the backend server is running
            </Text>
          </View>
        )}

        {/* Stats Overview */}
        {!loading && (
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">Your Fine Overview</Text>
            <View className="flex-row flex-wrap justify-between">
              {statCards.map((stat, index) => (
                <View 
                  key={index} 
                  className={`w-[48%] ${stat.color} rounded-2xl p-4 mb-4 shadow`}
                >
                  <View className="flex-row justify-between items-start">
                    <View>
                      <Text className={`${stat.textColor} text-opacity-90`}>{stat.title}</Text>
                      <Text className={`text-2xl font-bold ${stat.textColor} mt-1`}>{stat.value}</Text>
                    </View>
                    <MaterialCommunityIcons 
                      name={stat.icon} 
                      size={24} 
                      color={stat.textColor === 'text-white' ? 'white' : 'black'} 
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View className="mb-6 bg-white border border-gray-300 rounded-2xl p-4 shadow rounded-2xl overflow-hidden"> 
          <Text className="text-xl font-bold text-gray-800 mb-4">Quick Actions</Text>
          <View className="space-y-4 rounded-lg">
            {quickActions.map((action) => (
              <TouchableOpacity 
                key={action.id}
                className="flex-row items-center rounded-2xl py-4 border-b border-gray-300"
                onPress={action.onPress}
              >
                <View className={`w-12 h-12 ${action.color} rounded-full p-2 items-center justify-center`}>
                  <MaterialCommunityIcons 
                    name={action.icon} 
                    size={24} 
                    color={action.iconColor} 
                  />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-lg font-semibold text-gray-900">{action.title}</Text>
                  <Text className="text-gray-600">{action.subtitle}</Text>
                </View>
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={24} 
                  color="#9CA3AF" 
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Fines */}
        <View className="bg-white border border-gray-300 rounded-2xl p-4 shadow mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-800">Recent Fines</Text>
            <TouchableOpacity>
              <Text className="text-blue-500">View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentFines.length > 0 ? (
            <View className="space-y-4">
              {recentFines.map((fine) => (
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
          ) : (
            <Text className="text-gray-500 text-center py-4">No recent fines found</Text>
          )}
        </View>
      </View>
    </ScrollView>
  )
}