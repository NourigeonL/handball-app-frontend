'use client';

import { useAuth } from '@/contexts/AuthContext';
import UserProfile from '@/components/UserProfile';
import UserClub from '@/components/UserClub';
import ClubsList from '@/components/ClubsList';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl space-y-8">
        {isAuthenticated ? (
          <UserProfile />
        ) : (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome to Handball App
              </h1>
              <p className="text-xl text-gray-600">
                Connect with your handball community
              </p>
              <p className="text-lg text-blue-600">
                Please sign in using the button in the navigation bar above
              </p>
            </div>
            
            {/* Public Clubs List */}
            <div className="mt-12">
              <ClubsList />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
