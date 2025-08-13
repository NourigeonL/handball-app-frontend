'use client';

import { useAuth } from '@/contexts/AuthContext';
import ClubsList from '@/components/ClubsList';
import UserClub from '@/components/UserClub';
import Link from 'next/link';

export default function ClubsPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Home
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Clubs</h1>
            </div>
            
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/" 
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Profile
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User's Club Information (if authenticated) */}
        <div className="mb-8">
          <UserClub />
        </div>
        
        <ClubsList />
      </main>
    </div>
  );
}
