// app/providers/AuthProvider.tsx (or wherever it lives)
'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthState } from '@/types/auth';
import { api } from '@/lib/api';
import { redirect, useRouter } from 'next/navigation';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    loading: false,
  });
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await api.getProfile();
        dispatch({ type: "SET_USER", payload: user });
        dispatch({ type: "SET_AUTHENTICATED", payload: true });
      } catch (err: any) {
        if (err.message === 'Session expired') {
          await logout(); 
        } else {
          dispatch({ type: 'SET_USER', payload: null });
          dispatch({ type: 'SET_AUTHENTICATED', payload: false });
        }}finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initAuth();
  }, []);
  

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await api.login({ email, password });
      const profile: User = await api.getProfile()
      dispatch({ type: 'SET_USER', payload: profile });
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      // redirect to home (frontend route)
      
    } catch (err) {
      // login failed; keep unauthenticated
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
 // ---------- Minimal logout ----------
  const logout = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      dispatch({ type: 'SET_LOADING', payload: false });
      router.push('/login');
    }
  };

 

 
  const value: AuthContextType = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
