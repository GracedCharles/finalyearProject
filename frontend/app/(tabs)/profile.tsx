import { useUser } from '@clerk/clerk-expo'
import React from 'react'
import { Text, View } from 'react-native'

export default function ProfileScreen() {
  const { user } = useUser()

  return (
    <View className="flex-1 justify-center items-center bg-white p-6">
      <Text className="text-2xl font-bold mb-6">Profile</Text>
      {user ? (
        <View className="w-full">
          <Text className="text-lg mb-2">Name: {user.firstName} {user.lastName}</Text>
          <Text className="text-lg mb-2">Email: {user.primaryEmailAddress?.emailAddress}</Text>
        </View>
      ) : (
        <Text>Loading user information...</Text>
      )}
    </View>
  )
}