import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { MovieResponse } from '../types/movie';
import { TMDB_CONFIG } from '../utils/constants';

interface GenreMoviesFilters {
  sortBy?: string;
  year?: string | null;
  duration?: string | null;
  rating?: string | null;
  watchProviders?: string | null;
}

interface UseGenreMoviesOptions {
  genreId: number | null;
  filters?: GenreMoviesFilters;
  autoLoad?: boolean;
}

interface UseGenreMoviesReturn {
  movies: MovieResponse['results'];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalResults: number;
  loadMovies: (page?: number) => Promise<void>;
  reset: () => void;
}

export const useGenreMovies = (options: UseGenreMoviesOptions = { genreId: null }): UseGenreMoviesReturn => {
  const { genreId, filters, autoLoad = true } = options;

  const [movies, setMovies] = useState<MovieResponse['results']>([]);
  const [loading, setLoading] = useState<boolean>(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalResults, setTotalResults] = useState<number>(0);

  const loadMovies = useCallback(async (page: number = 1) => {
    if (!genreId) {
      setMovies([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build sort parameter
      const sortBy = filters?.sortBy || 'popularity.desc';
      
      // Build params for discover endpoint
      const params: any = {
        with_genres: genreId,
        page,
        sort_by: sortBy,
      };

      // Add year filter if specified
      if (filters?.year && filters.year !== 'all') {
        const yearRange = filters.year.split('-');
        if (yearRange.length === 2) {
          params['primary_release_date.gte'] = `${yearRange[0]}-01-01`;
          params['primary_release_date.lte'] = `${yearRange[1]}-12-31`;
        } else {
          params['primary_release_year'] = filters.year;
        }
      }

      // Add rating filter if specified
      if (filters?.rating && filters.rating !== 'all') {
        params['vote_average.gte'] = filters.rating;
      }

      // Add duration filter if specified
      if (filters?.duration && filters.duration !== 'all') {
        const durationMap: { [key: string]: { min: number; max: number } } = {
          'short': { min: 0, max: 90 },
          'medium': { min: 90, max: 120 },
          'long': { min: 120, max: 150 },
          'very-long': { min: 150, max: 999 },
        };
        const duration = durationMap[filters.duration];
        if (duration) {
          params['with_runtime.gte'] = duration.min;
          params['with_runtime.lte'] = duration.max;
        }
      }

      // Use the discover endpoint directly with all params
      const api = axios.create({
        baseURL: TMDB_CONFIG.BASE_URL,
      });
      
      const { data } = await api.get<MovieResponse>('/discover/movie', {
        params: {
          api_key: import.meta.env.VITE_TMDB_API_KEY,
          language: 'en-US',
          ...params,
        },
      });
      
      const response = data;
      setMovies(response.results);
      setCurrentPage(response.page);
      setTotalPages(response.total_pages);
      setTotalResults(response.total_results);
    } catch (err: any) {
      console.error('Error loading genre movies:', err);
      setError(err.message || 'Error loading movies');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [genreId, filters]);

  useEffect(() => {
    if (autoLoad && genreId) {
      loadMovies(1);
    }
  }, [genreId, autoLoad, loadMovies]);

  const reset = () => {
    setMovies([]);
    setError(null);
    setCurrentPage(1);
    setTotalPages(0);
    setTotalResults(0);
  };

  return {
    movies,
    loading,
    error,
    currentPage,
    totalPages,
    totalResults,
    loadMovies,
    reset,
  };
};

