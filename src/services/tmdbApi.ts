import axios from 'axios';
import { MovieResponse, Movie } from '../types/movie';
import { TMDB_CONFIG } from '../utils/constants';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const api = axios.create({
  baseURL: TMDB_CONFIG.BASE_URL,
  params: {
    api_key: API_KEY,
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

  // Obtener detalles de una película
  getMovieDetails: async (id: number): Promise<Movie> => {
    const { data } = await api.get<Movie>(`/movie/${id}`);
    return data;
  },

  // Obtener películas mejor valoradas
  getTopRatedMovies: async (page: number = 1): Promise<MovieResponse> => {
    const { data } = await api.get<MovieResponse>('/movie/top_rated', {
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

