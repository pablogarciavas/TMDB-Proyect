import { useState, useEffect } from 'react';
import { Movie, MovieResponse } from '../types/movie';
import { tmdbApi } from '../services/tmdbApi';

interface UseMoviesOptions {
  initialPage?: number;
  autoLoad?: boolean;
}

interface UseMoviesReturn {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalResults: number;
  loadMovies: (page?: number) => Promise<void>;
  searchMovies: (query: string, page?: number) => Promise<void>;
  reset: () => void;
}

export const useMovies = (options: UseMoviesOptions = {}): UseMoviesReturn => {
  const { initialPage = 1, autoLoad = true } = options;

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalResults, setTotalResults] = useState<number>(0);

  const loadMovies = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response: MovieResponse = await tmdbApi.getPopularMovies(page);
      setMovies(response.results);
      setCurrentPage(response.page);
      setTotalPages(response.total_pages);
      setTotalResults(response.total_results);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las películas');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async (query: string, page: number = 1) => {
    if (!query.trim()) {
      await loadMovies(page);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response: MovieResponse = await tmdbApi.searchMovies(query, page);
      setMovies(response.results);
      setCurrentPage(response.page);
      setTotalPages(response.total_pages);
      setTotalResults(response.total_results);
    } catch (err: any) {
      setError(err.message || 'Error al buscar películas');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMovies([]);
    setError(null);
    setCurrentPage(initialPage);
    setTotalPages(0);
    setTotalResults(0);
  };

  useEffect(() => {
    if (autoLoad) {
      loadMovies(initialPage);
    }
  }, []);

  return {
    movies,
    loading,
    error,
    currentPage,
    totalPages,
    totalResults,
    loadMovies,
    searchMovies,
    reset,
  };
};

