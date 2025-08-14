'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginResponse, UserClub } from '@/types/auth';
import { decodeGoogleIdToken, formatGoogleUserDisplay } from '@/utils/googleAuth';

interface AuthContextType extends AuthState {
  login: (googleToken: string) => Promise<void>;
  logout: () => void;
  logoutFromClub: () => void;
  selectClub: (club: UserClub) => void;
  getAuthToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    selectedClub: null,
    userClubs: [],
    isClubSelected: false,
  });

  useEffect(() => {
    // Check if user is already logged in (e.g., from localStorage)
    const token = localStorage.getItem('access');
    const userData = localStorage.getItem('userData');
    const userClubsData = localStorage.getItem('userClubs');
    const selectedClubData = localStorage.getItem('selectedClub');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        const userClubs = userClubsData ? JSON.parse(userClubsData) : [];
        let selectedClub = selectedClubData ? JSON.parse(selectedClubData) : null;
        let isClubSelected = !!selectedClub;
        
        // Auto-select club if user has only one and none is selected
        if (!selectedClub && userClubs.length === 1) {
          selectedClub = userClubs[0];
          isClubSelected = true;
          localStorage.setItem('selectedClub', JSON.stringify(selectedClub));
        }
        
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          selectedClub,
          userClubs,
          isClubSelected,
        });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('access');
        localStorage.removeItem('userData');
        localStorage.removeItem('userClubs');
        localStorage.removeItem('selectedClub');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          selectedClub: null,
          userClubs: [],
          isClubSelected: false,
        });
      }
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        selectedClub: null,
        userClubs: [],
        isClubSelected: false,
      });
    }
  }, []);

  const login = async (googleToken: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Decode Google ID token to extract user profile information
      const googleProfile = decodeGoogleIdToken(googleToken);
      console.log('Decoded Google profile:', googleProfile);
      
      const response = await fetch('http://localhost:8000/auth/frontend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_token: googleToken }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data: LoginResponse = await response.json();
      console.log('Login response:', data);
      
      // Try to find the token in different possible fields
      const token = data.token || data.access_token || data.jwt || data.auth_token;
      
      if (!token) {
        throw new Error('No token found in response');
      }
      
      // Create enhanced user object with Google profile information
      const enhancedUser: User = {
        ...data.user,
        googleProfile: googleProfile || undefined,
        // Extract display information for easy access
        first_name: googleProfile?.given_name || data.user.first_name,
        last_name: googleProfile?.family_name || data.user.last_name,
        profile_picture: googleProfile?.picture || data.user.profile_picture,
      };
      
      console.log('Enhanced user object:', enhancedUser);
      
      // Store authentication data
      localStorage.setItem('access', token);
      localStorage.setItem('userData', JSON.stringify(enhancedUser));
      
      // Fetch user's clubs from the dedicated endpoint
      console.log('Fetching user clubs from /clubs/my-clubs');
      const clubsResponse = await fetch('http://localhost:8000/clubs/my-clubs', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      let userClubs: UserClub[] = [];
      if (clubsResponse.ok) {
        const clubsData = await clubsResponse.json();
        console.log('Clubs response:', clubsData);
        userClubs = clubsData.clubs || clubsData || [];
      } else {
        console.error('Failed to fetch clubs:', clubsResponse.status);
      }
      
      localStorage.setItem('userClubs', JSON.stringify(userClubs));
      
      // Auto-select club if user has only one
      let selectedClub = null;
      let isClubSelected = false;
      
      if (userClubs.length === 1) {
        selectedClub = userClubs[0];
        isClubSelected = true;
        localStorage.setItem('selectedClub', JSON.stringify(selectedClub));
        console.log('Auto-selected single club:', selectedClub);
      } else if (userClubs.length > 1) {
        console.log('User has multiple clubs, will show selection modal');
      } else {
        console.log('No clubs found for user');
      }
      
      setAuthState({
        user: enhancedUser,
        isAuthenticated: true,
        isLoading: false,
        selectedClub,
        userClubs,
        isClubSelected,
      });
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const selectClub = (club: UserClub) => {
    localStorage.setItem('selectedClub', JSON.stringify(club));
    setAuthState(prev => ({
      ...prev,
      selectedClub: club,
      isClubSelected: true,
    }));
  };

  const logoutFromClub = () => {
    localStorage.removeItem('selectedClub');
    setAuthState(prev => ({
      ...prev,
      selectedClub: null,
      isClubSelected: false,
    }));
    // Stay on the same page, just remove club selection
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('userData');
    localStorage.removeItem('userClubs');
    localStorage.removeItem('selectedClub');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      selectedClub: null,
      userClubs: [],
      isClubSelected: false,
    });
    
    // Don't redirect - let the ProtectedRoute handle it
    // This prevents redirect loops since the home page is now protected
  };

  const getAuthToken = () => {
    return localStorage.getItem('access');
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    logoutFromClub,
    selectClub,
    getAuthToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
