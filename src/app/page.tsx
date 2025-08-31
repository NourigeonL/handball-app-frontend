'use client';

import { useAuth } from '@/contexts/AuthContext';
import UserProfile from '@/components/UserProfile';
import UserClub from '@/components/UserClub';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { userClubs, isClubSelected, selectedClub } = useAuth();
  const router = useRouter();

  // Redirect users with a selected club to their club page (default landing page)
  useEffect(() => {
    if (isClubSelected && selectedClub) {
      router.replace(`/clubs/${selectedClub.club_id}`);
    }
  }, [isClubSelected, selectedClub, router]);

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
