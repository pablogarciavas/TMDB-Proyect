export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department?: string;
  popularity?: number;
}

export interface PersonResponse {
  page: number;
  results: Person[];
  total_pages: number;
  total_results: number;
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  profile_path: string | null;
  birthday: string | null;
  place_of_birth: string | null;
  known_for_department: string;
  popularity: number;
}

export interface PersonMovieCredits {
  cast: Array<{
    id: number;
    title: string;
    character?: string;
    release_date: string;
    poster_path: string | null;
    vote_average: number;
  }>;
  crew: Array<{
    id: number;
    title: string;
    job: string;
    release_date: string;
    poster_path: string | null;
    vote_average: number;
  }>;
}

