export interface UserClub {
  club_id: string;
  name: string;
  role: 'member' | 'admin' | 'owner';
}

export interface GoogleUserProfile {
  sub: string;           // Google user ID
  name: string;          // Full name
  given_name: string;    // First name
  family_name: string;   // Last name
  picture: string;       // Profile picture URL
  email: string;         // Email address
  email_verified: boolean; // Email verification status
  locale: string;        // User locale (e.g., 'en', 'fr')
}

export interface User {
  id: string;
  email: string;
  // Google profile information
  googleProfile?: GoogleUserProfile;
  // Additional fields from your backend
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  selectedClub: UserClub | null;
  userClubs: UserClub[];
  isClubSelected: boolean;
}

export interface LoginResponse {
  user: User;
  token?: string;
  access_token?: string;
  jwt?: string;
  auth_token?: string;
}
