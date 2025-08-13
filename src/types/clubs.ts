export interface Club {
  club_id: string;
  name: string;
  registration_number: string | null;
  nb_players: number;
}

export interface ClubsResponse {
  clubs: Club[];
}
