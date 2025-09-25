'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function UserHomePage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

  // useEffect(() => {
  //     if (!isAuthenticated) {
  //       router.push('/login');
  //     } 
  // }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to your Dashboard!
              </h1>
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Successfully logged in as: {user.email}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Account Information
                  </h2>
                  <div className="text-left space-y-2">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">{user.role}</span></p>
                    <p><strong>User ID:</strong> {user.id}</p>
                    {user.first_name && <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>}
                    {user.mobile && <p><strong>Mobile:</strong> {user.mobile}</p>}
                  </div>
                  {
                    user?.role ==='admin' && (
                      <Link href={'/dashboard'}>Go To Dashboard</Link>
                    )
                  }
                </div>
                
                <div className="pt-4">
                  <Button onClick={handleLogout} variant="secondary">
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}