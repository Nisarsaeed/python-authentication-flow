export interface User {
  id: number;
  email: string;
  role: 'admin' | 'user';
  first_name: string;
  last_name: string;
  mobile: string;
  profile_pic: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  mobile: string;
  profile_pic?: File;
}