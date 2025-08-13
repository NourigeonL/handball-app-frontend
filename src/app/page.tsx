'use client';

import { useAuth } from '@/contexts/AuthContext';
import GoogleLogin from '@/components/GoogleLogin';
import UserProfile from '@/components/UserProfile';
import UserClub from '@/components/UserClub';
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {isAuthenticated ? (
          <UserProfile />
        ) : (
          <>
            <GoogleLogin />
            
            {/* Show clubs info even for non-authenticated users */}
            <div className="mt-6">
              <UserClub />
            </div>
          </>
        )}
        
        {/* Navigation Links */}
        <div className="text-center space-y-3">
          <div className="border-t border-gray-200 pt-4">
            <Link 
              href="/clubs" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Handball Clubs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
