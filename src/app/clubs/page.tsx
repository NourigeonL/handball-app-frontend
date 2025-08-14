'use client';

import { useAuth } from '@/contexts/AuthContext';
import ClubsList from '@/components/ClubsList';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProtectedRoute from '@/components/ProtectedRoute';

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
    <ProtectedRoute>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Tous les Clubs</h1>
            <p className="text-gray-600">Parcourez et gérez les clubs de handball du système</p>
          </div>
          
          <ClubsList />
        </div>
      </div>
    </ProtectedRoute>
  );
}
