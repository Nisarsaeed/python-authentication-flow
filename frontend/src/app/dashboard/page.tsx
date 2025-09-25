'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUser';
import { Header } from '@/components/layout/Header';
import { UserTable } from '@/components/dashboard/UserTable';
import { CreateUserModal } from '@/components/dashboard/CreateUserModal';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export default function DashboardPage() {
  // const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { users, loading, error, createUser, updateUser, deleteUser } = useUsers();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();

  // useEffect(() => {
  //   if(!authLoading){
  //     if(!isAuthenticated) router.push('/login')
  //     else if(user?.role!=='admin') router.push('/')
  //   }

  // }, [user, authLoading]);

  // if (authLoading || !user) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  // if (user?.role !== 'admin') {
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <Button onClick={() => setShowCreateModal(true)}>
              Create User
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <UserTable
            users={users}
            loading={loading}
            onUpdate={updateUser}
            onDelete={deleteUser}
          />
        </div>
      </div>

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createUser}
        />
      )}
    </div>
  );
}