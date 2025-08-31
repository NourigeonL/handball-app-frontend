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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      // Consider club page as active when it's the default landing page
      return pathname === '/' || (isClubSelected && selectedClub && pathname === `/clubs/${selectedClub.club_id}`);
    }
    // For other paths, use exact matching to avoid conflicts
    return pathname === path;
  };

  const getLinkClasses = (path: string) => {
    const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
    if (isActivePage(path)) {
      return `${baseClasses} text-blue-600 bg-blue-50`;
    }
    return `${baseClasses} text-gray-700 hover:text-blue-600 hover:bg-gray-50`;
  };

  const getMobileLinkClasses = (path: string) => {
    const baseClasses = "block px-3 py-2 rounded-md text-base font-medium transition-colors";
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex-shrink-0">
              <Link href={isClubSelected && selectedClub ? `/clubs/${selectedClub.club_id}` : "/"} className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-gray-900 hidden sm:block">Gestionnaire de Clubs</span>
                <span className="text-lg font-bold text-gray-900 sm:hidden">Gestionnaire</span>
              </Link>
            </div>

            {/* Navigation Links - Desktop */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
                <Link 
                  href={isClubSelected && selectedClub ? `/clubs/${selectedClub.club_id}` : "/"} 
                  className={getLinkClasses(isClubSelected && selectedClub ? `/clubs/${selectedClub.club_id}` : '/')}
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
            <div className="flex items-center space-x-2 sm:space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-2 sm:space-x-4">
                  {/* Selected Club Info - Hidden on very small screens */}
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
                    className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    <span className="hidden sm:inline">Se Déconnecter</span>
                    <span className="sm:hidden">Déconnexion</span>
                  </button>
                </div>
              ) : (
                /* Login Button */
                <div className="flex items-center space-x-2">
                  <GoogleLogin />
                </div>
              )}

              {/* Mobile menu button */}
              {isAuthenticated && (
                <button
                  onClick={toggleMobileMenu}
                  className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                  aria-expanded={isMobileMenuOpen}
                  aria-label="Toggle mobile menu"
                >
                  <svg
                    className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <svg
                    className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu */}
          {isAuthenticated && isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="space-y-2">
                <Link 
                  href={isClubSelected && selectedClub ? `/clubs/${selectedClub.club_id}` : "/"} 
                  className={getMobileLinkClasses(isClubSelected && selectedClub ? `/clubs/${selectedClub.club_id}` : '/')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Tableau de Bord
                </Link>
                <Link 
                  href="/profile" 
                  className={getMobileLinkClasses('/profile')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profil
                </Link>
                
                {/* Selected Club Info in Mobile Menu */}
                {isClubSelected && selectedClub && (
                  <div className="px-3 py-2">
                    <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 border border-green-200 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700 font-medium">
                        {selectedClub.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
