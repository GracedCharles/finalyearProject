/**
 * Authentication helper functions for API calls in the admin dashboard
 */

import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

// Global variable to store the token
let currentToken: string | null = null;

// Function to set the current token (to be called from a React component)
export const setAuthToken = (token: string | null) => {
  console.log('=== ADMIN DASHBOARD SET AUTH TOKEN ===');
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
        console.log('=== ADMIN DASHBOARD FETCH AUTH TOKEN ===');
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
    console.log('=== ADMIN DASHBOARD ADD AUTH HEADERS ===');
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

// Function to check if user is admin by calling backend API
export const checkAdminRole = async (): Promise<{ isAdmin: boolean; user?: any }> => {
  try {
    console.log('=== CHECK ADMIN ROLE ===');
    
    // Add authentication headers
    const headersWithAuth = await addAuthHeaders({
      'Content-Type': 'application/json',
    });

    const response = await fetch('http://localhost:5000/api/users/me', {
      method: 'GET',
      headers: headersWithAuth,
    });

    console.log('Admin role check response status:', response.status);
    
    if (response.ok) {
      const userData = await response.json();
      console.log('User data:', userData);
      
      if (userData.role === 'admin') {
        console.log('User is admin');
        return { isAdmin: true, user: userData };
      } else {
        console.log('User is not admin, role:', userData.role);
        return { isAdmin: false, user: userData };
      }
    } else if (response.status === 403) {
      console.log('User is not admin (403 Forbidden)');
      return { isAdmin: false };
    } else if (response.status === 401) {
      console.log('User not authenticated (401 Unauthorized)');
      return { isAdmin: false };
    } else {
      console.log('Authentication failed or other error, status:', response.status);
      return { isAdmin: false };
    }
  } catch (error) {
    console.error('Error checking admin role:', error);
    return { isAdmin: false };
  }
};

export default {
  useAuthToken,
  addAuthHeaders,
  setAuthToken,
  checkAdminRole
};