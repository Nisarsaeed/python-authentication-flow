'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types/auth';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: any) => {
    try {
      await api.createUser(userData);
      await fetchUsers(); // Refresh list
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const updateUser = async (id: number, userData: any) => {
    try {
      await api.updateUser(id, userData);
      await fetchUsers(); // Refresh list
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await api.deleteUser(id);
      setUsers(users.filter(user => user.id !== id)); // Optimistic update
      return true;
    } catch (err: any) {
      setError(err.message);
      await fetchUsers(); // Revert on error
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}