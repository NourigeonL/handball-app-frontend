'use client';

import { useAuth } from '@/contexts/AuthContext';
import UserProfile from '@/components/UserProfile';
import UserClub from '@/components/UserClub';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { userClubs, isClubSelected, selectedClub, isLoading } = useAuth();
  const router = useRouter();

  // Auto-redirect users to their club page if they're already logged into a club
  useEffect(() => {
    // Only redirect if we're not already on a club page
    const currentPath = window.location.pathname;
    const isOnClubPage = currentPath.startsWith('/clubs/');
    
    console.log('Home page redirect check:', {
      isLoading,
      isClubSelected,
      selectedClub: selectedClub?.club_id,
      userClubsLength: userClubs.length,
      currentPath,
      isOnClubPage
    });
    
    if (!isLoading && isClubSelected && selectedClub && !isOnClubPage) {
      // User is already logged into a club and not on club page, redirect to club page
      console.log('User already logged into club, redirecting to club page:', selectedClub.club_id);
      // Small delay to ensure AuthContext is fully processed
      setTimeout(() => {
        router.push(`/clubs/${selectedClub.club_id}`);
      }, 100);
    } else if (!isLoading && !isClubSelected && userClubs.length === 1 && !isOnClubPage) {
      // User has only one club but it's not selected, redirect to force selection
      console.log('Auto-redirecting single club user to club page');
      // Small delay to ensure AuthContext is fully processed
      setTimeout(() => {
        router.push(`/clubs/${userClubs[0].club_id}`);
      }, 100);
    }
  }, [isLoading, isClubSelected, selectedClub, userClubs, router]);

  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <UserClub />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
