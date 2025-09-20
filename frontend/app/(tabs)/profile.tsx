import { useClerk, useUser } from '@clerk/clerk-expo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: handleSignOut, style: 'destructive' }
      ]
    );
  };

  const MenuItem = ({ iconName, title, subtitle, onPress, last = false }: {
    iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
    title: string;
    subtitle?: string;
    onPress: () => void;
    last?: boolean;
  }) => (
    <TouchableOpacity 
      onPress={onPress}
      className={`flex-row items-center p-4 ${!last ? 'border-b border-gray-200' : ''}`}
    >
      <View className="w-10 h-10 bg-blue-100 p-2 rounded-full items-center justify-center mr-4">
        <MaterialCommunityIcons name={iconName} size={22} color="#3B82F6" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-medium text-base">{title}</Text>
        {subtitle && <Text className="text-gray-500 text-sm mt-1">{subtitle}</Text>}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-4">
        
        {/* Profile Header Card */}
        <View className="bg-white border border-gray-300 rounded-2xl p-6 mb-6 shadow">
          <View className="items-center mb-4">
            <View className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full items-center justify-center mb-3">
              <Text className="text-black text-2xl font-bold">
                {user.firstName}{user.lastName}
              </Text>
            </View>
            <Text className="text-xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </Text>
            <Text className="text-gray-600 text-base mt-1">
              {user.primaryEmailAddress?.emailAddress}
            </Text>
          </View>
          
          <View className="flex-row justify-between mt-4 pt-4 border-t border-gray-100">
            <View className="items-center">
              <Text className="text-lg font-bold text-gray-900">12</Text>
              <Text className="text-gray-600 text-sm">Fines Paid</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-gray-900">MKW8,500</Text>
              <Text className="text-gray-600 text-sm">Total Paid</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-gray-900">0</Text>
              <Text className="text-gray-600 text-sm">Pending</Text>
            </View>
          </View>
        </View>
        
        {/* Profile Settings Card */}
        <View className="bg-white border border-gray-300 rounded-2xl mb-6 shadow">
          <View className="p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">Profile Settings</Text>
          </View>
          <MenuItem
            iconName="account"
            title="Personal Information"
            subtitle="Update your profile details"
            onPress={() => Alert.alert('Coming Soon', 'Profile editing feature will be available soon')}
          />
          <MenuItem
            iconName="shield-account"
            title="Security"
            subtitle="Change password & 2FA settings"
            onPress={() => Alert.alert('Coming Soon', 'Security settings will be available soon')}
          />
          <MenuItem
            iconName="credit-card"
            title="Payment Methods"
            subtitle="Manage your payment options"
            onPress={() => Alert.alert('Coming Soon', 'Payment methods will be available soon')}
          />
          <MenuItem
            iconName="bell"
            title="Notifications"
            subtitle="Configure notification preferences"
            onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon')}
          />
          <MenuItem
            iconName="help-circle"
            title="Help & Support"
            subtitle="Get help and contact support"
            onPress={() => Alert.alert('Coming Soon', 'Help center will be available soon')}
            last={true}
          />
        </View>
        
        {/* Account Details Card */}
        <View className="bg-white border border-gray-300 rounded-2xl mb-6 shadow">
          <View className="p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">Account Details</Text>
          </View>
          
          <View className="p-4 flex-row items-center">
            <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4">
              <MaterialCommunityIcons name="email" size={20} color="#6B7280" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-600 text-sm">Email Address</Text>
              <Text className="text-gray-900 font-medium">{user.primaryEmailAddress?.emailAddress}</Text>
            </View>
          </View>
          
          <View className="p-4 border-t border-gray-200 flex-row items-center">
            <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4">
              <MaterialCommunityIcons name="phone" size={20} color="#6B7280" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-600 text-sm">Phone Number</Text>
              <Text className="text-gray-900 font-medium">
                {user.primaryPhoneNumber?.phoneNumber || 'Not provided'}
              </Text>
            </View>
          </View>
          
          <View className="p-4 border-t border-gray-200 flex-row items-center">
            <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4">
              <MaterialCommunityIcons name="calendar" size={20} color="#6B7280" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-600 text-sm">Member Since</Text>
              <Text className="text-gray-900 font-medium">
                {new Date(user.createdAt || '').toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={confirmSignOut}
          disabled={isLoading}
          className="bg-red-500 rounded-lg p-4 mb-6 shadow"
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white text-center font-bold">Sign Out</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}