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
  const { userClubs, selectClub } = useAuth();
  const router = useRouter();

  console.log('ClubSelectionModal render:', { isOpen, userClubsLength: userClubs.length });

  if (!isOpen) return null;

  const handleClubSelect = (club: UserClub) => {
    selectClub(club);
    onClose();
    // Redirect to dashboard after club selection to complete the flow
    router.push('/dashboard');
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
            <h2 className="text-2xl font-bold text-gray-900">Select Your Club</h2>
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
              ? "You're a member of multiple clubs. Please select which club you'd like to work with for this session."
              : "Select your club to continue."
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
                    <p className="text-sm text-gray-500 capitalize">{club.role}</p>
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
                ? "You can change your selected club at any time from your profile."
                : "This club will be automatically selected for your session."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubSelectionModal;
