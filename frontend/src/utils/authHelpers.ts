/**
 * Authentication helper functions for API calls
 */

import { useAuth } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';

// Global variable to store the token
let currentToken: string | null = null;

// Function to set the current token (to be called from a React component)
export const setAuthToken = (token: string | null) => {
  console.log('=== SET AUTH TOKEN ===');
  console.log('Setting auth token:', token ? 'Token available' : 'No token');
  if (token) {
    console.log('Token length:', token.length);
    console.log('Token preview (first 20 chars):', token.substring(0, 20) + '...');
  }
  currentToken = token;
  console.log('Token set in global variable:', currentToken ? 'Success' : 'Failed');
};

// Function to get the current user's token
export const useAuthToken = () => {
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        console.log('=== FETCH AUTH TOKEN ===');
        console.log('Fetching auth token from Clerk...');
        const userToken = await getToken();
        console.log('Fetched token from Clerk:', userToken ? 'Available' : 'Not available');
        if (userToken) {
          console.log('Fetched token length:', userToken.length);
        }
        setToken(userToken);
        setAuthToken(userToken); // Update the global token
        console.log('Token state updated in component');
      } catch (error) {
        console.error('Error fetching token:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();

    // Set up an interval to periodically update the token
    const interval = setInterval(fetchToken, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [getToken]);

  return { token, loading };
};

// Function to add authentication headers to API requests
export const addAuthHeaders = async (headers: HeadersInit = {}): Promise<HeadersInit> => {
  try {
    console.log('=== ADD AUTH HEADERS ===');
    console.log('Current token status in global variable:', currentToken ? 'Available' : 'Not available');
    // If we have a current token, add it to the headers
    if (currentToken) {
      const authHeader = `Bearer ${currentToken}`;
      console.log('Adding auth header (first 20 chars):', authHeader.substring(0, 20) + '...');
      return {
        ...headers,
        Authorization: authHeader
      };
    }
    // Return headers as-is if no token is available
    console.log('No auth token available, returning headers as-is');
    return headers;
  } catch (error) {
    console.error('Error adding auth headers:', error);
    return headers;
  }
};

export default {
  useAuthToken,
  addAuthHeaders,
  setAuthToken
};