'use client';

import { useAuth } from '@/contexts/AuthContext';
import UserProfile from '@/components/UserProfile';
import UserClub from '@/components/UserClub';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function Home() {
  const { userClubs, isClubSelected, selectedClub } = useAuth();

  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold text-gray-900">
              Gestionnaire de Clubs de Handball
            </h1>
            <p className="text-xl text-gray-600">
              Gérez vos clubs de handball et vos adhésions
            </p>
            
            {/* Club Selection Status */}
            {isClubSelected && selectedClub && (
              <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 border border-green-200 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-700 font-medium">
                  Travaille avec : {selectedClub.name}
                </span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Profile Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre Profil</h2>
              <UserProfile />
            </div>
            
            {/* User Club Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre Club</h2>
              <UserClub />
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Actions Rapides</h2>
            <div className="flex flex-wrap gap-4">
              {userClubs.length > 1 && (
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  Changer de Club
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
