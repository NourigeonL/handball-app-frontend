import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';
import {
  authenticatedClubGet,
  authenticatedClubPost,
  authenticatedClubPut,
  authenticatedClubDelete,
  authenticatedClubPatch,
} from '@/utils/api';

/**
 * Hook for club authentication and requests
 * Provides easy access to club ID and authenticated request functions
 */
export const useClubAuth = () => {
  const { selectedClub, isClubSelected } = useAuth();

  // Check if user has selected a club
  const hasSelectedClub = useMemo(() => {
    return isClubSelected && selectedClub && selectedClub.club_id;
  }, [isClubSelected, selectedClub]);

  // Get current club ID
  const clubId = useMemo(() => {
    return selectedClub?.club_id || null;
  }, [selectedClub]);

  // Get current club name
  const clubName = useMemo(() => {
    return selectedClub?.name || null;
  }, [selectedClub]);

  // Get current club role
  const clubRole = useMemo(() => {
    return selectedClub?.role || null;
  }, [selectedClub]);

  // Check if user is admin or owner
  const isClubAdmin = useMemo(() => {
    return selectedClub?.roles?.includes('OWNER') || selectedClub?.roles?.includes('COACH');
  }, [selectedClub]);

  // Check if user is owner
  const isClubOwner = useMemo(() => {
    return selectedClub?.roles?.includes('OWNER');
  }, [selectedClub]);

  // Check if user is coach
  const isClubCoach = useMemo(() => {
    return selectedClub?.roles?.includes('COACH');
  }, [selectedClub]);

  // Get all roles as a formatted string
  const rolesDisplay = useMemo(() => {
    if (!selectedClub?.roles || selectedClub.roles.length === 0) return 'Membre';
    return selectedClub.roles.join(', ');
  }, [selectedClub]);

  // Authenticated request functions that automatically include club ID
  const clubApi = useMemo(() => ({
    get: authenticatedClubGet,
    post: authenticatedClubPost,
    put: authenticatedClubPut,
    delete: authenticatedClubDelete,
    patch: authenticatedClubPatch,
  }), []);

  return {
    // Club information
    selectedClub,
    clubId,
    clubName,
    clubRole,
    isClubSelected,
    hasSelectedClub,
    
    // Permissions
    isClubAdmin,
    isClubOwner,
    isClubCoach,
    rolesDisplay,
    
    // API functions
    clubApi,
    
    // Convenience methods
    get: authenticatedClubGet,
    post: authenticatedClubPost,
    put: authenticatedClubPut,
    delete: authenticatedClubDelete,
    patch: authenticatedClubPatch,
  };
};
