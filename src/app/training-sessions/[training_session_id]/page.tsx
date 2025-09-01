'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { TrainingSession } from '@/types/clubs';
import { authenticatedClubGet, authenticatedClubPost } from '@/utils/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Pagination from '@/components/Pagination';
import { useWebSocket } from '@/contexts/WebSocketContext';
import AddPlayerToTrainingSession from '@/components/AddPlayerToTrainingSession';

interface TrainingSessionPlayer {
  player: {
    player_id: string;
    first_name: string;
    last_name: string;
    gender: 'M' | 'F';
    date_of_birth: string;
    license_number: string;
    license_type: string;
    collectives: any[];
  };
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

interface PaginatedTrainingSessionPlayersResponse {
  total_count: number;
  total_page: number;
  count: number;
  page: number;
  results: TrainingSessionPlayer[];
}

export default function TrainingSessionDetailPage() {
  return (
    <ProtectedRoute>
      <TrainingSessionDetailContent />
    </ProtectedRoute>
  );
}

function TrainingSessionDetailContent() {
  const params = useParams();
  const trainingSessionId = params.training_session_id as string;
  const { isClubSelected, isLoading: authLoading } = useAuth();
  
  const [trainingSession, setTrainingSession] = useState<TrainingSession | null>(null);
  const [players, setPlayers] = useState<TrainingSessionPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total_count: 0,
    total_page: 0,
    count: 0,
    page: 0
  });
  const [currentPage, setCurrentPage] = useState(0);
  const perPage = 10;
  
  // Status editing state
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<TrainingSessionPlayer | null>(null);
  const [newStatus, setNewStatus] = useState<'PRESENT' | 'ABSENT' | 'LATE'>('PRESENT');
  const [absentReason, setAbsentReason] = useState('');
  const [withReason, setWithReason] = useState(false);
  const [lateReason, setLateReason] = useState('');
  const [lateWithReason, setLateWithReason] = useState(false);
  const [arrivalTime, setArrivalTime] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // WebSocket hook for real-time updates
  const { isConnected, subscribe } = useWebSocket();

  // Function to fetch training session details
  const fetchTrainingSession = async () => {
    try {
      console.log('Fetching training session details for ID:', trainingSessionId);
      const data = await authenticatedClubGet<TrainingSession>(
        `/training-sessions/${trainingSessionId}`
      );
      console.log('Training session data received:', data);
      setTrainingSession(data);
    } catch (err) {
      console.error('Error fetching training session:', err);
      setError(err instanceof Error ? err.message : 'Échec de la récupération de la session d\'entraînement');
    }
  };

  // Function to fetch training session players
  const fetchTrainingSessionPlayers = async (page: number = 0) => {
    try {
      console.log('Fetching training session players for page:', page);
      const data = await authenticatedClubGet<PaginatedTrainingSessionPlayersResponse>(
        `/training-sessions/${trainingSessionId}/players?page=${page}&per_page=${perPage}`
      );
      console.log('Training session players data received:', data);
      setPlayers(data.results);
      setPagination({
        total_count: data.total_count,
        total_page: data.total_page,
        count: data.count,
        page: data.page
      });
    } catch (err) {
      console.error('Error fetching training session players:', err);
      setError(err instanceof Error ? err.message : 'Échec de la récupération des joueurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isClubSelected) {
      setError('Aucun club sélectionné. Veuillez sélectionner un club.');
      setLoading(false);
      return;
    }

    if (trainingSessionId) {
      fetchTrainingSession();
      fetchTrainingSessionPlayers();
    }
  }, [isClubSelected, trainingSessionId]);

  // Subscribe to WebSocket events for real-time updates
  useEffect(() => {
    const unsubscribeTrainingSession = subscribe('club_training_session_updated', (data) => {
      console.log('Training session update received, refreshing data...');
      fetchTrainingSession();
      fetchTrainingSessionPlayers(currentPage);
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeTrainingSession();
    };
  }, [subscribe, currentPage, trainingSessionId]);

  // Function to change page
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < pagination.total_page) {
      setCurrentPage(newPage);
      fetchTrainingSessionPlayers(newPage);
    }
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Function to format time
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to get status color and text
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return { color: 'bg-green-100 text-green-800', text: 'Présent' };
      case 'ABSENT':
        return { color: 'bg-red-100 text-red-800', text: 'Absent' };
      case 'LATE':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'En Retard' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: 'Inconnu' };
    }
  };

  // Function to format player name
  const formatPlayerName = (firstName: string, lastName: string) => {
    return `${firstName} ${lastName}`;
  };

  // Function to open status edit modal
  const openStatusModal = (player: TrainingSessionPlayer) => {
    setSelectedPlayer(player);
    setNewStatus(player.status);
    setAbsentReason('');
    setWithReason(false);
    setLateReason('');
    setLateWithReason(false);
    setArrivalTime('');
    setShowStatusModal(true);
  };

  // Function to close status modal
  const closeStatusModal = () => {
    setShowStatusModal(false);
    setSelectedPlayer(null);
    setNewStatus('PRESENT');
    setAbsentReason('');
    setWithReason(false);
    setLateReason('');
    setLateWithReason(false);
    setArrivalTime('');
  };

  // Function to validate arrival time for late status
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

  // Function to update player status
  const updatePlayerStatus = async () => {
    if (!selectedPlayer) return;

    setIsUpdatingStatus(true);
    try {
      let endpoint = '';
      let body: any = {};

      switch (newStatus) {
        case 'PRESENT':
          endpoint = `/training-sessions/${trainingSessionId}/change-player-status/${selectedPlayer.player.player_id}/present`;
          break;
        case 'ABSENT':
          endpoint = `/training-sessions/${trainingSessionId}/change-player-status/${selectedPlayer.player.player_id}/absent`;
          body = {
            reason: absentReason,
            with_reason: withReason
          };
          break;
        case 'LATE':
          if (!isArrivalTimeValid()) {
            alert('L\'heure d\'arrivée doit être comprise entre le début et la fin de la session d\'entraînement');
            return;
          }
          endpoint = `/training-sessions/${trainingSessionId}/change-player-status/${selectedPlayer.player.player_id}/late`;
          const today = new Date();
          const [hours, minutes] = arrivalTime.split(':');
          today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          const arrivalTimeISO = today.toISOString();
          body = {
            arrival_time: arrivalTimeISO,
            with_reason: lateWithReason,
            reason: lateReason
          };
          break;
      }

      await authenticatedClubPost(endpoint, body);
      
      // Refresh data
      fetchTrainingSession();
      fetchTrainingSessionPlayers(currentPage);
      
      // Close modal
      closeStatusModal();
    } catch (err) {
      console.error('Error updating player status:', err);
      alert(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Function to delete player from training session
  const deletePlayerFromSession = async (playerId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce joueur de la session ? Cette action est irréversible.')) {
      return;
    }

    try {
      await authenticatedClubPost(
        `/training-sessions/${trainingSessionId}/remove-player/${playerId}`
      );
      
      // Refresh data
      fetchTrainingSession();
      fetchTrainingSessionPlayers(currentPage);
      
      // Close modal
      closeStatusModal();
    } catch (err) {
      console.error('Error deleting player from session:', err);
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression du joueur');
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

  if (!isClubSelected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="text-gray-600 text-base sm:text-lg mb-4">Aucun club sélectionné</div>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">Veuillez sélectionner un club depuis le tableau de bord</p>
          <a 
            href="/" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Retour au Tableau de Bord
          </a>
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
          <a 
            href="/training-sessions" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Retour aux Sessions
          </a>
        </div>
      </div>
    );
  }

  if (!trainingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="text-gray-600 text-base sm:text-lg mb-4">Session non trouvée</div>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">La session d'entraînement demandée n'existe pas</p>
          <a 
            href="/training-sessions" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Retour aux Sessions
          </a>
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
                <a 
                  href="/" 
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Tableau de Bord
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                  </svg>
                  <a 
                    href="/training-sessions" 
                    className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                  >
                    Sessions d'Entraînement
                  </a>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Détails</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">
            Session d'Entraînement
          </h1>
          <p className="text-gray-600 text-center sm:text-left">
            Détails de la session du {formatDate(trainingSession.start_time)}
          </p>
        </div>

        {/* Training Session Details */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informations de la Session</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Date</div>
              <div className="text-lg font-semibold text-gray-900">{formatDate(trainingSession.start_time)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Heure</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatTime(trainingSession.start_time)} - {formatTime(trainingSession.end_time)}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Durée</div>
              <div className="text-lg font-semibold text-gray-900">
                {Math.round((new Date(trainingSession.end_time).getTime() - new Date(trainingSession.start_time).getTime()) / (1000 * 60))} min
              </div>
            </div>
                         <div className="bg-gray-50 p-4 rounded-lg">
               <div className="text-sm font-medium text-gray-500">Total Joueurs</div>
               <div className="text-lg font-semibold text-gray-900">
                 {trainingSession.number_of_players_present + 
                  trainingSession.number_of_players_absent + 
                  trainingSession.number_of_players_late}
               </div>
             </div>
          </div>

          {/* Attendance Summary */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Résumé de Présence</h3>
                         <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{trainingSession.number_of_players_present}</div>
                <div className="text-sm text-gray-500">Présents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{trainingSession.number_of_players_absent}</div>
                <div className="text-sm text-gray-500">Absents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{trainingSession.number_of_players_late}</div>
                <div className="text-sm text-gray-500">En Retard</div>
              </div>
              
            </div>
          </div>
        </div>

                 {/* Search Players Section */}
         <AddPlayerToTrainingSession 
           trainingSessionId={trainingSessionId} 
         />

         {/* Players List */}
         <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Liste des Joueurs
            </h2>
            <div className="text-sm text-gray-500">
              {pagination.total_count} joueur{pagination.total_count !== 1 ? 's' : ''} au total
            </div>
          </div>
          
          {players.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joueur
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Licence
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type de Licence
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {players.map((playerData) => {
                    const statusInfo = getStatusInfo(playerData.status);
                    return (
                      <tr key={playerData.player.player_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {playerData.player.first_name.charAt(0)}{playerData.player.last_name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {formatPlayerName(playerData.player.first_name, playerData.player.last_name)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {playerData.player.gender === 'M' ? 'Homme' : 'Femme'} • {formatDate(playerData.player.date_of_birth)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {playerData.player.license_number}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {playerData.player.license_type}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <button
                            onClick={() => openStatusModal(playerData)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Modifier
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">Aucun joueur</div>
              <p className="text-gray-300 text-sm">Les joueurs de cette session apparaîtront ici</p>
            </div>
          )}
        </div>

        {/* Status Edit Modal */}
        {showStatusModal && selectedPlayer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Modifier le statut de {formatPlayerName(selectedPlayer.player.first_name, selectedPlayer.player.last_name)}
              </h3>
              
              <div className="space-y-4">
                {/* Status Selection */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau statut
                  </label>
                                     <select
                     id="status"
                     value={newStatus}
                     onChange={(e) => setNewStatus(e.target.value as 'PRESENT' | 'ABSENT' | 'LATE')}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                   >
                    <option value="PRESENT">Présent</option>
                    <option value="ABSENT">Absent</option>
                    <option value="LATE">En retard</option>
                  </select>
                </div>

                {/* Absent Reason Fields */}
                {newStatus === 'ABSENT' && (
                  <>
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
                  </>
                )}

                {/* Late Reason Fields */}
                {newStatus === 'LATE' && (
                  <>
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
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={closeStatusModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={updatePlayerStatus}
                    disabled={isUpdatingStatus || 
                      (newStatus === 'ABSENT' && withReason && !absentReason.trim()) ||
                      (newStatus === 'LATE' && (!arrivalTime || (lateWithReason && !lateReason.trim()) || !isArrivalTimeValid()))}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    {isUpdatingStatus ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Mise à jour...
                      </div>
                    ) : (
                      'Mettre à jour'
                    )}
                  </button>
                </div>
                
                {/* Delete Player Section */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="text-center">
                    <button
                      onClick={() => deletePlayerFromSession(selectedPlayer.player.player_id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Supprimer le joueur de la session
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
