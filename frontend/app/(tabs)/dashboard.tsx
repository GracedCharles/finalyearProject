import { useUser } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

// Define types
interface DashboardStats {
  finesIssuedToday: number
  pendingPayments: number
  totalCollected: number
}

export default function DashboardScreen() {
  const { user } = useUser()
  const router = useRouter()
  
  const [stats, setStats] = useState<DashboardStats>({
    finesIssuedToday: 0,
    pendingPayments: 0,
    totalCollected: 0,
  })

  // Mock data (would be replaced with API call)
  useEffect(() => {
    // In a real app, this would fetch from your backend API
    setStats({
      finesIssuedToday: 5,
      pendingPayments: 12,
      totalCollected: 1250,
    })
  }, [])

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <Text className="text-2xl font-bold mb-2">Welcome, {user?.firstName}!</Text>
        <Text className="text-gray-600 mb-6">Traffic Officer Dashboard</Text>
        
        {/* Stats Cards */}
        <View className="flex-row flex-wrap mb-6">
          <View className="w-[48%] bg-white rounded-lg p-4 mb-4 mr-[4%] shadow">
            <Text className="text-gray-600">Fines Today</Text>
            <Text className="text-3xl font-bold">{stats.finesIssuedToday}</Text>
          </View>
          
          <View className="w-[48%] bg-white rounded-lg p-4 mb-4 shadow">
            <Text className="text-gray-600">Pending Payments</Text>
            <Text className="text-3xl font-bold">{stats.pendingPayments}</Text>
          </View>
          
          <View className="w-[48%] bg-white rounded-lg p-4 shadow">
            <Text className="text-gray-600">Total Collected</Text>
            <Text className="text-3xl font-bold">${stats.totalCollected}</Text>
          </View>
        </View>
        
        {/* Quick Actions */}
        <Text className="text-xl font-bold mb-4">Quick Actions</Text>
        
        <TouchableOpacity 
          className="bg-white rounded-lg p-4 mb-4 shadow"
          onPress={() => router.push('/(tabs)/issue-fine')}
        >
          <Text className="text-lg font-semibold">Issue New Fine</Text>
          <Text className="text-gray-600">Create a new traffic fine</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-white rounded-lg p-4 mb-4 shadow"
          onPress={() => router.push('/(tabs)/view-fines')}
        >
          <Text className="text-lg font-semibold">View Issued Fines</Text>
          <Text className="text-gray-600">Check all fines you've issued</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-white rounded-lg p-4 mb-4 shadow"
        >
          <Text className="text-lg font-semibold">Reports & Analytics</Text>
          <Text className="text-gray-600">View detailed reports</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-white rounded-lg p-4 shadow"
        >
          <Text className="text-lg font-semibold">Audit Trail</Text>
          <Text className="text-gray-600">View system activity logs</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}