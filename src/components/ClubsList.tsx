'use client';

import { useState, useEffect } from 'react';
import { Club } from '@/types/clubs';

export default function ClubsList() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/clubs`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setClubs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch clubs');
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg font-semibold mb-2">Error</div>
        <div className="text-gray-600">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (clubs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 text-lg">No clubs found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Handball Clubs</h2>
        <p className="text-gray-600">Discover all registered handball clubs</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clubs.map((club) => (
          <div 
            key={club.club_id}
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 truncate">
                  {club.name}
                </h3>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {club.nb_players} player{club.nb_players !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              {club.registration_number && (
                <div className="mb-4">
                  <span className="text-sm text-gray-500">Registration:</span>
                  <div className="text-sm font-medium text-gray-900">
                    {club.registration_number}
                  </div>
                </div>
              )}
              

            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center text-sm text-gray-500 mt-8">
        Total clubs: {clubs.length}
      </div>
    </div>
  );
}
