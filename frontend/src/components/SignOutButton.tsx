import { useClerk } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk()
  const router = useRouter()
  
  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect to auth screen
      setTimeout(() => {
        router.replace('/(auth)')
      }, 100)
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }
  
  return (
    <TouchableOpacity 
      className="bg-red-500 px-4 py-2 rounded-lg mr-4"
      onPress={handleSignOut}
    >
      <Text className="text-white font-bold">Sign Out</Text>
    </TouchableOpacity>
  )
}
