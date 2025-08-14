'use client';

import { useAuth } from '@/contexts/AuthContext';
import ClubsList from '@/components/ClubsList';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function ClubsPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Handball Clubs Directory</h1>
          <p className="text-gray-600">Discover and explore handball clubs in your area</p>
          
          {!isAuthenticated && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                <span className="font-medium">Want to join a club?</span> 
                {' '}Sign in to access additional features and manage your club memberships.
              </p>
            </div>
          )}
        </div>
        
        <ClubsList />
        
        {isAuthenticated && (
          <div className="mt-8 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
