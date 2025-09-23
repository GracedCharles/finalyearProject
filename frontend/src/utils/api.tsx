/**
 * API Service for connecting frontend with backend
 * This file contains all the API calls to the backend server
 */

import { Platform } from 'react-native';
import { addAuthHeaders } from './authHelpers';

// Base URL for the backend API
// Different URLs for different environments:
// - Android emulator: 10.0.2.2
// - iOS simulator: localhost
// - Physical devices: Computer's IP address (same Wi-Fi network)
const getApiBaseUrl = () => {
  // Your computer's IP address - update this to match your actual IP
  const COMPUTER_IP = '192.168.43.72'; // Updated with your actual IP address from ipconfig
  
  // For development, we'll use a more flexible approach
  // You can override this by setting an environment variable
  const backendIp = process.env.EXPO_PUBLIC_BACKEND_IP || COMPUTER_IP;
  
  if (Platform.OS === 'android') {
    // Check if we're likely running on an emulator
    // Emulators typically use 10.0.2.2 to access host localhost
    // Physical devices should use the computer's IP address
    return `http://${backendIp}:5000/api`;
  } else if (Platform.OS === 'ios') {
    return `http://${backendIp}:5000/api`;
  } else {
    // Web or other platforms
    return 'http://localhost:5000/api';
  }
};

const API_BASE_URL = getApiBaseUrl();

// Types for our API responses
export interface User {
  _id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  address?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OffenseType {
  _id: string;
  code: string;
  description: string;
  amount: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Fine {
  _id: string;
  fineId: string;
  driverLicenseNumber: string;
  driverName: string;
  vehicleRegistration: string;
  offenseTypeId: OffenseType;
  offenseDetails: string;
  fineAmount: number;
  officerId: User;
  issuedAt: string;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  paymentId?: string;
}

export interface Payment {
  _id: string;
  paymentId: string;
  fineId: Fine;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  payerId: string;
  status: string;
  paidAt: string;
}

export interface DashboardStats {
  finesToday: number;
  pendingFines: number;
  totalCollected: number;
}

export interface AnalyticsData {
  finesOverTime: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  totalFines: number;
  totalCollected: number;
  collectionRate: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
}

// Generic API call function
const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    // Add authentication headers
    const headersWithAuth = await addAuthHeaders({
      'Content-Type': 'application/json',
      ...options.headers,
    });

    const config: RequestInit = {
      headers: headersWithAuth,
      ...options,
    };

    console.log(`Making API call to: ${url}`);
    console.log('Request method:', options.method || 'GET');
    
    // Log if authorization header is present (without showing the actual token)
    if (config.headers && typeof config.headers === 'object' && 'Authorization' in config.headers) {
      console.log('Authorization header: Present (Bearer token)');
    } else {
      console.log('Authorization header: Not present');
    }
    
    const response = await fetch(url, config);
    
    console.log(`Response status: ${response.status}`);
    
    // Log response headers for debugging
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('Error response data:', errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error(`API call failed for ${url}:`, error);
    // Provide more detailed error information
    if (error.message.includes('fetch failed')) {
      throw new Error(`Network connection failed. Please check if the backend server is running on ${API_BASE_URL.replace('/api', '')} and that your device is on the same network. Your computer's IP is ${process.env.EXPO_PUBLIC_BACKEND_IP || '192.168.43.72'}.`);
    }
    throw error;
  }
};

// Wrapper function for authenticated API calls
const authenticatedApiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  return apiCall(endpoint, options);
};

// User API functions
export const userApi = {
  getCurrentUser: (): Promise<User> => 
    authenticatedApiCall('/users/me', { method: 'GET' }),
    
  createUser: (userData: Partial<User>): Promise<User> => 
    apiCall('/users', { 
      method: 'POST', 
      body: JSON.stringify(userData) 
    }),
    
  setupUserProfile: (profileData: {
    firstName: string;
    lastName: string;
    address?: string;
    phoneNumber?: string;
  }): Promise<User> => 
    authenticatedApiCall('/users/setup', {
      method: 'POST',
      body: JSON.stringify(profileData)
    })
};

