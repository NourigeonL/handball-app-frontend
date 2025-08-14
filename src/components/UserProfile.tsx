'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import UserClub from './UserClub';
import { formatGoogleUserDisplay } from '@/utils/googleAuth';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  // Format user display information
  const displayInfo = user.googleProfile 
    ? formatGoogleUserDisplay(user.googleProfile)
    : {
        fullName: user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email,
        picture: user.profile_picture || '',
        initials: user.first_name && user.last_name 
          ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
          : user.email.charAt(0).toUpperCase(),
      };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center space-x-4">
        {/* Profile Picture or Initials */}
        {displayInfo.picture ? (
          <img 
            src={displayInfo.picture} 
            alt={`Photo de profil de ${displayInfo.fullName}`}
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
          />
        ) : (
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-200">
            <span className="text-2xl font-bold text-blue-600">
              {displayInfo.initials}
            </span>
          </div>
        )}
        
        <div className="text-left">
          <h3 className="text-xl font-semibold text-gray-800">{displayInfo.fullName}</h3>
          <p className="text-sm text-gray-600">{displayInfo.email}</p>
          {user.googleProfile && (
            <div className="flex items-center space-x-1 mt-1">
              <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center border border-gray-300">
                <span className="text-blue-600 font-bold text-xs">G</span>
              </div>
              <span className="text-xs text-gray-500">Compte Google vérifié</span>
            </div>
          )}
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
