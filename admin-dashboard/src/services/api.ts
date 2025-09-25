// API service for the admin dashboard
const API_BASE_URL = 'http://localhost:5000/api';

// Generic API call function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${url}:`, error);
    throw error;
  }
};

// Admin API functions
export const adminApi = {
  // Get all fines with pagination and filters
  getAllFines: async (params?: {
    page?: number;
    limit?: number;
    officerId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiCall(`/admin/fines${queryString}`, { method: 'GET' });
  },
  
  // Get all payments with pagination and filters
  getAllPayments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiCall(`/admin/payments${queryString}`, { method: 'GET' });
  },
  
  // Get officer activities
  getOfficerActivities: async (params?: {
    page?: number;
    limit?: number;
    officerId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiCall(`/admin/activities${queryString}`, { method: 'GET' });
  },
  
  // Generate reports
  generateReport: async (params: {
    reportType: string;
    period?: string;
    startDate?: string;
    endDate?: string;
    format?: string;
  }) => {
    const queryString = `?${new URLSearchParams(params as any).toString()}`;
    return apiCall(`/admin/reports${queryString}`, { method: 'GET' });
  },
  
  // Get system statistics
  getSystemStats: async () => {
    return apiCall('/admin/stats', { method: 'GET' });
  },
  
  // User management
  getUserList: async () => {
    return apiCall('/admin/users', { method: 'GET' });
  },
  
  addUser: async (userData: any) => {
    return apiCall('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  removeUser: async (id: string) => {
    return apiCall(`/admin/users/${id}`, { method: 'DELETE' });
  },
  
  resetPassword: async (id: string) => {
    return apiCall(`/admin/users/${id}/reset-password`, { method: 'POST' });
  },
};

export default {
  adminApi,
};