'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Club, ClubInfo } from '@/types/clubs';
import { authenticatedGet } from '@/utils/api';
import Link from 'next/link';


export default function ClubMainPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, getAuthToken } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const clubId = params.club_id as string;
    
    // Get the club from localStorage (stored when clicking the card)
    const storedClub = localStorage.getItem('selectedClub');
    if (storedClub) {
      try {
        const clubData = JSON.parse(storedClub);
        setClub(clubData);
      } catch (error) {
        console.error('Error parsing stored club data:', error);
      }
    }

    // Fetch detailed club information
    const fetchClubInfo = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const data = await authenticatedGet(
          `${process.env.NEXT_PUBLIC_API_URL}/clubs/${clubId}/info`,
          token
        );
        setClubInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch club information');
      } finally {
        setLoading(false);
      }
    };

    fetchClubInfo();
  }, [params.club_id]);



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Error</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <Link 
            href="/clubs" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Clubs
          </Link>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-lg mb-4">Club not found</div>
          <Link 
            href="/clubs" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Clubs
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
          {isAuthenticated && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Member
            </span>
          )}
        </div>
        
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Club Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Club Overview</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Club Name:</span>
                  <span className="font-semibold text-gray-900">{club.name}</span>
                </div>
                
                {club.registration_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Registration Number:</span>
                    <span className="font-semibold text-gray-900">{club.registration_number}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Players:</span>
                  <span className="font-semibold text-gray-900">{club.nb_players} player{club.nb_players !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Club ID:</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {club.club_id}
                  </span>
                </div>
              </div>

              {/* Extended Club Information */}
              {clubInfo && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                  
                  {clubInfo.description && (
                    <div className="mb-4">
                      <span className="text-gray-600">Description:</span>
                      <p className="text-gray-900 mt-1">{clubInfo.description}</p>
                    </div>
                  )}
                  
                  {clubInfo.address && (
                    <div className="mb-4">
                      <span className="text-gray-600">Address:</span>
                      <p className="text-gray-900 mt-1">{clubInfo.address}</p>
                    </div>
                  )}
                  
                  {clubInfo.phone && (
                    <div className="mb-4">
                      <span className="text-gray-600">Phone:</span>
                      <p className="text-gray-900 mt-1">{clubInfo.phone}</p>
                    </div>
                  )}
                  
                  {clubInfo.email && (
                    <div className="mb-4">
                      <span className="text-gray-600">Email:</span>
                      <p className="text-gray-900 mt-1">{clubInfo.email}</p>
                    </div>
                  )}
                  
                  {clubInfo.website && (
                    <div className="mb-4">
                      <span className="text-gray-600">Website:</span>
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
                      <span className="text-gray-600">Founded:</span>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
                             <div className="space-y-3">
                 {isAuthenticated ? (
                   <div className="text-center p-4 bg-green-50 rounded-lg">
                     <p className="text-green-800 text-sm mb-2">You are a member of this club</p>
                     <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                       Active Member
                     </span>
                   </div>
                 ) : (
                   <div className="text-center p-4 bg-blue-50 rounded-lg">
                     <p className="text-blue-800 text-sm mb-2">Sign in to view club details</p>
                     <Link 
                       href="/" 
                       className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                     >
                       Sign In
                     </Link>
                   </div>
                 )}
                 
                 <Link 
                   href="/clubs" 
                   className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                 >
                   Browse Other Clubs
                 </Link>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
