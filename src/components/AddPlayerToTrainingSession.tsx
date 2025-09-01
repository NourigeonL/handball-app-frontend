'use client';

import { useState, useEffect } from 'react';
import { authenticatedClubGet } from '@/utils/api';

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
                     className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
    </div>
  );
}
