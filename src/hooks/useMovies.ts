import { useState, useEffect, useCallback, useRef } from 'react';
import { Movie, MovieResponse } from '../types/movie';
import { tmdbApi } from '../services/tmdbApi';
import { useApiCache } from './useApiCache';

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
  const cache = useApiCache();
  const isMountedRef = useRef(true);
  const currentRequestRef = useRef<string>('');

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalResults, setTotalResults] = useState<number>(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadMovies = useCallback(async (page: number = 1) => {
    const requestId = `popular-${page}`;
    currentRequestRef.current = requestId;

    if (isMountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const cacheKey = cache.generateKey('popular', { page });
      const cached = cache.get<MovieResponse>(cacheKey);
      
      let response: MovieResponse;
      if (cached) {
        response = cached;
      } else {
        response = await tmdbApi.getPopularMovies(page);
        cache.set(cacheKey, response);
      }
      
      // Verificar que el componente sigue montado y esta es la petición actual
      if (isMountedRef.current && currentRequestRef.current === requestId) {
        setMovies(response.results);
        setCurrentPage(response.page);
        setTotalPages(response.total_pages);
        setTotalResults(response.total_results);
      }
    } catch (err: any) {
      // Solo actualizar error si el componente sigue montado y esta es la petición actual
      if (isMountedRef.current && currentRequestRef.current === requestId) {
        setError(err.message || 'Error al cargar las películas');
        setMovies([]);
      }
    } finally {
      // Solo actualizar loading si el componente sigue montado y esta es la petición actual
      if (isMountedRef.current && currentRequestRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [cache]);

  const searchMovies = useCallback(async (query: string, page: number = 1) => {
    if (!query.trim()) {
      await loadMovies(page);
      return;
    }

    const requestId = `search-${query}-${page}`;
    currentRequestRef.current = requestId;

    if (isMountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const cacheKey = cache.generateKey('search', { query, page });
      const cached = cache.get<MovieResponse>(cacheKey);
      
      let response: MovieResponse;
      if (cached) {
        response = cached;
      } else {
        response = await tmdbApi.searchMovies(query, page);
        cache.set(cacheKey, response);
      }
      
      // Verificar que el componente sigue montado y esta es la petición actual
      if (isMountedRef.current && currentRequestRef.current === requestId) {
        setMovies(response.results);
        setCurrentPage(response.page);
        setTotalPages(response.total_pages);
        setTotalResults(response.total_results);
      }
    } catch (err: any) {
      // Solo actualizar error si el componente sigue montado y esta es la petición actual
      if (isMountedRef.current && currentRequestRef.current === requestId) {
        setError(err.message || 'Error al buscar películas');
        setMovies([]);
      }
    } finally {
      // Solo actualizar loading si el componente sigue montado y esta es la petición actual
      if (isMountedRef.current && currentRequestRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [cache, loadMovies]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

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

