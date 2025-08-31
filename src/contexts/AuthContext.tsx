'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginResponse, UserClub } from '@/types/auth';
import { decodeGoogleIdToken, formatGoogleUserDisplay } from '@/utils/googleAuth';

interface AuthContextType extends AuthState {
  login: (googleToken: string) => Promise<void>;
  logout: () => void;
  logoutFromClub: () => void;
  selectClub: (club: UserClub) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  loginToClub: (clubId: string) => Promise<string[]>;
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

  // Check authentication status on mount and when needed
  const checkAuthStatus = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Check if user is authenticated by calling the session endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include', // Include cookies
      });

        if (response.ok) {
          const sessionData = await response.json();
          console.log('Session data:', sessionData);
          
          // Extract user data from session
          const userData = sessionData.user || sessionData;
          
          // If we have a google_id_token, decode it to get Google profile info
          let enhancedUser = userData;
          if (sessionData.google_id_token) {
            try {
              const googleProfile = decodeGoogleIdToken(sessionData.google_id_token);
              console.log('Decoded Google profile from stored token:', googleProfile);
              
              // Create enhanced user object with Google profile information
              enhancedUser = {
                ...userData,
                googleProfile: googleProfile || undefined,
                // Extract display information for easy access
                first_name: googleProfile?.given_name || userData.first_name,
                last_name: googleProfile?.family_name || userData.last_name,
                profile_picture: googleProfile?.picture || userData.profile_picture,
              };
              
              console.log('Enhanced user object from stored token:', enhancedUser);
            } catch (error) {
              console.error('Error decoding stored Google ID token:', error);
              // Continue with original user data if decoding fails
            }
          }
          
          // Fetch user's clubs
          const clubsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clubs/my-clubs`, {
            method: 'GET',
            credentials: 'include',
          });

          let userClubs: UserClub[] = [];
          if (clubsResponse.ok) {
            const clubsData = await clubsResponse.json();
            userClubs = clubsData.clubs || clubsData || [];
          }

          // Check for stored club selection - prioritize session data over localStorage
          let selectedClub = null;
          let isClubSelected = false;
          
          // First check if there's a club_id in the session data
          if (sessionData.club_id) {
            // Find the club in userClubs that matches the session club_id
            const sessionClub = userClubs.find(club => club.club_id === sessionData.club_id);
            if (sessionClub) {
              selectedClub = sessionClub;
              isClubSelected = true;
              localStorage.setItem('selectedClub', JSON.stringify(selectedClub));
              console.log('Using club from session data:', selectedClub);
            }
          }
          
          // If no club from session, check localStorage
          if (!selectedClub) {
            const selectedClubData = localStorage.getItem('selectedClub');
            if (selectedClubData) {
              try {
                selectedClub = JSON.parse(selectedClubData);
                isClubSelected = true;
                console.log('Using club from localStorage:', selectedClub);
              } catch (error) {
                console.error('Error parsing stored club data:', error);
              }
            }
          }
          
          // Auto-select club if user has only one and none is selected
          if (!selectedClub && userClubs.length === 1) {
            console.log('Auto-selecting single club:', userClubs[0]);
            selectedClub = userClubs[0];
            isClubSelected = true;
            localStorage.setItem('selectedClub', JSON.stringify(selectedClub));
            
            // Auto-login to the club to establish session
            try {
              const roles = await loginToClub(selectedClub.club_id);
              // Update club with roles
              selectedClub = { ...selectedClub, roles };
              localStorage.setItem('selectedClub', JSON.stringify(selectedClub));
              console.log('Successfully auto-logged into club with roles:', roles);
            } catch (error) {
              console.error('Failed to auto-login to club:', error);
              // Still proceed with club selection, but log the error
              // The user will need to manually log into the club later
            }
            
            // Redirect to the club page if we're not already there
            if (typeof window !== 'undefined' && window.location.pathname !== `/clubs/${selectedClub.club_id}`) {
              console.log('Redirecting to club page:', `/clubs/${selectedClub.club_id}`);
              window.location.href = `/clubs/${selectedClub.club_id}`;
            }
          }
          
          // If we have a selected club (from session or localStorage), ensure we're logged into it
          if (selectedClub && !selectedClub.roles) {
            console.log('Ensuring club login for selected club:', selectedClub);
            try {
              const roles = await loginToClub(selectedClub.club_id);
              // Update club with roles
              selectedClub = { ...selectedClub, roles };
              localStorage.setItem('selectedClub', JSON.stringify(selectedClub));
              console.log('Successfully logged into selected club with roles:', roles);
            } catch (error) {
              console.error('Failed to login to selected club:', error);
              // Still proceed with club selection, but log the error
            }
          }
          
          console.log('Setting auth state after auto-selection:', {
            selectedClub,
            isClubSelected,
            userClubsLength: userClubs.length
          });
          
          setAuthState({
            user: enhancedUser,
            isAuthenticated: true,
            isLoading: false,
            selectedClub,
            userClubs,
            isClubSelected,
          });
      } else {
        // User is not authenticated
        console.log('User is not authenticated');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          selectedClub: null,
          userClubs: [],
          isClubSelected: false,
        });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        selectedClub: null,
        userClubs: [],
        isClubSelected: false,
      });
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (googleToken: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Decode Google ID token to extract user profile information
      const googleProfile = decodeGoogleIdToken(googleToken);
      console.log('Decoded Google profile:', googleProfile);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/frontend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_token: googleToken }),
        credentials: 'include', // Include cookies
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data: LoginResponse = await response.json();
      console.log('Login response:', data);
      
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
      
      // Fetch user's clubs from the dedicated endpoint
      console.log('Fetching user clubs from /clubs/my-clubs');
      const clubsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clubs/my-clubs`, {
        method: 'GET',
        credentials: 'include',
      });

      let userClubs: UserClub[] = [];
      if (clubsResponse.ok) {
        const clubsData = await clubsResponse.json();
        console.log('Clubs response:', clubsData);
        userClubs = clubsData.clubs || clubsData || [];
      } else {
        console.error('Failed to fetch clubs:', clubsResponse.status);
      }
      
      // Auto-select club if user has only one
      let selectedClub = null;
      let isClubSelected = false;
      
      if (userClubs.length === 1) {
        selectedClub = userClubs[0];
        isClubSelected = true;
        localStorage.setItem('selectedClub', JSON.stringify(selectedClub));
        console.log('Auto-selected single club:', selectedClub);
        
        // Auto-login to the club to establish session
        try {
          const roles = await loginToClub(selectedClub.club_id);
          // Update club with roles
          selectedClub = { ...selectedClub, roles };
          localStorage.setItem('selectedClub', JSON.stringify(selectedClub));
          console.log('Auto-logged into club with roles:', roles);
        } catch (error) {
          console.error('Failed to auto-login to club:', error);
          // Still proceed with club selection, but log the error
          // The user will need to manually log into the club later
        }
        
        // Redirect to the club page after auto-selection
        if (typeof window !== 'undefined') {
          console.log('Redirecting to club page after login:', `/clubs/${selectedClub.club_id}`);
          window.location.href = `/clubs/${selectedClub.club_id}`;
        }
      } else if (userClubs.length > 1) {
        console.log('User has multiple clubs, will show selection modal');
      } else {
        console.log('No clubs found for user');
      }
      
      console.log('Setting auth state after login auto-selection:', {
        selectedClub,
        isClubSelected,
        userClubsLength: userClubs.length
      });
      
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

  const selectClub = async (club: UserClub) => {
    localStorage.setItem('selectedClub', JSON.stringify(club));
    setAuthState(prev => ({
      ...prev,
      selectedClub: club,
      isClubSelected: true,
    }));
  };

  const logoutFromClub = async () => {
    try {
      // Call logout-from-club endpoint to clear club session on backend
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout-from-club`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout from club error:', error);
    }
    
    // Clear local club selection
    localStorage.removeItem('selectedClub');
    setAuthState(prev => ({
      ...prev,
      selectedClub: null,
      isClubSelected: false,
    }));
    // Stay on the same page, just remove club selection
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear session
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear local storage
    localStorage.removeItem('selectedClub');
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      selectedClub: null,
      userClubs: [],
      isClubSelected: false,
    });
  };

  const loginToClub = async (clubId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login-to-club`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ club_id: clubId }),
        credentials: 'include', // Include cookies (session_id)
      });

      if (!response.ok) {
        throw new Error('Failed to login to club');
      }

      const data = await response.json();
      console.log('Club login response:', data);
      
      // Extract roles from the response
      const roles = data.roles || [];
      return roles;
    } catch (error) {
      console.error('Login to club error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    logoutFromClub,
    selectClub,
    checkAuthStatus,
    loginToClub,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
