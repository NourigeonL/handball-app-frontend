'use client';

import { useAuth } from '@/contexts/AuthContext';
import UserProfile from '@/components/UserProfile';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ProfilePage() {
  const { userClubs, isClubSelected } = useAuth();

  return (
    <ProtectedRoute>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Profile</h1>
          
          {/* Club Selection Status */}
          {userClubs.length > 1 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Club Management</h2>
              <p className="text-blue-800 mb-3">
                You're a member of {userClubs.length} clubs. You can switch between them by refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Switch Club
              </button>
            </div>
          )}
          
          <UserProfile />
        </div>
      </div>
    </ProtectedRoute>
  );
}
