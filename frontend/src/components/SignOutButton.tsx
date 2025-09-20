import { useClerk } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk()
  const router = useRouter()
  
  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect to auth screen
      router.replace('/(auth)')
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }
  
  return (
    <TouchableOpacity 
      className="bg-gray-200 p-2 rounded-full mr-4"
      onPress={handleSignOut}
    >
      {/* Notification bange */}
      <View>
         <MaterialCommunityIcons name="bell" size={28} color="black" />
      </View>
    </TouchableOpacity>
  )
}