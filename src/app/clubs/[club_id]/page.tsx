'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Club, ClubInfo } from '@/types/clubs';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isClubSelected && !localStorage.getItem('selectedClub')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-lg mb-4">Aucun club sélectionné</div>
          <p className="text-gray-500 mb-6">Veuillez sélectionner un club depuis le tableau de bord</p>
          <Link 
            href="/" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour au Tableau de Bord
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Erreur</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <Link 
            href="/" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour au Tableau de Bord
          </Link>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-lg mb-4">Club non trouvé</div>
          <Link 
            href="/" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour au Tableau de Bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{club.name}</h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Membre
            </span>
          </div>
        
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Club Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Aperçu du Club</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Nom du Club :</span>
                  <span className="font-semibold text-gray-900">{club.name}</span>
                </div>
                
                {club.registration_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Numéro d'Inscription :</span>
                    <span className="font-semibold text-gray-900">{club.registration_number}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total des Joueurs :</span>
                  <span className="font-semibold text-gray-900">{club.nb_players} joueur{club.nb_players !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">ID du Club :</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {club.club_id}
                  </span>
                </div>
              </div>

              {/* Extended Club Information */}
              {clubInfo && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Supplémentaires</h3>
                  
                  {clubInfo.description && (
                    <div className="mb-4">
                      <span className="text-gray-600">Description :</span>
                      <p className="text-gray-900 mt-1">{clubInfo.description}</p>
                    </div>
                  )}
                  
                  {clubInfo.address && (
                    <div className="mb-4">
                      <span className="text-gray-600">Adresse :</span>
                      <p className="text-gray-900 mt-1">{clubInfo.address}</p>
                    </div>
                  )}
                  
                  {clubInfo.phone && (
                    <div className="mb-4">
                      <span className="text-gray-600">Téléphone :</span>
                      <p className="text-gray-900 mt-1">{clubInfo.phone}</p>
                    </div>
                  )}
                  
                  {clubInfo.email && (
                    <div className="mb-4">
                      <span className="text-gray-600">Email :</span>
                      <p className="text-gray-900 mt-1">{clubInfo.email}</p>
                    </div>
                  )}
                  
                  {clubInfo.website && (
                    <div className="mb-4">
                      <span className="text-gray-600">Site Web :</span>
                      <a 
                        href={clubInfo.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 mt-1 block"
                      >
                        {clubInfo.website}
                      </a>
                    </div>
                  )}
                  
                  {clubInfo.founded_year && (
                    <div className="mb-4">
                      <span className="text-gray-600">Fondé en :</span>
                      <span className="text-gray-900 mt-1 ml-2">{clubInfo.founded_year}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
              
                             <div className="space-y-3">
                   <div className="text-center p-4 bg-green-50 rounded-lg">
                     <p className="text-green-800 text-sm mb-2">Vous êtes membre de ce club</p>
                     <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                       Membre Actif
                     </span>
                   </div>
                 
                 <Link 
                   href="/" 
                   className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                 >
                   Accueil
                 </Link>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
