'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Club, ClubInfo, Collective, Player, PaginatedPlayersResponse } from '@/types/clubs';
import { authenticatedGet } from '@/utils/api';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Pagination from '@/components/Pagination';
import PlayerRegistrationForm from '@/components/PlayerRegistrationForm';
import CollectiveCreationForm from '@/components/CollectiveCreationForm';


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
  const [players, setPlayers] = useState<Player[]>([]);
  const [pagination, setPagination] = useState({
    total_count: 0,
    total_page: 0,
    count: 0,
    page: 0
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showCollectiveForm, setShowCollectiveForm] = useState(false);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

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
        
        // Fetch players
        const fetchPlayers = async () => {
          try {
            const data = await authenticatedGet(
              `${process.env.NEXT_PUBLIC_API_URL}/players?page=0&per_page=${perPage}`
            ) as PaginatedPlayersResponse;
            setPlayers(data.results);
            setPagination({
              total_count: data.total_count,
              total_page: data.total_page,
              count: data.count,
              page: data.page
            });
          } catch (err) {
            console.error('Error fetching players:', err);
            // Don't set error for players, just log it
          }
        };
        
        fetchPlayers();
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

  // WebSocket connection effect
  useEffect(() => {
    if (!params.club_id) return;

    // Check if WebSocket is supported
    if (typeof WebSocket === 'undefined') {
      console.log('WebSocket not supported in this environment');
      return;
    }

    // Function to establish WebSocket connection with session ID
    const connectWebSocket = async () => {
      try {
        // Get session ID if not already available
        let currentSessionId = sessionId;
        if (!currentSessionId) {
          currentSessionId = await getSessionId();
        }

        if (!currentSessionId) {
          console.error('Failed to get session ID, cannot connect to WebSocket');
          return;
        }

        const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/ws?session_id=${currentSessionId}`;
        console.log('Attempting to connect to WebSocket:', wsUrl);
        
        let ws: WebSocket;
        let connectionTimeout: NodeJS.Timeout | null = null;

        try {
          ws = new WebSocket(wsUrl);
      
          // Set connection timeout
          connectionTimeout = setTimeout(() => {
            if (ws.readyState === WebSocket.CONNECTING) {
              console.error('WebSocket connection timeout');
              ws.close();
            }
          }, 5000); // 5 second timeout

          ws.onopen = () => {
            console.log('WebSocket connected successfully to:', wsUrl);
            if (connectionTimeout) clearTimeout(connectionTimeout);
            setWsConnection(ws);
          };

                    ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              console.log('WebSocket message received:', data);

              if (data.type === 'club_player_list_updated') {
                console.log('Player list update received, refreshing data...');
                // Refresh players list, club info, and collectives
                fetchPlayers(currentPage);
                if (params.club_id) {
                  const fetchClubInfo = async () => {
                    try {
                      const clubData = await authenticatedGet(
                        `${process.env.NEXT_PUBLIC_API_URL}/clubs/${params.club_id}/info`
                      );
                      setClubInfo(clubData);
                    } catch (err) {
                      console.error('Error refreshing club info:', err);
                    }
                  };
                  fetchClubInfo();
                }
                const fetchCollectives = async () => {
                  try {
                    const collectivesData = await authenticatedGet(
                      `${process.env.NEXT_PUBLIC_API_URL}/collectives`
                    );
                    setCollectives(collectivesData);
                  } catch (err) {
                    console.error('Error refreshing collectives:', err);
                  }
                };
                fetchCollectives();
              } else if (data.type === 'club_collective_list_updated') {
                console.log('Collective list update received, refreshing data...');
                // Refresh collectives list and club info
                const fetchCollectives = async () => {
                  try {
                    const collectivesData = await authenticatedGet(
                      `${process.env.NEXT_PUBLIC_API_URL}/collectives`
                    );
                    setCollectives(collectivesData);
                  } catch (err) {
                    console.error('Error refreshing collectives:', err);
                  }
                };
                fetchCollectives();
                
                // Refresh club info to show updated collective count
                if (params.club_id) {
                  const fetchClubInfo = async () => {
                    try {
                      const clubData = await authenticatedGet(
                        `${process.env.NEXT_PUBLIC_API_URL}/clubs/${params.club_id}/info`
                      );
                      setClubInfo(clubData);
                    } catch (err) {
                      console.error('Error refreshing club info:', err);
                    }
                  };
                  fetchClubInfo();
                }
              }
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
            }
          };

          ws.onerror = (event) => {
            console.error('WebSocket connection error. URL:', wsUrl);
            console.error('WebSocket readyState:', ws.readyState);
            console.error('Error event:', event);
            
            // Try to get more specific error information
            if (ws.readyState === WebSocket.CONNECTING) {
              console.error('Failed to establish WebSocket connection');
            }
          };

          ws.onclose = (event) => {
            console.log('WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
            if (connectionTimeout) clearTimeout(connectionTimeout);
            setWsConnection(null);
          };

        } catch (error) {
          console.error('Error creating WebSocket:', error);
          if (connectionTimeout) clearTimeout(connectionTimeout);
          return;
        }
      } catch (error) {
        console.error('Error in connectWebSocket:', error);
      }
    };

    // Call the connection function
    connectWebSocket();
  }, [params.club_id, currentPage, sessionId]);

  // Cleanup WebSocket connection on unmount
  useEffect(() => {
    return () => {
      if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
        wsConnection.close();
      }
    };
  }, [wsConnection]);

  // Function to get session ID from backend
  const getSessionId = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/session`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.session_id) {
          setSessionId(data.session_id);
          return data.session_id;
        }
      }
    } catch (error) {
      console.error('Error fetching session ID:', error);
    }
    return null;
  };

  // Function to fetch players
  const fetchPlayers = async (page: number = 0) => {
    try {
      const data = await authenticatedGet(
        `${process.env.NEXT_PUBLIC_API_URL}/players?page=${page}&per_page=${perPage}`
      ) as PaginatedPlayersResponse;
      setPlayers(data.results);
      setPagination({
        total_count: data.total_count,
        total_page: data.total_page,
        count: data.count,
        page: data.page
      });
    } catch (err) {
      console.error('Error fetching players:', err);
      // Don't set error for players, just log it
    }
  };

  // Function to change page
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < pagination.total_page) {
      setCurrentPage(newPage);
      fetchPlayers(newPage);
    }
  };

  // Function to handle successful player registration
  const handlePlayerRegistrationSuccess = () => {
    setShowRegistrationForm(false);
    // Refresh the players list and club info
    fetchPlayers(currentPage);
    // Refresh club info to update player count
    if (params.club_id) {
      const fetchClubInfo = async () => {
        try {
          const data = await authenticatedGet(
            `${process.env.NEXT_PUBLIC_API_URL}/clubs/${params.club_id}/info`
          );
          setClubInfo(data);
        } catch (err) {
          console.error('Error refreshing club info:', err);
        }
      };
      fetchClubInfo();
    }
    // Refresh collectives to show updated player counts
    const fetchCollectives = async () => {
      try {
        const data = await authenticatedGet(
          `${process.env.NEXT_PUBLIC_API_URL}/collectives`
        );
        setCollectives(data);
      } catch (err) {
        console.error('Error refreshing collectives:', err);
      }
    };
    fetchCollectives();
  };

  // Function to handle successful collective creation
  const handleCollectiveCreationSuccess = () => {
    setShowCollectiveForm(false);
    // Refresh the collectives list
    const fetchCollectives = async () => {
      try {
        const data = await authenticatedGet(
          `${process.env.NEXT_PUBLIC_API_URL}/collectives`
        );
        setCollectives(data);
      } catch (err) {
        console.error('Error refreshing collectives:', err);
      }
    };
    fetchCollectives();
    // Refresh club info to show updated collective count
    if (params.club_id) {
      const fetchClubInfo = async () => {
        try {
          const data = await authenticatedGet(
            `${process.env.NEXT_PUBLIC_API_URL}/clubs/${params.club_id}/info`
          );
          setClubInfo(data);
        } catch (err) {
          console.error('Error refreshing club info:', err);
        }
      };
      fetchClubInfo();
    }
  };

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
            <div className="flex items-center justify-center sm:justify-start space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Membre
              </span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${wsConnection ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-500">
                  {wsConnection ? 'Connecté' : 'Déconnecté'}
                </span>
              </div>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Collectifs</h2>
                <button
                  onClick={() => setShowCollectiveForm(true)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Ajouter</span>
                </button>
              </div>
              
              {collectives.length > 0 ? (
                <div className="space-y-3">
                  {collectives.map((collective) => (
                    <Link 
                      key={collective.collective_id} 
                      href={`/clubs/${params.club_id}/collectives/${collective.collective_id}`}
                      className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer block"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{collective.name}</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {collective.nb_players} joueur{collective.nb_players !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {collective.description && (
                        <p className="text-gray-600 text-xs sm:text-sm">{collective.description}</p>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-gray-400 text-sm sm:text-base">Aucun collectif trouvée</div>
                  <p className="text-gray-300 text-xs sm:text-sm mt-1">Les collectifs apparaîtront ici</p>
                </div>
              )}
            </div>
          </div>

          {/* Players Section */}
          <div className="lg:col-span-3 mt-6">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Joueurs</h2>
                <button
                  onClick={() => setShowRegistrationForm(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Ajouter un joueur</span>
                </button>
              </div>
              
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
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Collectifs
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
                          <td className="px-3 py-4 text-sm text-gray-900">
                            {player.collectives.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {player.collectives.map((collective) => (
                                  <Link
                                    key={collective.collective_id}
                                    href={`/clubs/${params.club_id}/collectives/${collective.collective_id}`}
                                    className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                                  >
                                    {collective.name}
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">Aucun</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Pagination Controls */}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.total_page}
                    totalCount={pagination.total_count}
                    currentCount={pagination.count}
                    onPageChange={handlePageChange}
                  />
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-gray-400 text-sm sm:text-base">Aucun joueur trouvé</div>
                  <p className="text-gray-300 text-xs sm:text-sm mt-1">Les joueurs apparaîtront ici</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Player Registration Form Modal */}
      {showRegistrationForm && (
        <PlayerRegistrationForm
          onSuccess={handlePlayerRegistrationSuccess}
          onCancel={() => setShowRegistrationForm(false)}
        />
      )}
      
      {/* Collective Creation Form Modal */}
      {showCollectiveForm && (
        <CollectiveCreationForm
          onSuccess={handleCollectiveCreationSuccess}
          onCancel={() => setShowCollectiveForm(false)}
        />
      )}
    </div>
  );
}
