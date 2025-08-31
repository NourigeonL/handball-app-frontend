export interface Club {
  club_id: string;
  name: string;
  registration_number: string | null;
  nb_players: number;
  roles?: string[]; // Array of roles from backend (e.g., ['OWNER', 'COACH'])
}

export interface ClubInfo extends Club {
  // Extended club information for the detailed view
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  founded_year?: number;
  // Add more fields as needed based on your backend response
}

export interface Collective {
  collective_id: string;
  name: string;
  description: string;
  nb_players: number;
}

export interface Player {
  player_id: string;
  first_name: string;
  last_name: string;
  gender: 'M' | 'F';
  date_of_birth: string;
  license_number: string;
  license_type: string;
  collectives: Collective[];
}

export interface CollectivePlayer {
  player_id: string;
  first_name: string;
  last_name: string;
  gender: 'M' | 'F';
  date_of_birth: string;
  license_number: string;
  license_type: string;
}

export interface PaginatedPlayersResponse {
  total_count: number;
  total_page: number;
  count: number;
  page: number;
  results: Player[];
}

export interface ClubsResponse {
  clubs: Club[];
}