// Offense API functions (public - no authentication required)
export const offenseApi = {
  getOffenseTypes: (): Promise<OffenseType[]> => 
    apiCall('/offenses', { method: 'GET' }),
    
  getOffenseTypeById: (id: string): Promise<OffenseType> => 
    apiCall(`/offenses/${id}`, { method: 'GET' }),
    
  createOffenseType: (offenseData: Omit<OffenseType, '_id' | 'createdAt' | 'updatedAt'>): Promise<OffenseType> => 
    authenticatedApiCall('/offenses', {
      method: 'POST',
      body: JSON.stringify(offenseData)
    }),
    
  updateOffenseType: (id: string, offenseData: Partial<OffenseType>): Promise<OffenseType> => 
    authenticatedApiCall(`/offenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(offenseData)
    }),
    
  deleteOffenseType: (id: string): Promise<{ message: string }> => 
    authenticatedApiCall(`/offenses/${id}`, { method: 'DELETE' })
};

// Fine API functions (require authentication)
export const fineApi = {
  issueFine: (fineData: {
    driverLicenseNumber: string;
    driverName: string;
    vehicleRegistration: string;
    offenseTypeId: string;
    dueDate: string;
  }): Promise<Fine> => 
    authenticatedApiCall('/fines', {
      method: 'POST',
      body: JSON.stringify(fineData)
    }),
    
  getDashboardStats: (): Promise<DashboardStats> => 
    authenticatedApiCall('/fines/dashboard', { method: 'GET' }),
    
  getAnalytics: (params?: { period?: string }): Promise<AnalyticsData> => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return authenticatedApiCall(`/fines/analytics${queryString}`, { method: 'GET' });
  },
    
  getOfficerFines: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<PaginatedResponse<Fine>> => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return authenticatedApiCall(`/fines/my-fines${queryString}`, { method: 'GET' });
  },
    
  getFineById: (id: string): Promise<Fine> => 
    authenticatedApiCall(`/fines/${id}`, { method: 'GET' }),
    
  processPayment: (paymentData: {
    fineId: string;
    paymentMethod: string;
    transactionId: string;
    payerId: string;
  }): Promise<{ message: string; payment: Payment; fine: Fine }> => 
    authenticatedApiCall('/fines/payment', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    })
};

// Driver API functions (public endpoints - no authentication required)
export const driverApi = {
  getFineByFineId: (fineId: string): Promise<Fine> => 
    apiCall(`/drivers/fines/${fineId}`, { method: 'GET' }),
    
  searchFines: (params: {
    driverLicenseNumber: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Fine>> => {
    const queryString = `?${new URLSearchParams(params as any).toString()}`;
    return apiCall(`/drivers/fines${queryString}`, { method: 'GET' });
  },
    
  getPaymentHistory: (driverLicenseNumber: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Payment>> => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiCall(`/drivers/payments/${driverLicenseNumber}${queryString}`, { method: 'GET' });
  },
    
  processPayment: (paymentData: {
    fineId: string;
    paymentMethod: string;
    transactionId: string;
    payerId: string;
  }): Promise<{ message: string; payment: Payment; fine: Fine }> => 
    apiCall('/drivers/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    })
};

// Admin API functions (require authentication)
export const adminApi = {
  getAllFines: (params?: {
    page?: number;
    limit?: number;
    officerId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<PaginatedResponse<Fine>> => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return authenticatedApiCall(`/admin/fines${queryString}`, { method: 'GET' });
  },
  
  getAllPayments: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<PaginatedResponse<Payment>> => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return authenticatedApiCall(`/admin/payments${queryString}`, { method: 'GET' });
  },
  
  getOfficerActivities: (params?: {
    page?: number;
    limit?: number;
    officerId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<any> => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return authenticatedApiCall(`/admin/activities${queryString}`, { method: 'GET' });
  },
  
  generateReport: (params: {
    reportType: string;
    period?: string;
    startDate?: string;
    endDate?: string;
    format?: string;
  }): Promise<any> => {
    const queryString = `?${new URLSearchParams(params as any).toString()}`;
    return authenticatedApiCall(`/admin/reports${queryString}`, { method: 'GET' });
  },
  
  getSystemStats: (): Promise<any> => 
    authenticatedApiCall('/admin/stats', { method: 'GET' }),
  
  getUserList: (): Promise<User[]> => 
    authenticatedApiCall('/admin/users', { method: 'GET' }),
  
  addUser: (userData: Partial<User>): Promise<User> => 
    authenticatedApiCall('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
  
  removeUser: (id: string): Promise<{ message: string }> => 
    authenticatedApiCall(`/admin/users/${id}`, { method: 'DELETE' }),
  
  resetPassword: (id: string): Promise<{ message: string }> => 
    authenticatedApiCall(`/admin/users/${id}/reset-password`, { method: 'POST' })
};

export default {
  userApi,
  offenseApi,
  fineApi,
  driverApi,
  adminApi
};