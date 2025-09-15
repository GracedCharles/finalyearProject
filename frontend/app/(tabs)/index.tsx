import { Redirect, Tabs } from 'expo-router'
import React from 'react'
import { SignOutButton } from '../../src/components/SignOutButton'

export default function TabIndex() {
  // Redirect to dashboard by default
  return <Redirect href="/(tabs)/dashboard" />
}

export function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerRight: () => <SignOutButton />,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          headerTitle: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="issue-fine"
        options={{
          title: 'Issue Fine',
          tabBarLabel: 'Issue Fine',
          headerTitle: 'Issue Traffic Fine',
        }}
      />
      <Tabs.Screen
        name="view-fines"
        options={{
          title: 'View Fines',
          tabBarLabel: 'View Fines',
          headerTitle: 'Issued Fines',
        }}
      />
      <Tabs.Screen
        name="driver-fines"
        options={{
          title: 'My Fines',
          tabBarLabel: 'My Fines',
          headerTitle: 'My Traffic Fines',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          headerTitle: 'My Profile',
        }}
      />
    </Tabs>
  )
}
