export interface User {
  user_id: string;
  email: string;
  google_account_id: string;
}

export interface UserClub {
  club_id: string;
  name: string;
  role: 'member' | 'admin' | 'owner';
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
