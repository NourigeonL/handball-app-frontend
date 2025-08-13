'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center space-x-4">
        {user.picture && (
          <Image
            src={user.picture}
            alt={user.name}
            width={64}
            height={64}
            className="rounded-full"
          />
        )}
        <div className="text-left">
          <h3 className="text-xl font-semibold text-gray-800">{user.name}</h3>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>
      
      <div className="flex space-x-3">
        <Link
          href="/clubs"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
        >
          View Clubs
        </Link>
        <button
          onClick={logout}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
