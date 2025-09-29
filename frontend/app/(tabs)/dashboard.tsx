import { useUser } from '@clerk/clerk-expo'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { fineApi, User, userApi } from '../../src/utils/api'
import { realtimeService } from '../../src/utils/realtime'
import DriverDashboardScreen from '../components/driver-dashboard'

// Define types
interface DashboardStats {
  finesIssuedToday: number;
  pendingPayments: number;
  totalCollected: number;
  totalOutstanding: number;
}

interface RecentActivity {
  id: string;
  type: 'audit' | 'fine' | 'payment';
  action: string;
  description: string;
  timestamp: string;
  user?: {
    firstName: string;
    lastName: string;
  };
  fine?: {
    id: string;
    fineId: string;
    amount: number;
  };
  payment?: {
    id: string;
    amount: number;
  };
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
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Fetch user role and dashboard stats
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch user role from backend
        const currentUser: User = await userApi.getCurrentUser();
        setCurrentUser(currentUser)
        setUserRole(currentUser.role)
        
        // Connect to real-time service
        realtimeService.connect()
        if (currentUser._id) {
          realtimeService.setUserId(currentUser._id)
        }
        
        // Only fetch officer dashboard stats if user is an officer or admin
        if (currentUser.role !== 'clerk') {
          try {
            const dashboardStats = await fineApi.getDashboardStats();
            setStats({
              finesIssuedToday: dashboardStats.finesToday || 0,
              pendingPayments: dashboardStats.pendingFines || 0,
              totalCollected: dashboardStats.totalCollected || 0,
              totalOutstanding: 0 // This would need a separate API call to calculate
            });
            
            // Fetch recent activity
            const activity = await fineApi.getRecentActivity();
            // Remove any potential duplicates by ID
            const uniqueActivity = activity.filter((item, index, self) =>
              index === self.findIndex((t) => t.id === item.id)
            );
            setRecentActivity(uniqueActivity);
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
    
    // Set up real-time listeners
    const handleFineIssued = (data: any) => {
      console.log('Real-time fine issued:', data);
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        finesIssuedToday: prevStats.finesIssuedToday + 1
      }));
      
      // Add to recent activity
      const newActivity: RecentActivity = {
        id: `fine-${Date.now()}`,
        type: 'fine',
        action: 'FINE_ISSUED',
        description: `Issued fine ${data.fineId} to driver ${data.driverLicenseNumber}`,
        timestamp: new Date().toISOString()
      };
      
      setRecentActivity(prevActivity => [newActivity, ...prevActivity].slice(0, 10));
    };
    
    const handlePaymentProcessed = (data: any) => {
      console.log('Real-time payment processed:', data);
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        totalCollected: prevStats.totalCollected + data.amount
      }));
      
      // Add to recent activity
      const newActivity: RecentActivity = {
        id: `payment-${Date.now()}`,
        type: 'payment',
        action: 'PAYMENT_PROCESSED',
        description: `Processed payment for fine ${data.fineId}`,
        timestamp: new Date().toISOString()
      };
      
      setRecentActivity(prevActivity => [newActivity, ...prevActivity].slice(0, 10));
    };
    
    realtimeService.on('fineIssued', handleFineIssued);
    realtimeService.on('paymentProcessed', handlePaymentProcessed);
    
    // Cleanup
    return () => {
      realtimeService.off('fineIssued', handleFineIssued);
      realtimeService.off('paymentProcessed', handlePaymentProcessed);
    };
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

  // Get icon for activity type
  const getActivityIcon = (type: string, action: string): IconName => {
    if (type === 'fine' || action.includes('FINE')) return 'ticket';
    if (type === 'payment' || action.includes('PAYMENT')) return 'cash';
    if (type === 'audit') return 'account';
    return 'information';
  };

  // Get icon color for activity type
  const getActivityIconColor = (type: string, action: string): string => {
    if (type === 'fine' || action.includes('FINE')) return '#3B82F6';
    if (type === 'payment' || action.includes('PAYMENT')) return '#10B981';
    if (type === 'audit') return '#8B5CF6';
    return '#6B7280';
  };

  // Get background color for activity icon
  const getActivityIconBackground = (type: string, action: string): string => {
    if (type === 'fine' || action.includes('FINE')) return 'bg-blue-100';
    if (type === 'payment' || action.includes('PAYMENT')) return 'bg-green-100';
    if (type === 'audit') return 'bg-purple-100';
    return 'bg-gray-100';
  };

  // Format timestamp to relative time
  const formatTimeAgo = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Render officer dashboard content
  const renderOfficerDashboard = () => (
    <View>
      {/* Welcome Header */}
      <View className="bg-blue-500 to-purple-600 rounded-2xl p-8 mb-6 shadow-lg">
        <Text className="text-2xl text-white font-bold">Welcome back, {user?.firstName} {user?.lastName}!</Text>
        <Text className="text-white text-opacity-90">Traffic Officer Dashboard</Text>
        {currentUser?.driverLicenseNumber && (
          <View className="flex-row mt-2 p-3 rounded-xl bg-blue-400 bg-opacity-20">
          <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4">
           <MaterialCommunityIcons name="card-account-details" size={20} color="#6B7280" />
         </View>
         <View>
         <Text className="text-white text-sm">Driver License Number</Text>
         <Text className="text-white text-lg font-bold">{currentUser.driverLicenseNumber}</Text>
         </View>
       </View>
        )}
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

      {/* Real-time connection status */}
      {/* <View className={`p-3 rounded-lg mb-4 ${realtimeService.isConnected() ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'}`}>
        <Text className={`font-medium ${realtimeService.isConnected() ? 'text-green-800' : 'text-red-800'}`}>
          {realtimeService.isConnected() ? 'Real-time updates connected' : 'Real-time updates disconnected'}
        </Text>
      </View> */}

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
        </View>
        <View className="space-y-4">
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.slice(0, 10).map((activity) => (
              <View key={activity.id} className="flex-row items-center py-3 border-b border-gray-200">
                <View className={`w-10 h-10 ${getActivityIconBackground(activity.type, activity.action)} rounded-full items-center justify-center`}>
                  <MaterialCommunityIcons 
                    name={getActivityIcon(activity.type, activity.action)} 
                    size={20} 
                    color={getActivityIconColor(activity.type, activity.action)} 
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-medium text-gray-900">{activity.description}</Text>
                  <Text className="text-gray-500 text-sm">{formatTimeAgo(activity.timestamp)}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text className="text-gray-500 text-center py-4">No recent activity</Text>
          )}
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