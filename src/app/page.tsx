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

  // Auto-redirect users with a single club to their club page
  useEffect(() => {
    if (!isLoading && !isClubSelected && userClubs.length === 1) {
      // User has only one club but it's not selected, redirect to force selection
      console.log('Auto-redirecting single club user to club page');
      router.push(`/clubs/${userClubs[0].club_id}`);
    }
  }, [isLoading, isClubSelected, userClubs, router]);

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
