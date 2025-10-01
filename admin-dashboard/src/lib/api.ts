import { addAuthHeaders } from './authHelpers';

const API_BASE_URL = 'https://traffic.galantagroup.com/api';

// Generic fetch function with error handling and auth headers
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Add authentication headers
    const headersWithAuth = await addAuthHeaders({
      'Content-Type': 'application/json',
      ...options.headers,
    });

    const response = await fetch(url, {
      ...options,
      headers: headersWithAuth,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Admin API functions
export const adminApi = {
  getSystemStats: () => apiFetch('/admin/stats'),
  getAllFines: (params?: Record<string, string>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch(`/admin/fines${queryString}`);
  },
  createFine: (fineData: any) => apiFetch('/admin/fines', {
    method: 'POST',
    body: JSON.stringify(fineData),
  }),
  updateFine: (id: string, fineData: any) => apiFetch(`/admin/fines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(fineData),
  }),
  deleteFine: (id: string) => apiFetch(`/admin/fines/${id}`, {
    method: 'DELETE',
  }),
  getAllUsers: () => apiFetch('/users'),
  createUser: (userData: any) => apiFetch('/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  updateUser: (id: string, userData: any) => apiFetch(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  deleteUser: (id: string) => apiFetch(`/admin/users/${id}`, {
    method: 'DELETE',
  }),
  updateUserDriverLicense: (userId: string, driverLicenseNumber: string) => apiFetch('/users/driver-license', {
    method: 'PUT',
    body: JSON.stringify({ userId, driverLicenseNumber }),
  }),
  getAllPayments: (params?: Record<string, string>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch(`/admin/payments${queryString}`);
  },
  getPayment: (id: string) => apiFetch(`/admin/payments/${id}`),
  processPayment: (paymentData: any) => apiFetch('/admin/payments', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  }),
  generateReport: (params?: Record<string, string>) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch(`/admin/reports${queryString}`);
  },
};

export default {
  adminApi,
};