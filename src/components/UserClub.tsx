'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Club } from '@/types/clubs';
import { authenticatedGet } from '@/utils/api';

export default function UserClub() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleClubClick = (club: Club) => {
    // Store the selected club in localStorage for the club page
    localStorage.setItem('selectedClub', JSON.stringify(club));
    // Redirect to the club main page
    router.push(`/clubs/${club.club_id}`);
  };

  useEffect(() => {
    const fetchUserClub = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const data = await authenticatedGet('http://localhost:8000/clubs/my-clubs');
        
        // The endpoint returns an array of clubs the user has access to
        if (Array.isArray(data) && data.length > 0) {
          setClubs(data);
        } else {
          setError('Aucun club trouvé');
        }
      } catch (err) {
        // Handle 404 specifically for my-clubs endpoint
        if (err instanceof Error && err.message.includes('404')) {
          setError('Vous n\'êtes associé à aucun club');
        } else {
          throw err;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserClub();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Informations du Club</h3>
            <div className="mt-2 text-sm text-yellow-700">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (clubs.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-900">Vos Clubs</h3>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          {clubs.length} club{clubs.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clubs.map((club) => (
          <div 
            key={club.club_id}
            className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] border border-blue-100 min-w-[200px]"
            onClick={() => handleClubClick(club)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-blue-900 text-sm flex-1 mr-2">{club.name}</h4>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                Membre
              </span>
            </div>
            
            <div className="space-y-2 text-xs">
              {club.registration_number && (
                <div>
                  <span className="text-blue-600">Inscription :</span>
                  <div className="font-medium text-blue-900 truncate">{club.registration_number}</div>
                </div>
              )}
              
              <div>
                <span className="text-blue-700">Joueurs :</span>
                <div className="font-medium text-blue-900">{club.nb_players} joueur{club.nb_players !== 1 ? 's' : ''}</div>
              </div>
              

            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-blue-600">Cliquez sur un club pour voir les détails et gérer</p>
      </div>
    </div>
  );
}
