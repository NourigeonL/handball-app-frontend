'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ClubSelectionModal from './ClubSelectionModal';

const ClubSelectionWrapper: React.FC = () => {
  const { userClubs, isClubSelected, isAuthenticated, isLoading } = useAuth();
  const [showClubSelection, setShowClubSelection] = useState(false);

  useEffect(() => {
    console.log('ClubSelectionWrapper useEffect:', {
      isAuthenticated,
      isLoading,
      userClubsLength: userClubs.length,
      isClubSelected,
      shouldShowModal: isAuthenticated && !isLoading && userClubs.length > 1 && !isClubSelected
    });

    // Show modal if:
    // 1. User is authenticated
    // 2. Not loading
    // 3. Has multiple clubs
    // 4. No club is selected
    if (
      isAuthenticated && 
      !isLoading && 
      userClubs.length > 1 && 
      !isClubSelected
    ) {
      console.log('Showing club selection modal');
      setShowClubSelection(true);
    } else {
      console.log('Hiding club selection modal');
      setShowClubSelection(false);
    }
  }, [isAuthenticated, isLoading, userClubs.length, isClubSelected]);

  // Additional debug log for render
  console.log('ClubSelectionWrapper render:', {
    isAuthenticated,
    isLoading,
    userClubsLength: userClubs.length,
    isClubSelected,
    showClubSelection
  });

  const handleClose = () => {
    setShowClubSelection(false);
  };

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <ClubSelectionModal 
      isOpen={showClubSelection} 
      onClose={handleClose} 
    />
  );
};

export default ClubSelectionWrapper;
