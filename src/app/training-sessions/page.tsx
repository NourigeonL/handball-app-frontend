'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TrainingSession, PaginatedTrainingSessionsResponse } from '@/types/clubs';
import { authenticatedClubGet } from '@/utils/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Pagination from '@/components/Pagination';
import TrainingSessionForm from '@/components/TrainingSessionForm';
import { useWebSocket } from '@/contexts/WebSocketContext';

export default function TrainingSessionsPage() {
  return (
    <ProtectedRoute>
      <TrainingSessionsContent />
    </ProtectedRoute>
  );
}

function TrainingSessionsContent() {
  const { isClubSelected, isLoading: authLoading } = useAuth();
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total_count: 0,
    total_page: 0,
    count: 0,
    page: 0
  });
  const [currentPage, setCurrentPage] = useState(0);
  const perPage = 10; // Default per page

  // WebSocket hook for real-time updates
  const { isConnected, subscribe } = useWebSocket();

  // Function to fetch training sessions
  const fetchTrainingSessions = async (page: number = 0) => {
    try {
      console.log('Fetching training sessions for page:', page);
      const data = await authenticatedClubGet<PaginatedTrainingSessionsResponse>(
        `/training-sessions?page=${page}&per_page=${perPage}`
      );
      console.log('Training sessions data received:', data);
      setTrainingSessions(data.results);
      setPagination({
        total_count: data.total_count,
        total_page: data.total_page,
        count: data.count,
        page: data.page
      });
    } catch (err) {
      console.error('Error fetching training sessions:', err);
      setError(err instanceof Error ? err.message : 'Échec de la récupération des sessions d\'entraînement');
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

    fetchTrainingSessions();
  }, [isClubSelected]);

  // Subscribe to WebSocket events for real-time updates
  useEffect(() => {
    const unsubscribeTrainingSessions = subscribe('club_training_session_list_updated', (data) => {
      console.log('Training sessions list update received, refreshing data...');
      fetchTrainingSessions(currentPage);
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeTrainingSessions();
    };
  }, [subscribe, currentPage]);

  // Function to change page
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < pagination.total_page) {
      setCurrentPage(newPage);
      fetchTrainingSessions(newPage);
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

  // Function to get attendance status color
  const getAttendanceColor = (present: number, absent: number, late: number, absentWithoutReason: number) => {
    const total = present + absent + late + absentWithoutReason;
    if (total === 0) return 'text-gray-700';
    
    const attendanceRate = present / total;
    if (attendanceRate >= 0.8) return 'text-green-700';
    if (attendanceRate >= 0.6) return 'text-yellow-700';
    return 'text-red-700';
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
            href="/" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Retour au Tableau de Bord
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
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Sessions d'Entraînement</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">
            Sessions d'Entraînement
          </h1>
          <p className="text-gray-600 text-center sm:text-left">
            Gérez et consultez les sessions d'entraînement de votre club
          </p>
        </div>

        {/* Training Session Form */}
        <TrainingSessionForm onSessionCreated={fetchTrainingSessions} />

        {/* Training Sessions List */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Liste des Sessions
            </h2>
            <div className="text-sm text-gray-500">
              {pagination.total_count} session{pagination.total_count !== 1 ? 's' : ''} au total
            </div>
          </div>
          
          {trainingSessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Heure
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Présents
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Absents
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      En Retard
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Absents sans Raison
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taux de Présence
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trainingSessions.map((session) => {
                    const total = session.number_of_players_present + 
                                 session.number_of_players_absent + 
                                 session.number_of_players_late + 
                                 session.number_of_players_absent_without_reason;
                    const attendanceRate = total > 0 ? (session.number_of_players_present / total) * 100 : 0;
                    
                                         return (
                       <tr 
                         key={session.training_session_id} 
                         className="hover:bg-gray-50 transition-colors cursor-pointer"
                         onClick={() => window.location.href = `/training-sessions/${session.training_session_id}`}
                       >
                         <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                           {formatDate(session.start_time)}
                         </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{formatTime(session.start_time)}</span>
                            <span className="text-xs text-gray-600">à {formatTime(session.end_time)}</span>
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {session.number_of_players_present}
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {session.number_of_players_absent}
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {session.number_of_players_late}
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {session.number_of_players_absent_without_reason}
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getAttendanceColor(
                            session.number_of_players_present,
                            session.number_of_players_absent,
                            session.number_of_players_late,
                            session.number_of_players_absent_without_reason
                          )}`}>
                            {attendanceRate.toFixed(1)}%
                          </span>
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
              <div className="text-gray-400 text-lg mb-2">Aucune session d'entraînement</div>
              <p className="text-gray-300 text-sm">Les sessions d'entraînement apparaîtront ici</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
