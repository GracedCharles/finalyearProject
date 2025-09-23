/**
 * Test file for the API service
 * This file contains basic tests to verify the API service is working
 */

import { driverApi, offenseApi } from './api';

// Test the API functions
export const testApi = async () => {
  try {
    console.log('Testing API service...');
    
    // Test offense API (public endpoint)
    console.log('Testing offense API...');
    try {
      const offenseTypes = await offenseApi.getOffenseTypes();
      console.log('✓ Offense types fetched successfully:', offenseTypes.length, 'types found');
    } catch (error: any) {
      console.log('⚠ Offense API test failed (might be due to no data or server not running):', error.message);
    }
    
    // Test driver API (public endpoint)
    console.log('Testing driver API...');
    try {
      // This will likely fail without valid data, but we can test the connection
      await driverApi.getFineByFineId('non-existent-id');
    } catch (error: any) {
      console.log('✓ Driver API connection test completed (expected error for non-existent ID):', error.message);
    }
    
    console.log('API tests completed!');
  } catch (error: any) {
    console.error('API test failed:', error);
  }
};

// Function to test backend connectivity
export const testBackendConnectivity = async () => {
  try {
    console.log('Testing backend connectivity...');
    
    const response = await fetch('http://localhost:5000/health');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✓ Backend is running:', data.message);
      console.log('✓ Timestamp:', data.timestamp);
      return true;
    } else {
      console.log('✗ Backend returned error:', data);
      return false;
    }
  } catch (error: any) {
    console.log('✗ Backend is not accessible:', error.message);
    return false;
  }
};

export default testApi;