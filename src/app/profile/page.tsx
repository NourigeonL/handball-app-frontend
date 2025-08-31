'use client';

import { useAuth } from '@/contexts/AuthContext';
import UserProfile from '@/components/UserProfile';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { userClubs, isClubSelected, selectedClub } = useAuth();
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Votre Profil</h1>
          
          {/* Club Information */}
          {userClubs.length > 1 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Gestion des Clubs</h2>
              <p className="text-blue-800 mb-3">
                Vous êtes membre de {userClubs.length} clubs. Vous pouvez changer de club en actualisant la page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Changer de Club
              </button>
            </div>
          )}
          
          {/* Return to Club Button */}
          {isClubSelected && selectedClub && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h2 className="text-lg font-semibold text-green-900 mb-2">Retour au Club</h2>
              <p className="text-green-800 mb-3">
                Retournez à votre club sélectionné pour continuer à travailler.
              </p>
              <button
                onClick={() => router.push(`/clubs/${selectedClub.club_id}`)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Retour au Club
              </button>
            </div>
          )}
          
          <UserProfile />
        </div>
      </div>
    </ProtectedRoute>
  );
}
