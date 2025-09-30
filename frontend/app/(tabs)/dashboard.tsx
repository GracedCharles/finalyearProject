import { useUser } from '@clerk/clerk-expo'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { fineApi, User, userApi } from '../../src/utils/api'
import DriverDashboardScreen from '../components/driver-dashboard'

// Define types
interface DashboardStats {
  finesIssuedToday: number
  pendingPayments: number
  totalCollected: number
  totalOutstanding: number
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

export default function DashboardScreen() {
 const { user } = useUser()
  const router = useRouter()
  
  const [stats, setStats] = useState<DashboardStats>({
    finesIssuedToday: 0,
    pendingPayments: 0,
    totalCollected: 0,
    totalOutstanding: 0
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  // Fetch user role and dashboard stats
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch user role from backend
        const currentUser: User = await userApi.getCurrentUser();
        setUserRole(currentUser.role)
        
        // Only fetch officer dashboard stats if user is an officer or admin
        if (currentUser.role !== 'clerk') {
          try {
            const dashboardStats: any = await fineApi.getDashboardStats();
            console.log('Officer dashboard stats API response:', dashboardStats);
            
            setStats({
              finesIssuedToday: dashboardStats.finesToday || 0,
              pendingPayments: dashboardStats.pendingFines || 0,
              totalCollected: dashboardStats.totalCollected || 0,
              totalOutstanding: 0 // This would need a separate API call to calculate
            });
          } catch (dashboardError: any) {
            console.error('Error fetching dashboard stats:', dashboardError);
            setError(dashboardError.message || 'Failed to load dashboard statistics');
          }
        }
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        setError(error.message || 'Failed to load dashboard data. Please check your network connection and make sure the backend server is running.');
      } finally {
        setLoading(false)
      }
    };

    fetchUserData();
  }, [])

  // If still loading, show loading indicator
  if (loading) {
    return (
      <ScrollView className="flex-1 bg-gray-100">
        <View className="p-4">
          <View className="flex-1 justify-center items-center py-10">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="mt-4 text-gray-600">Loading dashboard data...</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // If user is a clerk, show driver dashboard
  if (userRole === 'clerk') {
    return <DriverDashboardScreen />;
  }

  // Quick action items for officers
  const officerQuickActions: QuickAction[] = [
    {
      id: 'issue-fine',
      title: 'Issue New Fine',
      subtitle: 'Create a new traffic fine',
      icon: 'ticket-percent',
      color: 'bg-green-500',
      iconColor: 'white',
      onPress: () => router.push('/(tabs)/issue-fine')
    },
    {
      id: 'view-fines',
      title: 'View Issued Fines',
      subtitle: 'Check all fines you\'ve issued',
      icon: 'clipboard-list',
      color: 'bg-blue-500',
      iconColor: 'white',
      onPress: () => router.push('/(tabs)/view-fines')
    },
    {
      id: 'api-test',
      title: 'API Test',
      subtitle: 'Test API connectivity',
      icon: 'connection',
      color: 'bg-purple-500',
      iconColor: 'white',
      onPress: () => router.push('/api-test')
    }
  ]

  // Stat cards data for officers
  const officerStatCards: StatCard[] = [
    {
      title: 'Fines Today',
      value: stats.finesIssuedToday,
      icon: 'ticket',
      color: 'bg-red-500',
      textColor: 'text-white'
    },
    {
      title: 'Pending Payments',
      value: stats.pendingPayments,
      icon: 'clock-outline',
      color: 'bg-blue-500',
      textColor: 'text-white'
    },
    {
      title: 'Total Collected',
      value: `MKW${stats.totalCollected.toLocaleString()}`,
      icon: 'cash',
      color: 'bg-green-500',
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

  // Render officer dashboard content
  const renderOfficerDashboard = () => (
    <View>
      {/* Welcome Header */}
      <View className="bg-blue-500 to-purple-600 rounded-2xl p-8 mb-6 shadow-lg">
        <Text className="text-2xl text-white font-bold">Welcome back, {user?.firstName} {user?.lastName}!</Text>
        <Text className="text-white text-opacity-90">Traffic Officer Dashboard</Text>
      </View>

      {/* Error message */}
      {error && (
        <View className="bg-red-100 border border-red-400 rounded-lg p-4 mb-6">
          <Text className="text-red-700 font-medium">Connection Error</Text>
          <Text className="text-red-600 mt-1">{error}</Text>
          <Text className="text-red-500 text-sm mt-2">
            Please make sure the backend server is running on http://localhost:5000
          </Text>
        </View>
      )}

      {/* Stats Overview */}
      <View className="mb-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">Today's Overview</Text>
        <View className="flex-row flex-wrap justify-between">
          {officerStatCards.map((stat, index) => (
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

      {/* Quick Actions */}
      <View className="mb-6 bg-white border border-gray-300 rounded-2xl p-4 shadow rounded-2xl overflow-hidden"> 
        <Text className="text-xl font-bold text-gray-800 mb-4">Quick Actions</Text>
        <View className="space-y-4 rounded-lg">
          {officerQuickActions.map((action) => (
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

      {/* Recent Activity */}
      <View className="bg-white border border-gray-300 rounded-2xl p-4 shadow mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-800">Recent Activity</Text>
          <TouchableOpacity>
            <Text className="text-blue-500">View All</Text>
          </TouchableOpacity>
        </View>
        <View className="space-y-6">
          <View className="flex-row items-center justify-between">
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
              <MaterialCommunityIcons name="ticket" size={20} color="#3B82F6" />
            </View>
            <View className="ml-3 flex-row justify-between flex-1">
              <Text className="font-medium text-gray-900">Fine #FN-2023-001 issued</Text>
              <Text className="text-gray-500 text-sm">2 hours ago</Text>
            </View>
          </View>
          <View className="flex-row items-center mt-4">
            <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
              <MaterialCommunityIcons name="cash" size={20} color="#10B981" />
            </View>
            <View className="ml-3 flex-row justify-between flex-1">
              <Text className="font-medium text-gray-900">Payment received</Text>
              <Text className="text-gray-500 text-sm">5 hours ago</Text>
            </View>
          </View>
          <View className="flex-row items-center mt-4">
            <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center">
              <MaterialCommunityIcons name="account" size={20} color="#8B5CF6" />
            </View>
            <View className="ml-3 flex-row items-center justify-between flex-1">
              <Text className="font-medium text-gray-900">New driver registered</Text>
              <Text className="text-gray-500 text-sm">Yesterday</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-4">
        {renderOfficerDashboard()}
      </View>
    </ScrollView>
  )
}