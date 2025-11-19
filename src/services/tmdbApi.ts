import axios from 'axios';
import { MovieResponse, Movie } from '../types/movie';
import { GenreResponse } from '../types/genre';
import { MovieDetails, Credits, WatchProviders, Videos } from '../types/movieDetails';
import { TMDB_CONFIG } from '../utils/constants';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const api = axios.create({
  baseURL: TMDB_CONFIG.BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'en-US', // Set default language to English
  },
});

export const tmdbApi = {
  // Obtener películas populares
  getPopularMovies: async (page: number = 1): Promise<MovieResponse> => {
    const { data } = await api.get<MovieResponse>('/movie/popular', {
      params: { page },
    });
    return data;
  },

  // Buscar películas
  searchMovies: async (query: string, page: number = 1): Promise<MovieResponse> => {
    const { data } = await api.get<MovieResponse>('/search/movie', {
      params: { query, page },
    });
    return data;
  },

  // Get movie details
  getMovieDetails: async (id: number): Promise<MovieDetails> => {
    const { data } = await api.get<MovieDetails>(`/movie/${id}`);
    return data;
  },

  // Get movie credits (cast and crew)
  getMovieCredits: async (id: number): Promise<Credits> => {
    const { data } = await api.get<Credits>(`/movie/${id}/credits`);
    return data;
  },

  // Get watch providers (where to watch)
  getWatchProviders: async (id: number): Promise<WatchProviders> => {
    const { data } = await api.get<WatchProviders>(`/movie/${id}/watch/providers`);
    return data;
  },

  // Get similar movies
  getSimilarMovies: async (id: number, page: number = 1): Promise<MovieResponse> => {
    const { data } = await api.get<MovieResponse>(`/movie/${id}/similar`, {
      params: { page },
    });
    return data;
  },

  // Get movie videos (trailers)
  getMovieVideos: async (id: number): Promise<Videos> => {
    const { data } = await api.get<Videos>(`/movie/${id}/videos`);
    return data;
  },

  // Obtener películas mejor valoradas
  getTopRatedMovies: async (page: number = 1): Promise<MovieResponse> => {
    const { data } = await api.get<MovieResponse>('/movie/top_rated', {
      params: { page },
    });
    return data;
  },

  // Get movie genres
  getGenres: async (): Promise<GenreResponse> => {
    const { data } = await api.get<GenreResponse>('/genre/movie/list', {
      params: {
        language: 'en-US',
      },
    });
    return data;
  },

  // Get movies by genre with optional filters
  getMoviesByGenre: async (genreId: number, page: number = 1, customParams?: any): Promise<MovieResponse> => {
    const defaultParams = {
      with_genres: genreId,
      page,
      sort_by: 'popularity.desc',
    };
    
    const { data } = await api.get<MovieResponse>('/discover/movie', {
      params: {
        ...defaultParams,
        ...customParams,
      },
    });
    return data;
  },

  // Obtener próximos estrenos
  getUpcomingMovies: async (page: number = 1): Promise<MovieResponse> => {
    const { data } = await api.get<MovieResponse>('/movie/upcoming', {
      params: { page },
    });
    return data;
  },
};

export const getImageUrl = (
  path: string | null,
  size: 'w185' | 'w500' | 'w780' | 'original' = 'w500'
): string => {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
  return `${TMDB_CONFIG.IMAGE_BASE_URL}/${size}${path}`;
};

