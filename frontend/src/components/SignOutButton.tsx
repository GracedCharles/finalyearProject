import { useClerk } from '@clerk/clerk-expo'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { useRouter } from 'expo-router'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'

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
    <View className="flex-row items-center justify-between mr-4">
     {/* Notification icon */}
     <View className="flex-row items-center justify-center w-12 h-12 bg-gray-300 rounded-full mr-2" >
     <MaterialCommunityIcons name="bell" size={28} color="black" />

     </View>
     {/* Sign out button */}
    <TouchableOpacity 
      className="bg-red-500 px-4 py-2 rounded-xl ml-2"
      onPress={handleSignOut}
    >
      <MaterialCommunityIcons name="logout" size={24} color="white" />
    </TouchableOpacity>
    </View>
  )
}
