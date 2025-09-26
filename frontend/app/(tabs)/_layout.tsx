import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Tabs } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { AuthGuard } from '../../src/components/AuthGuard'
import { SignOutButton } from '../../src/components/SignOutButton'
import { User, userApi } from '../../src/utils/api'

export default function TabLayout() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const currentUser: User = await userApi.getCurrentUser()
        setUserRole(currentUser.role)
      } catch (error) {
        console.error('Error fetching user role:', error)
        // Default to officer role if there's an error
        setUserRole('officer')
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerRight: () => <SignOutButton />,
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: 'white',
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
          tabBarIconStyle: {
            marginBottom: -3,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          redirect={true}
          options={{
            href: '/(tabs)/dashboard',
          }}
        />
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Home',
            tabBarLabel: 'Home',
            headerTitle: 'Home',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="home" size={24} color={color} />
            ),
          }}
        />
        
        <Tabs.Screen
        name="driver-fines"
        options={{
          title: userRole === 'clerk' ? 'My Fines' : 'Driver Fines',
          tabBarLabel: userRole === 'clerk' ? 'My Fines' : 'Driver Fines',
          headerTitle: userRole === 'clerk' ? 'My Fines' : 'Driver Fines',
          tabBarIcon: ({ color }) =>
            userRole === 'clerk' ? (
              <MaterialCommunityIcons name="ticket-account" size={24} color={color} />
            ) : (
              <MaterialCommunityIcons name="account-tie" size={24} color={color} />
            ),
        }}
      />

      {userRole !== 'clerk' ? (
        <Tabs.Screen
          name="issue-fine"
          options={{
            title: 'Issue Fine',
            tabBarLabel: 'Issue Fine',
            headerTitle: 'Issue New Fine',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="plus" size={24} color={color} />
            ),
          }}
        />
      ) : (
        <Tabs.Screen name="issue-fine" options={{ href: null }} />
      )}

      {userRole !== 'clerk' ? (
        <Tabs.Screen
          name="view-fines"
          options={{
            title: 'View Fines',
            tabBarLabel: 'View Fines',
            headerTitle: 'View Issued Fines',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="car" size={24} color={color} />
            ),
          }}
        />
      ) : (
        <Tabs.Screen name="view-fines" options={{ href: null }} />
      )}
<Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarLabel: 'Profile',
            headerTitle: 'Profile',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="account-circle" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </AuthGuard>
  )
}