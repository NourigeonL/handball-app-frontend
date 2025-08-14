'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import UserClub from './UserClub';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-blue-600">
            {user.email.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="text-left">
          <h3 className="text-xl font-semibold text-gray-800">{user.email}</h3>
        </div>
      </div>
      
      {/* User's Club Information */}
      <UserClub />
      
      <div className="flex justify-center">
        <button
          onClick={logout}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
        >
          Se Déconnecter
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
