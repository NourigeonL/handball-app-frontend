export interface Club {
  club_id: string;
  name: string;
  registration_number: string | null;
  nb_players: number;
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

export interface ClubsResponse {
  clubs: Club[];
}
