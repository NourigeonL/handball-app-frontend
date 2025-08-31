'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Collective, CollectivePlayer } from '@/types/clubs';
import { authenticatedGet } from '@/utils/api';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CollectivePage() {
  return (
    <ProtectedRoute>
      <CollectiveContent />
    </ProtectedRoute>
  );
}

function CollectiveContent() {
  const params = useParams();
  const router = useRouter();
  const { isClubSelected, isLoading: authLoading } = useAuth();
  const [collective, setCollective] = useState<Collective | null>(null);
  const [players, setPlayers] = useState<CollectivePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('CollectiveContent useEffect:', { 
      isClubSelected, 
      clubId: params.club_id,
      collectiveId: params.collective_id,
      authLoading 
    });
    
    // Check if we have a stored club in localStorage (for auto-selection cases)
    const hasStoredClub = !!localStorage.getItem('selectedClub');
    
    // Only proceed if a club is selected OR if we have a stored club
    if (!isClubSelected && !hasStoredClub) {
      console.log('No club selected and no stored club, setting loading to false');
      setLoading(false);
      return;
    }

    const clubId = params.club_id as string;
    const collectiveId = params.collective_id as string;
    
    // Get the club from localStorage (stored when clicking the card)
    const storedClub = localStorage.getItem('selectedClub');
    console.log('Stored club from localStorage:', storedClub);
    
    if (storedClub) {
      try {
        const clubData = JSON.parse(storedClub);
        
        // Check if the selected club matches the URL parameter
        if (clubData.club_id !== clubId) {
          setError('Le club sélectionné ne correspond pas à l\'URL demandée');
          setLoading(false);
          return;
        }
        
        // Fetch collective information
        const fetchCollective = async () => {
          try {
            const data = await authenticatedGet(
              `${process.env.NEXT_PUBLIC_API_URL}/collectives/${collectiveId}`
            );
            setCollective(data);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Échec de la récupération des informations du collectif');
          } finally {
            setLoading(false);
          }
        };

        // Fetch collective players
        const fetchCollectivePlayers = async () => {
          try {
            const data = await authenticatedGet(
              `${process.env.NEXT_PUBLIC_API_URL}/collectives/${collectiveId}/players`
            );
            setPlayers(data);
          } catch (err) {
            console.error('Error fetching collective players:', err);
            // Don't set error for players, just log it
          }
        };

        fetchCollective();
        fetchCollectivePlayers();
      } catch (error) {
        console.error('Error parsing stored club data:', error);
        setError('Erreur lors de la récupération des données du club');
        setLoading(false);
      }
    } else {
      setError('Aucun club sélectionné');
      setLoading(false);
    }
  }, [params.club_id, params.collective_id, isClubSelected]);

  // Wait for auth context to finish loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isClubSelected && !localStorage.getItem('selectedClub')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="text-gray-600 text-base sm:text-lg mb-4">Aucun club sélectionné</div>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">Veuillez sélectionner un club depuis le tableau de bord</p>
          <Link 
            href="/" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Retour au Tableau de Bord
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="text-red-600 text-base sm:text-lg font-semibold mb-2">Erreur</div>
          <div className="text-gray-600 mb-4 text-sm sm:text-base">{error}</div>
          <Link 
            href="/" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Retour au Tableau de Bord
          </Link>
        </div>
      </div>
    );
  }

  if (!collective) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="text-gray-600 text-base sm:text-lg mb-4">Collectif non trouvé</div>
          <Link 
            href={`/clubs/${params.club_id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Retour au Club
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link 
                  href="/" 
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Tableau de Bord
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                  </svg>
                  <Link 
                    href={`/clubs/${params.club_id}`}
                    className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                  >
                    Club
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">{collective.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Collective Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">Collectif : {collective.name}</h1>
          {collective.description && (
            <div className="text-center sm:text-left">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {collective.description}
              </span>
            </div>
          )}
        </div>
        
        <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-3">
          {/* Collective Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Aperçu du Collectif</h2>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                  <span className="text-gray-600 text-sm sm:text-base">Nom :</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{collective.name}</span>
                </div>
                
                {collective.description && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                    <span className="text-gray-600 text-sm sm:text-base">Description :</span>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">{collective.description}</span>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                  <span className="text-gray-600 text-sm sm:text-base">Nombre de Joueurs :</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{collective.nb_players} joueur{collective.nb_players !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Players Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Joueurs du Collectif</h2>
              
              {players.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nom
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Genre
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date de naissance
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Licence
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {players.map((player) => (
                        <tr key={player.player_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {player.first_name} {player.last_name}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              player.gender === 'M' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-pink-100 text-pink-800'
                            }`}>
                              {player.gender === 'M' ? 'Homme' : 'Femme'}
                            </span>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(player.date_of_birth).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            {player.license_number}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            {player.license_type}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-gray-400 text-sm sm:text-base">Aucun joueur dans ce collectif</div>
                  <p className="text-gray-300 text-xs sm:text-sm mt-1">Les joueurs apparaîtront ici</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
