import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Tabs } from 'expo-router'
import React from 'react'
import { AuthGuard } from '../../src/components/AuthGuard'
import { SignOutButton } from '../../src/components/SignOutButton'

export default function TabLayout() {
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
            title: 'Dashboard',
            tabBarLabel: 'Dashboard',
            headerTitle: 'Dashboard',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="view-dashboard" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="driver-fines"
          options={{
            title: 'Driver Fines',
            tabBarLabel: 'Driver Fines',
            headerTitle: 'Driver Fines',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="car-wash" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="issue-fine"
          options={{
            title: 'Issue Fine',
            tabBarLabel: 'Issue Fine',
            headerTitle: 'Issue New Fine',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="car-wash" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="view-fines"
          options={{
            title: 'View Fines',
            tabBarLabel: 'View Fines',
            headerTitle: 'View Issued Fines',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="car-wash" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarLabel: 'Profile',
            headerTitle: 'My Profile',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="account" size={24} color={color} />
            ),
          }}
        />
        
      </Tabs>
    </AuthGuard>
  )
}