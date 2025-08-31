'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { CollectivePlayer } from '@/types/clubs';
import { authenticatedGet, authenticatedPost } from '@/utils/api';
import SearchInput from './SearchInput';

interface AddPlayerToCollectiveProps {
  collectiveId: string;
  onPlayerAdded: () => void;
}

export default function AddPlayerToCollective({ collectiveId, onPlayerAdded }: AddPlayerToCollectiveProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CollectivePlayer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);



  const searchPlayers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const data = await authenticatedGet(
        `${process.env.NEXT_PUBLIC_API_URL}/collectives/${collectiveId}/unassigned-players/search?q=${encodeURIComponent(query)}`
      );
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche des joueurs');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [collectiveId]);

  const addPlayer = useCallback(async (playerId: string) => {
    setIsAdding(true);
    setError(null);
    setSuccess(null);

    try {
      await authenticatedPost(
        `${process.env.NEXT_PUBLIC_API_URL}/collectives/${collectiveId}/add-player`,
        { player_id: playerId }
      );
      
      setSuccess('Joueur ajouté avec succès au collectif');
      setSearchResults([]);
      setSearchQuery('');
      
      // Call the callback to refresh the collective data
      onPlayerAdded();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout du joueur');
    } finally {
      setIsAdding(false);
    }
  }, [collectiveId, onPlayerAdded]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear results if query is empty
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(() => {
      searchPlayers(value);
    }, 300);
  }, [searchPlayers]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Ajouter un Joueur</h2>
      
                     {/* Search Input */}
        <SearchInput
          ref={inputRef}
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Rechercher un joueur par nom..."
          isSearching={isSearching}
        />

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Joueurs trouvés ({searchResults.length})
          </h3>
          
          <div className="space-y-2">
            {searchResults.map((player) => (
              <div
                key={player.player_id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1 mb-2 sm:mb-0">
                  <div className="font-medium text-gray-900">
                    {player.first_name} {player.last_name}
                  </div>
                  <div className="text-sm text-gray-600 space-x-2">
                    <span>Licence: {player.license_number}</span>
                    <span>•</span>
                    <span>{player.gender === 'M' ? 'Homme' : 'Femme'}</span>
                    <span>•</span>
                    <span>{new Date(player.date_of_birth).toLocaleDateString('fr-FR')}</span>
                    <span>•</span>
                    <span>Type: {player.license_type}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => addPlayer(player.player_id)}
                  disabled={isAdding}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isAdding ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {searchQuery && searchResults.length === 0 && !isSearching && !error && (
        <div className="text-center py-6">
          <div className="text-gray-500 text-sm">Aucun joueur trouvé</div>
          <p className="text-gray-400 text-xs mt-1">Essayez avec un autre nom</p>
        </div>
      )}
    </div>
  );
}
