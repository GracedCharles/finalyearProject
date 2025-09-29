import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { User, userApi } from '../../src/utils/api';

export default function EditOfficerProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [officerRegistrationNumber, setOfficerRegistrationNumber] = useState('');
  const [driverLicenseNumber, setDriverLicenseNumber] = useState('');

  // Fetch current user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await userApi.getCurrentUser();
        setUserProfile(profile);
        setOfficerRegistrationNumber(profile.officerRegistrationNumber || '');
        setDriverLicenseNumber(profile.driverLicenseNumber || '');
      } catch (error) {
        console.error('Error fetching user profile:', error);
        Alert.alert('Error', 'Failed to load profile information');
        router.back();
      }
    };

    fetchUserProfile();
  }, []);

  const handleSave = async () => {
    if (!officerRegistrationNumber.trim() && !driverLicenseNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter either officer registration number or driver license number');
      return;
    }

    setLoading(true);
    try {
      // Update user profile
      const updatedProfile = await userApi.setupUserProfile({
        firstName: userProfile?.firstName || '',
        lastName: userProfile?.lastName || '',
        address: userProfile?.address || '',
        phoneNumber: userProfile?.phoneNumber || '',
        driverLicenseNumber: driverLicenseNumber.trim(),
        officerRegistrationNumber: officerRegistrationNumber.trim()
      });

      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-4">
        <View className="bg-white border border-gray-300 rounded-2xl p-6 mb-6 shadow">
          <Text className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</Text>
          
          {userProfile?.role !== 'clerk' && (
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">Officer Registration Number</Text>
              <TextInput
                value={officerRegistrationNumber}
                onChangeText={setOfficerRegistrationNumber}
                placeholder="Enter your officer registration number"
                className="border border-gray-300 rounded-lg p-4 bg-white"
                keyboardType="default"
              />
              <Text className="text-gray-500 text-sm mt-2">
                This is your official traffic officer registration number
              </Text>
            </View>
          )}
          
          {userProfile?.role === 'clerk' && (
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">Driver License Number</Text>
              <TextInput
                value={driverLicenseNumber}
                onChangeText={setDriverLicenseNumber}
                placeholder="Enter your driver license number"
                className="border border-gray-300 rounded-lg p-4 bg-white"
                keyboardType="default"
              />
              <Text className="text-gray-500 text-sm mt-2">
                This is your official driver license number
              </Text>
            </View>
          )}

          <View className="flex-row justify-between mt-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-1 bg-gray-200 rounded-lg p-4 mr-2"
              disabled={loading}
            >
              <Text className="text-gray-800 text-center font-bold">Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleSave}
              className="flex-1 bg-blue-500 rounded-lg p-4 ml-2"
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-center font-bold">Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}