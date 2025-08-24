'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserClub } from '@/types/auth';
import { useRouter } from 'next/navigation';

interface ClubSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ClubSelectionModal: React.FC<ClubSelectionModalProps> = ({ isOpen, onClose }) => {
  const { userClubs, selectClub, loginToClub } = useAuth();
  const router = useRouter();

  console.log('ClubSelectionModal render:', { isOpen, userClubsLength: userClubs.length });

  if (!isOpen) return null;

  const handleClubSelect = async (club: UserClub) => {
    try {
      // Login to the selected club to get roles
      const roles = await loginToClub(club.club_id);
      
      // Update club with roles from backend
      const clubWithRoles = {
        ...club,
        roles: roles
      };
      
      // Select the club with updated roles
      await selectClub(clubWithRoles);
      onClose();
      
      // Redirect to home page (main dashboard) after club selection
      router.push('/');
    } catch (error) {
      console.error('Error logging into club:', error);
      // Handle error - maybe show a toast or error message
    }
  };

  // Don't allow closing without selection for users with multiple clubs
  const handleClose = () => {
    // Only allow closing if user has selected a club or has only one club
    if (userClubs.length === 1) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Sélectionnez Votre Club</h2>
            {userClubs.length === 1 && (
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <p className="text-gray-600 mb-6">
            {userClubs.length > 1 
              ? "Vous êtes membre de plusieurs clubs. Veuillez sélectionner avec quel club vous souhaitez travailler pour cette session."
              : "Sélectionnez votre club pour continuer."
            }
          </p>
          
          <div className="space-y-3">
            {userClubs.map((club) => (
              <button
                key={club.club_id}
                onClick={() => handleClubSelect(club)}
                className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{club.name}</h3>
                    <p className="text-sm text-gray-500">
                      {club.roles && club.roles.length > 0 ? club.roles.join(', ') : club.role}
                    </p>
                  </div>
                  <div className="text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              {userClubs.length > 1 
                ? "Vous pouvez changer votre club sélectionné à tout moment depuis votre profil."
                : "Ce club sera automatiquement sélectionné pour votre session."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubSelectionModal;
