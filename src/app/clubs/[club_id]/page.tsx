'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Club, ClubInfo, Collective } from '@/types/clubs';
import { authenticatedGet } from '@/utils/api';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';


export default function ClubMainPage() {
  return (
    <ProtectedRoute>
      <ClubContent />
    </ProtectedRoute>
  );
}

function ClubContent() {
  const params = useParams();
  const router = useRouter();
  const { isClubSelected, isLoading: authLoading } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
  const [collectives, setCollectives] = useState<Collective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
    console.log('ClubContent useEffect:', { 
      isClubSelected, 
      clubId: params.club_id,
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
        
        setClub(clubData);
        
        // Fetch detailed club information
        const fetchClubInfo = async () => {
          try {
            const data = await authenticatedGet(
              `${process.env.NEXT_PUBLIC_API_URL}/clubs/${clubId}/info`
            );
            setClubInfo(data);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Échec de la récupération des informations du club');
          } finally {
            setLoading(false);
          }
        };

        fetchClubInfo();
        
        // Fetch collectives
        const fetchCollectives = async () => {
          try {
            const data = await authenticatedGet(
              `${process.env.NEXT_PUBLIC_API_URL}/collectives`
            );
            setCollectives(data);
          } catch (err) {
            console.error('Error fetching collectives:', err);
            // Don't set error for collectives, just log it
          }
        };
        
        fetchCollectives();
      } catch (error) {
        console.error('Error parsing stored club data:', error);
        setError('Erreur lors de la récupération des données du club');
        setLoading(false);
      }
    } else {
      setError('Aucun club sélectionné');
      setLoading(false);
    }
  }, [params.club_id, isClubSelected]);

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

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="text-gray-600 text-base sm:text-lg mb-4">Club non trouvé</div>
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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">{club.name}</h1>
            <div className="text-center sm:text-left">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Membre
              </span>
            </div>
          </div>
        
        <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-3">
          {/* Club Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Aperçu du Club</h2>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                  <span className="text-gray-600 text-sm sm:text-base">Nom du Club :</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{club.name}</span>
                </div>
                
                {club.registration_number && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                    <span className="text-gray-600 text-sm sm:text-base">Numéro d'Inscription :</span>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">{club.registration_number}</span>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                  <span className="text-gray-600 text-sm sm:text-base">Total des Joueurs :</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{club.nb_players} joueur{club.nb_players !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Extended Club Information */}
              {clubInfo && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Informations Supplémentaires</h3>
                  
                  {clubInfo.description && (
                    <div className="mb-3 sm:mb-4">
                      <span className="text-gray-600 text-sm sm:text-base">Description :</span>
                      <p className="text-gray-900 mt-1 text-sm sm:text-base">{clubInfo.description}</p>
                    </div>
                  )}
                  
                  {clubInfo.address && (
                    <div className="mb-3 sm:mb-4">
                      <span className="text-gray-600 text-sm sm:text-base">Adresse :</span>
                      <p className="text-gray-900 mt-1 text-sm sm:text-base">{clubInfo.address}</p>
                    </div>
                  )}
                  
                  {clubInfo.phone && (
                    <div className="mb-3 sm:mb-4">
                      <span className="text-gray-600 text-sm sm:text-base">Téléphone :</span>
                      <p className="text-gray-900 mt-1 text-sm sm:text-base">{clubInfo.phone}</p>
                    </div>
                  )}
                  
                  {clubInfo.email && (
                    <div className="mb-3 sm:mb-4">
                      <span className="text-gray-600 text-sm sm:text-base">Email :</span>
                      <p className="text-gray-900 mt-1 text-sm sm:text-base">{clubInfo.email}</p>
                    </div>
                  )}
                  
                  {clubInfo.website && (
                    <div className="mb-3 sm:mb-4">
                      <span className="text-gray-600 text-sm sm:text-base">Site Web :</span>
                      <a 
                        href={clubInfo.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 mt-1 block text-sm sm:text-base break-all"
                      >
                        {clubInfo.website}
                      </a>
                    </div>
                  )}
                  
                  {clubInfo.founded_year && (
                    <div className="mb-3 sm:mb-4">
                      <span className="text-gray-600 text-sm sm:text-base">Fondé en :</span>
                      <span className="text-gray-900 mt-1 ml-0 sm:ml-2 text-sm sm:text-base">{clubInfo.founded_year}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Collectives Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Collectifs</h2>
              
              {collectives.length > 0 ? (
                <div className="space-y-3">
                  {collectives.map((collective) => (
                    <div key={collective.collective_id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{collective.name}</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {collective.nb_players} joueur{collective.nb_players !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {collective.description && (
                        <p className="text-gray-600 text-xs sm:text-sm">{collective.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-gray-400 text-sm sm:text-base">Aucune équipe trouvée</div>
                  <p className="text-gray-300 text-xs sm:text-sm mt-1">Les équipes apparaîtront ici</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
