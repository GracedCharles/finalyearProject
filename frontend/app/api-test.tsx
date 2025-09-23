import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { fineApi, offenseApi, userApi } from '../src/utils/api';
import { useAuthToken } from '../src/utils/authHelpers';

// Import Platform to show current platform in the UI
import { Platform } from 'react-native';

export default function ApiTestScreen() {
  const [offenseTypes, setOffenseTypes] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, loading: authLoading } = useAuthToken();

  // Get the API base URL for display
  const getApiBaseUrl = () => {
    const computerIp = process.env.EXPO_PUBLIC_BACKEND_IP || '192.168.43.72';
    
    if (Platform.OS === 'android') {
      return `http://${computerIp}:5000/api`;
    } else if (Platform.OS === 'ios') {
      return `http://${computerIp}:5000/api`;
    } else {
      return 'http://localhost:5000/api';
    }
  };

  const apiBaseUrl = getApiBaseUrl();

  useEffect(() => {
    const testApi = async () => {
      if (authLoading) {
        console.log('Still loading auth...');
        return;
      }
      
      try {
        console.log('Testing API connection...');
        console.log('Current API base URL:', apiBaseUrl);
        console.log('Current auth token:', token ? 'Available' : 'Not available');
        
        // Test public endpoint first
        console.log('Testing public endpoint: /api/offenses');
        const types = await offenseApi.getOffenseTypes();
        setOffenseTypes(types);
        console.log('Public endpoint test successful:', types);
        
        // Test authenticated endpoints if we have a token
        if (token) {
          try {
            console.log('Testing authenticated endpoint: /api/users/me');
            const profile = await userApi.getCurrentUser();
            setUserProfile(profile);
            console.log('User profile test successful:', profile);
          } catch (authError: any) {
            console.error('User profile test failed:', authError);
          }
          
          try {
            console.log('Testing authenticated endpoint: /api/fines/dashboard');
            const stats = await fineApi.getDashboardStats();
            setDashboardStats(stats);
            console.log('Dashboard stats test successful:', stats);
          } catch (authError: any) {
            console.error('Dashboard stats test failed:', authError);
          }
        } else {
          console.log('Skipping authenticated tests - no token available');
        }
        
        setLoading(false);
        console.log('All API tests completed');
      } catch (err: any) {
        console.error('API test failed:', err);
        setError(err.message || 'Unknown error occurred');
        setLoading(false);
        Alert.alert('API Test Failed', err.message || 'Unknown error occurred');
      }
    };

    testApi();
  }, [token, authLoading, apiBaseUrl]);

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mb-6">API Connection Test</Text>
      
      {/* Show current configuration */}
      <View className="bg-blue-50 p-4 rounded-lg mb-6">
        <Text className="text-lg font-bold mb-2">Current Configuration:</Text>
        <Text className="text-gray-700">Platform: {Platform.OS}</Text>
        <Text className="text-gray-700">API Base URL: {apiBaseUrl}</Text>
        <Text className="text-gray-700">Computer IP: {process.env.EXPO_PUBLIC_BACKEND_IP || '192.168.43.72'}</Text>
        <Text className="text-gray-700">Auth Token: {token ? 'Available' : 'Not Available'}</Text>
      </View>
      
      {loading || authLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="mt-4">Testing API connection...</Text>
          {authLoading && <Text className="mt-2">Loading authentication...</Text>}
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 text-lg mb-4">API Test Failed</Text>
          <Text className="text-gray-600 mb-4">{error}</Text>
          <TouchableOpacity 
            className="bg-blue-500 p-3 rounded-lg"
            onPress={() => {
              setLoading(true);
              setError(null);
              setOffenseTypes([]);
              setUserProfile(null);
              setDashboardStats(null);
              
              const testApi = async () => {
                try {
                  console.log('Retesting API connection...');
                  const types = await offenseApi.getOffenseTypes();
                  setOffenseTypes(types);
                  setLoading(false);
                  console.log('API retest successful:', types);
                  Alert.alert('Success', 'API connection is working!');
                } catch (err: any) {
                  console.error('API retest failed:', err);
                  setError(err.message || 'Unknown error occurred');
                  setLoading(false);
                  Alert.alert('API Test Failed', err.message || 'Unknown error occurred');
                }
              };

              testApi();
            }}
          >
            <Text className="text-white text-center font-bold">Retry Test</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text className="text-green-500 text-lg mb-4">API Connection Successful!</Text>
          
          <View className="mb-6">
            <Text className="text-lg font-bold mb-2">Public Endpoint Test:</Text>
            <Text className="text-gray-600 mb-4">
              Found {offenseTypes.length} offense types in the database.
            </Text>
            
            {offenseTypes.length > 0 ? (
              offenseTypes.map((type, index) => (
                <View key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <Text className="font-bold">{type.description}</Text>
                  <Text className="text-gray-600">Code: {type.code}</Text>
                  <Text className="text-gray-600">Amount: MWK{type.amount}</Text>
                </View>
              ))
            ) : (
              <Text className="text-gray-500 italic">No offense types found in the database.</Text>
            )}
          </View>
          
          {token && (
            <View className="mb-6">
              <Text className="text-lg font-bold mb-2">Authentication Tests:</Text>
              
              {userProfile ? (
                <View className="mb-4">
                  <Text className="text-green-500">✓ User Profile API: Success</Text>
                  <View className="mt-2 ml-4">
                    <Text className="text-gray-600">Name: {userProfile.firstName} {userProfile.lastName}</Text>
                    <Text className="text-gray-600">Email: {userProfile.email}</Text>
                    <Text className="text-gray-600">Role: {userProfile.role}</Text>
                  </View>
                </View>
              ) : (
                <Text className="text-yellow-500">○ User Profile API: Not tested</Text>
              )}
              
              {dashboardStats ? (
                <View>
                  <Text className="text-green-500">✓ Dashboard Stats API: Success</Text>
                  <View className="mt-2 ml-4">
                    <Text className="text-gray-600">Fines Today: {dashboardStats.finesToday}</Text>
                    <Text className="text-gray-600">Pending Fines: {dashboardStats.pendingFines}</Text>
                    <Text className="text-gray-600">Total Collected: MWK{dashboardStats.totalCollected}</Text>
                  </View>
                </View>
              ) : (
                <Text className="text-yellow-500">○ Dashboard Stats API: Not tested</Text>
              )}
            </View>
          )}
          
          {!token && (
            <View className="mb-6">
              <Text className="text-lg font-bold mb-2">Authentication Status:</Text>
              <Text className="text-yellow-500">No authentication token available</Text>
              <Text className="text-gray-600 mt-2">Some API endpoints require authentication. Please log in to test authenticated endpoints.</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}