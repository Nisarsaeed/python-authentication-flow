import { User } from "@/types/auth";

const API_BASE_URL = '/api';

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    config.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  } else {
    // For FormData, let browser set the Content-Type automatically
    config.headers = {
      ...options.headers,
    };
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(response.status, errorData.message || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(0, 'Network error');
  }
}

async function fetchWithRefresh<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    console.log("called");
    return await apiRequest<T>(endpoint, options);
  } catch (err: any) {
    
    if (err instanceof APIError && err.status === 401) {
      try {
        await apiRequest<{ msg: string }>("/auth/refresh-token", {
          method: 'POST',
          credentials: 'include',
        }); // refresh
        return await apiRequest<T>(endpoint, options); // retry
      } catch {
        throw new APIError(401, "Session expired");
      }
    }

    throw err;
  }
}

export const api = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest<{ msg: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData: FormData) =>
    apiRequest<{ message: string }>('/auth/register', {
      method: 'POST',
      body: userData,
      headers: {},
    }),

  verifyOTP: (data: { email: string; otp: string }) =>
    apiRequest<{ message: string }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiRequest<{ msg: string }>('/auth/logout', { method: 'POST' }),

  getProfile: () =>
    fetchWithRefresh<User>('/user/profile', { method: 'GET' }),

  getUsers: () =>
    fetchWithRefresh<User[]>('/admin/users', { method: 'GET' }),

  createUser: (userData: FormData) =>
    fetchWithRefresh<{ msg: string }>('/admin/users', {
      method: 'POST',
      body: userData,
    }),

  updateUser: (id: number, userData: any) =>
    fetchWithRefresh<{ msg: string }>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  deleteUser: (id: number) =>
    fetchWithRefresh<{ msg: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    }),
};
