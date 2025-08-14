'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import GoogleLogin from '@/components/GoogleLogin';
import LogoutModal from '@/components/LogoutModal';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatGoogleUserDisplay } from '@/utils/googleAuth';

const Navigation: React.FC = () => {
  const { user, isAuthenticated, logout, selectedClub, userClubs, isClubSelected } = useAuth();
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Get user display information
  const userDisplay = user?.googleProfile 
    ? formatGoogleUserDisplay(user.googleProfile)
    : {
        fullName: user?.first_name && user?.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : user?.email || '',
        initials: user?.first_name && user?.last_name 
          ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
          : user?.email?.charAt(0).toUpperCase() || '?',
      };

  const isActivePage = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const getLinkClasses = (path: string) => {
    const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
    if (isActivePage(path)) {
      return `${baseClasses} text-blue-600 bg-blue-50`;
    }
    return `${baseClasses} text-gray-700 hover:text-blue-600 hover:bg-gray-50`;
  };

  const handleSignOutClick = () => {
    if (userClubs.length > 1) {
      setShowLogoutModal(true);
    } else {
      logout();
    }
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Gestionnaire de Clubs</span>
              </Link>
            </div>

            {/* Navigation Links - Only show when authenticated */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-8">
                <Link 
                  href="/" 
                  className={getLinkClasses('/')}
                >
                  Tableau de Bord
                </Link>
                <Link 
                  href="/profile" 
                  className={getLinkClasses('/profile')}
                >
                  Profil
                </Link>
              </div>
            )}

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* Selected Club Info */}
                  {isClubSelected && selectedClub && (
                    <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-green-100 border border-green-200 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700 font-medium">
                        {selectedClub.name}
                      </span>
                    </div>
                  )}
                  
                  {/* User Info */}
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {userDisplay.initials}
                      </span>
                    </div>
                    <span className="hidden sm:block text-sm text-gray-700 font-medium">
                      {userDisplay.fullName}
                    </span>
                  </div>
                  
                  {/* Sign Out Button */}
                  <button
                    onClick={handleSignOutClick}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Se Déconnecter
                  </button>
                </div>
              ) : (
                /* Login Button */
                <div className="flex items-center space-x-2">
                  <GoogleLogin />
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Logout Modal */}
      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
      />
    </>
  );
};

export default Navigation;
