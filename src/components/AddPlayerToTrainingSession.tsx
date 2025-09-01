'use client';

import { useState, useEffect } from 'react';
import { authenticatedClubGet, authenticatedClubPost } from '@/utils/api';

interface Player {
  player_id: string;
  first_name: string;
  last_name: string;
  gender: 'M' | 'F';
  date_of_birth: string;
  license_number: string;
  license_type: string;
  collectives: any[];
}

interface Collective {
  collective_id: string;
  name: string;
  description: string;
  nb_players: number;
}

interface AddPlayerToTrainingSessionProps {
  trainingSessionId: string;
}

interface TrainingSession {
  training_session_id: string;
  start_time: string;
  end_time: string;
  number_of_players_present: number;
  number_of_players_absent: number;
  number_of_players_late: number;
}

export default function AddPlayerToTrainingSession({ 
  trainingSessionId 
}: AddPlayerToTrainingSessionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollectiveId, setSelectedCollectiveId] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [collectives, setCollectives] = useState<Collective[]>([]);
  const [isLoadingCollectives, setIsLoadingCollectives] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [markingPresent, setMarkingPresent] = useState<string | null>(null);
  const [markingAbsent, setMarkingAbsent] = useState<string | null>(null);
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [selectedPlayerForAbsent, setSelectedPlayerForAbsent] = useState<Player | null>(null);
  const [absentReason, setAbsentReason] = useState('');
  const [withReason, setWithReason] = useState(false);
  const [markingLate, setMarkingLate] = useState<string | null>(null);
  const [showLateModal, setShowLateModal] = useState(false);
  const [selectedPlayerForLate, setSelectedPlayerForLate] = useState<Player | null>(null);
  const [lateReason, setLateReason] = useState('');
  const [lateWithReason, setLateWithReason] = useState(false);
  const [arrivalTime, setArrivalTime] = useState('');
  const [trainingSession, setTrainingSession] = useState<TrainingSession | null>(null);
  const [isLoadingTrainingSession, setIsLoadingTrainingSession] = useState(true);

  // Fetch training session details
  useEffect(() => {
    const fetchTrainingSession = async () => {
      try {
        const data = await authenticatedClubGet<TrainingSession>(`/training-sessions/${trainingSessionId}`);
        setTrainingSession(data);
      } catch (err) {
        console.error('Error fetching training session:', err);
      } finally {
        setIsLoadingTrainingSession(false);
      }
    };

    fetchTrainingSession();
  }, [trainingSessionId]);

  // Fetch collectives for filtering
  useEffect(() => {
    const fetchCollectives = async () => {
      try {
        console.log('Fetching collectives...');
        const data = await authenticatedClubGet<any>('/collectives');
        console.log('Collectives data received:', data);
        console.log('Data type:', typeof data);
        console.log('Data keys:', Object.keys(data));
        
        // Handle different possible response structures
        let collectivesArray: Collective[] = [];
        if (data.collectives && Array.isArray(data.collectives)) {
          collectivesArray = data.collectives;
        } else if (Array.isArray(data)) {
          collectivesArray = data;
        } else if (data.results && Array.isArray(data.results)) {
          collectivesArray = data.results;
        }
        
        console.log('Processed collectives array:', collectivesArray);
        setCollectives(collectivesArray);
      } catch (err) {
        console.error('Error fetching collectives:', err);
      } finally {
        setIsLoadingCollectives(false);
      }
    };

    fetchCollectives();
  }, []);

  // Search players
  const searchPlayers = async (query: string, collectiveId: string) => {
    // Only search if there's a query OR a collective is selected
    if (!query.trim() && !collectiveId) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      let url = `/training-sessions/${trainingSessionId}/unassigned-players/search`;
      const params = new URLSearchParams();
      
      if (query.trim()) {
        params.append('q', query.trim());
      }
      
      if (collectiveId) {
        params.append('collective_id', collectiveId);
      }

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const data = await authenticatedClubGet<Player[]>(url);
      setSearchResults(data);
    } catch (err) {
      console.error('Error searching players:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche des joueurs');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };



  // Debounced search function
  const debouncedSearch = (query: string, collectiveId: string) => {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for search
    const timeout = setTimeout(() => {
      searchPlayers(query, collectiveId);
    }, 300); // 300ms delay

    setSearchTimeout(timeout);
  };

  // Handle search query change
  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    debouncedSearch(newQuery, selectedCollectiveId);
  };

  // Handle collective selection change
  const handleCollectiveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCollectiveId = e.target.value;
    setSelectedCollectiveId(newCollectiveId);
    debouncedSearch(searchQuery, newCollectiveId);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Format player name
  const formatPlayerName = (firstName: string, lastName: string) => {
    return `${firstName} ${lastName}`;
  };

  // Mark player as present
  const markPlayerAsPresent = async (playerId: string) => {
    setMarkingPresent(playerId);
    setError(null);

    try {
      await authenticatedClubPost(
        `/training-sessions/${trainingSessionId}/change-player-status/${playerId}/present`
      );
      
      // Remove the player from search results
      setSearchResults(prev => prev.filter(player => player.player_id !== playerId));
      
      // Clear search if no more results
      if (searchResults.length === 1) {
        setSearchQuery('');
      }
    } catch (err) {
      console.error('Error marking player as present:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du marquage du joueur comme présent');
    } finally {
      setMarkingPresent(null);
    }
  };

  // Open absent modal
  const openAbsentModal = (player: Player) => {
    setSelectedPlayerForAbsent(player);
    setAbsentReason('');
    setWithReason(false);
    setShowAbsentModal(true);
  };

  // Mark player as absent
  const markPlayerAsAbsent = async () => {
    if (!selectedPlayerForAbsent) return;

    setMarkingAbsent(selectedPlayerForAbsent.player_id);
    setError(null);

    try {
      await authenticatedClubPost(
        `/training-sessions/${trainingSessionId}/change-player-status/${selectedPlayerForAbsent.player_id}/absent`,
        {
          reason: absentReason,
          with_reason: withReason
        }
      );
      
      // Remove the player from search results
      setSearchResults(prev => prev.filter(player => player.player_id !== selectedPlayerForAbsent.player_id));
      
      // Clear search if no more results
      if (searchResults.length === 1) {
        setSearchQuery('');
      }

      // Close modal
      setShowAbsentModal(false);
      setSelectedPlayerForAbsent(null);
    } catch (err) {
      console.error('Error marking player as absent:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du marquage du joueur comme absent');
    } finally {
      setMarkingAbsent(null);
    }
  };

  // Close absent modal
  const closeAbsentModal = () => {
    setShowAbsentModal(false);
    setSelectedPlayerForAbsent(null);
    setAbsentReason('');
    setWithReason(false);
  };

  // Open late modal
  const openLateModal = (player: Player) => {
    setSelectedPlayerForLate(player);
    setLateReason('');
    setLateWithReason(false);
    // Set default arrival time to current time (time only)
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // Format: HH:MM
    setArrivalTime(currentTime);
    setShowLateModal(true);
  };

  // Validate arrival time is within training session period
  const isArrivalTimeValid = () => {
    if (!trainingSession || !arrivalTime) return false;
    
    const today = new Date();
    const [hours, minutes] = arrivalTime.split(':');
    today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const arrivalTimeISO = today.toISOString();
    
    const startTime = new Date(trainingSession.start_time);
    const endTime = new Date(trainingSession.end_time);
    const arrivalDateTime = new Date(arrivalTimeISO);
    
    return arrivalDateTime >= startTime && arrivalDateTime <= endTime;
  };

  // Mark player as late
  const markPlayerAsLate = async () => {
    if (!selectedPlayerForLate) return;

    // Validate arrival time
    if (!isArrivalTimeValid()) {
      setError('L\'heure d\'arrivée doit être comprise entre le début et la fin de la session d\'entraînement');
      return;
    }

    setMarkingLate(selectedPlayerForLate.player_id);
    setError(null);

    try {
      // Convert time-only input to full ISO string for today's date
      const today = new Date();
      const [hours, minutes] = arrivalTime.split(':');
      today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const arrivalTimeISO = today.toISOString();

      await authenticatedClubPost(
        `/training-sessions/${trainingSessionId}/change-player-status/${selectedPlayerForLate.player_id}/late`,
        {
          arrival_time: arrivalTimeISO,
          with_reason: lateWithReason,
          reason: lateReason
        }
      );
      
      // Remove the player from search results
      setSearchResults(prev => prev.filter(player => player.player_id !== selectedPlayerForLate.player_id));
      
      // Clear search if no more results
      if (searchResults.length === 1) {
        setSearchQuery('');
      }

      // Close modal
      setShowLateModal(false);
      setSelectedPlayerForLate(null);
    } catch (err) {
      console.error('Error marking player as late:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du marquage du joueur comme en retard');
    } finally {
      setMarkingLate(null);
    }
  };

  // Close late modal
  const closeLateModal = () => {
    setShowLateModal(false);
    setSelectedPlayerForLate(null);
    setLateReason('');
    setLateWithReason(false);
    setArrivalTime('');
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Debug log for collectives state
  console.log('Render - collectives state:', collectives);
  console.log('Render - isLoadingCollectives:', isLoadingCollectives);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
             <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
           Rechercher des Joueurs
         </h2>
         <button
           onClick={() => setIsFormOpen(!isFormOpen)}
           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
         >
           {isFormOpen ? 'Fermer' : 'Rechercher des Joueurs'}
         </button>
       </div>

      {isFormOpen && (
        <div className="space-y-4">
                     {/* Search Form */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                 Rechercher un joueur
               </label>
               <input
                 type="text"
                 id="search"
                 value={searchQuery}
                 onChange={handleSearchQueryChange}
                 placeholder="Nom ou prénom du joueur..."
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
               />
             </div>
             
             <div>
               <label htmlFor="collective" className="block text-sm font-medium text-gray-700 mb-1">
                 Filtrer par collectif
               </label>
               <select
                 id="collective"
                 value={selectedCollectiveId}
                 onChange={handleCollectiveChange}
                 disabled={isLoadingCollectives}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
               >
                 <option value="">
                   {isLoadingCollectives ? 'Chargement...' : 'Tous les collectifs'}
                 </option>
                 {collectives && collectives.length > 0 ? (
                   collectives.map((collective) => (
                     <option key={collective.collective_id} value={collective.collective_id}>
                       {collective.name}
                     </option>
                   ))
                 ) : (
                   <option value="" disabled>
                     {isLoadingCollectives ? 'Chargement...' : 'Aucun collectif disponible'}
                   </option>
                 )}
               </select>
             </div>
           </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-red-800 text-sm">{error}</div>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Joueurs trouvés ({searchResults.length})
              </h3>
              <div className="space-y-3">
                                 {searchResults.map((player) => (
                   <div
                     key={player.player_id}
                     className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                   >
                     <div className="flex items-center space-x-4">
                       <div className="flex-shrink-0 h-12 w-12">
                         <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                           <span className="text-sm font-medium text-gray-700">
                             {player.first_name.charAt(0)}{player.last_name.charAt(0)}
                           </span>
                         </div>
                       </div>
                       <div>
                         <div className="text-sm font-medium text-gray-900">
                           {formatPlayerName(player.first_name, player.last_name)}
                         </div>
                         <div className="text-sm text-gray-500">
                           {player.gender === 'M' ? 'Homme' : 'Femme'} • {formatDate(player.date_of_birth)} • Licence: {player.license_number}
                         </div>
                         <div className="text-xs text-gray-400">
                           Type: {player.license_type} • Collectifs: {player.collectives.length}
                         </div>
                       </div>
                     </div>
                                           <div className="flex space-x-2">
                        <button
                          onClick={() => markPlayerAsPresent(player.player_id)}
                          disabled={markingPresent === player.player_id || markingAbsent === player.player_id || markingLate === player.player_id}
                          className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          {markingPresent === player.player_id ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Marquage...
                            </div>
                          ) : (
                            'Présent'
                          )}
                        </button>
                        <button
                          onClick={() => openAbsentModal(player)}
                          disabled={markingPresent === player.player_id || markingAbsent === player.player_id || markingLate === player.player_id}
                          className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          {markingAbsent === player.player_id ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Marquage...
                            </div>
                          ) : (
                            'Absent'
                          )}
                        </button>
                        <button
                          onClick={() => openLateModal(player)}
                          disabled={markingPresent === player.player_id || markingAbsent === player.player_id || markingLate === player.player_id}
                          className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          {markingLate === player.player_id ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Marquage...
                            </div>
                          ) : (
                            'En retard'
                          )}
                        </button>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* No Results Message */}
          {searchQuery && !isSearching && searchResults.length === 0 && !error && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">Aucun joueur trouvé</div>
              <p className="text-gray-300 text-sm">
                Aucun joueur ne correspond à votre recherche ou tous les joueurs sont déjà assignés à cette session
              </p>
            </div>
          )}

                     {/* Search Instructions */}
           {!searchQuery && !selectedCollectiveId && !isSearching && searchResults.length === 0 && (
             <div className="text-center py-8">
               <div className="text-gray-400 text-lg mb-2">Rechercher des joueurs</div>
               <p className="text-gray-300 text-sm">
                 Commencez à taper le nom ou prénom d'un joueur, ou sélectionnez un collectif pour voir les résultats
               </p>
             </div>
                      )}
         </div>
       )}

       {/* Absent Modal */}
       {showAbsentModal && selectedPlayerForAbsent && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">
               Marquer {formatPlayerName(selectedPlayerForAbsent.first_name, selectedPlayerForAbsent.last_name)} comme absent
             </h3>
             
             <div className="space-y-4">
               <div>
                 <label className="flex items-center">
                   <input
                     type="checkbox"
                     checked={withReason}
                     onChange={(e) => setWithReason(e.target.checked)}
                     className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                   />
                   <span className="ml-2 text-sm text-gray-700">Avec raison</span>
                 </label>
               </div>

               {withReason && (
                 <div>
                   <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                     Raison de l'absence
                   </label>
                   <textarea
                     id="reason"
                     value={absentReason}
                     onChange={(e) => setAbsentReason(e.target.value)}
                     placeholder="Entrez la raison de l'absence..."
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                     rows={3}
                   />
                 </div>
               )}

               <div className="flex space-x-3 pt-4">
                 <button
                   onClick={closeAbsentModal}
                   className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                 >
                   Annuler
                 </button>
                 <button
                   onClick={markPlayerAsAbsent}
                   disabled={markingAbsent === selectedPlayerForAbsent.player_id || (withReason && !absentReason.trim())}
                   className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                 >
                   {markingAbsent === selectedPlayerForAbsent.player_id ? (
                     <div className="flex items-center justify-center">
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                       Marquage...
                     </div>
                   ) : (
                     'Marquer absent'
                   )}
                 </button>
               </div>
             </div>
           </div>
         </div>
               )}

        {/* Late Modal */}
        {showLateModal && selectedPlayerForLate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Marquer {formatPlayerName(selectedPlayerForLate.first_name, selectedPlayerForLate.last_name)} comme en retard
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="arrival-time" className="block text-sm font-medium text-gray-700 mb-1">
                    Heure d'arrivée
                  </label>
                                     <input
                     type="time"
                     id="arrival-time"
                     value={arrivalTime}
                     onChange={(e) => setArrivalTime(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                     step="300"
                   />
                   {trainingSession && (
                     <p className="text-xs text-gray-500 mt-1">
                       Heure valide entre {new Date(trainingSession.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} et {new Date(trainingSession.end_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                     </p>
                   )}
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={lateWithReason}
                      onChange={(e) => setLateWithReason(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Avec raison</span>
                  </label>
                </div>

                {lateWithReason && (
                  <div>
                    <label htmlFor="late-reason" className="block text-sm font-medium text-gray-700 mb-1">
                      Raison du retard
                    </label>
                    <textarea
                      id="late-reason"
                      value={lateReason}
                      onChange={(e) => setLateReason(e.target.value)}
                      placeholder="Entrez la raison du retard..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                      rows={3}
                    />
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={closeLateModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Annuler
                  </button>
                                     <button
                     onClick={markPlayerAsLate}
                     disabled={markingLate === selectedPlayerForLate.player_id || !arrivalTime || (lateWithReason && !lateReason.trim()) || !isArrivalTimeValid()}
                     className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                   >
                    {markingLate === selectedPlayerForLate.player_id ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Marquage...
                      </div>
                    ) : (
                      'Marquer en retard'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
