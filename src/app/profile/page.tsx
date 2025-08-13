'use client';

import { useAuth } from '@/contexts/AuthContext';
import UserProfile from '@/components/UserProfile';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Profile</h1>
          <UserProfile />
        </div>
      </div>
    </ProtectedRoute>
  );
}
