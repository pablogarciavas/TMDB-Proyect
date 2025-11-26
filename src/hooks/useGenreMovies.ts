import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { MovieResponse } from '../types/movie';
import { TMDB_CONFIG } from '../utils/constants';
import { useApiCache } from './useApiCache';

interface GenreMoviesFilters {
  searchQuery?: string;
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
  const cache = useApiCache();
  const isMountedRef = useRef(true);
  const currentRequestRef = useRef<string>('');

  const [movies, setMovies] = useState<MovieResponse['results']>([]);
  const [loading, setLoading] = useState<boolean>(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalResults, setTotalResults] = useState<number>(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Memoizar valores de filtros para evitar re-renders innecesarios
  const searchQuery = useMemo(() => filters?.searchQuery?.trim() || '', [filters?.searchQuery]);
  const sortBy = useMemo(() => filters?.sortBy || 'popularity.desc', [filters?.sortBy]);
  const year = useMemo(() => filters?.year || null, [filters?.year]);
  const rating = useMemo(() => filters?.rating || null, [filters?.rating]);
  const duration = useMemo(() => filters?.duration || null, [filters?.duration]);

  const loadMovies = useCallback(async (page: number = 1) => {
    if (!genreId) {
      if (isMountedRef.current) {
        setMovies([]);
        setLoading(false);
      }
      return;
    }

    // Crear un identificador único para esta petición
    const requestId = `${genreId}-${searchQuery}-${sortBy}-${year}-${rating}-${duration}-${page}`;
    currentRequestRef.current = requestId;

    if (isMountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const api = axios.create({
        baseURL: TMDB_CONFIG.BASE_URL,
      });

      let response: MovieResponse;

      // Si hay búsqueda, usar el endpoint de búsqueda y filtrar por género
      if (searchQuery) {
        // La respuesta de búsqueda de TMDB YA incluye genre_ids, no necesitamos llamadas adicionales
        const cacheKey = cache.generateKey('search/genre', { 
          query: searchQuery, 
          genreId, 
          page 
        });
        const cached = cache.get<MovieResponse>(cacheKey);
        
        if (cached) {
          response = cached;
        } else {
          const searchResponse = await api.get<MovieResponse>('/search/movie', {
            params: {
              api_key: import.meta.env.VITE_TMDB_API_KEY,
              language: 'en-US',
              query: searchQuery,
              page,
            },
          });

          // Filtrar por género directamente - la respuesta ya tiene genre_ids
          const filteredMovies = searchResponse.data.results.filter((movie) =>
            movie.genre_ids?.includes(genreId)
          );

          // Aplicar otros filtros en el cliente
          let finalMovies = filteredMovies;

          // Filtrar por año
          if (year && year !== 'all') {
            const yearRange = year.split('-');
            if (yearRange.length === 2) {
              const startYear = parseInt(yearRange[0]);
              const endYear = parseInt(yearRange[1]);
              finalMovies = finalMovies.filter((movie) => {
                const movieYear = movie.release_date
                  ? new Date(movie.release_date).getFullYear()
                  : 0;
                return movieYear >= startYear && movieYear <= endYear;
              });
            } else {
              const yearNum = parseInt(year);
              finalMovies = finalMovies.filter((movie) => {
                const movieYear = movie.release_date
                  ? new Date(movie.release_date).getFullYear()
                  : 0;
                return movieYear === yearNum;
              });
            }
          }

          // Filtrar por rating
          if (rating && rating !== 'all') {
            const minRating = parseFloat(rating);
            finalMovies = finalMovies.filter(
              (movie) => movie.vote_average >= minRating
            );
          }

          // Ordenar
          finalMovies.sort((a, b) => {
            switch (sortBy) {
              case 'popularity.desc':
                return (b.popularity || 0) - (a.popularity || 0);
              case 'popularity.asc':
                return (a.popularity || 0) - (b.popularity || 0);
              case 'vote_average.desc':
                return b.vote_average - a.vote_average;
              case 'vote_average.asc':
                return a.vote_average - b.vote_average;
              case 'release_date.desc':
                return (
                  new Date(b.release_date || 0).getTime() -
                  new Date(a.release_date || 0).getTime()
                );
              case 'release_date.asc':
                return (
                  new Date(a.release_date || 0).getTime() -
                  new Date(b.release_date || 0).getTime()
                );
              case 'title.asc':
                return a.title.localeCompare(b.title);
              case 'title.desc':
                return b.title.localeCompare(a.title);
              default:
                return 0;
            }
          });

          response = {
            ...searchResponse.data,
            results: finalMovies,
            total_results: finalMovies.length,
            total_pages: Math.ceil(finalMovies.length / 20),
          };
          
          cache.set(cacheKey, response);
        }
      } else {
        // Si no hay búsqueda, usar el endpoint discover (más eficiente)
        // Build params for discover endpoint
        const params: any = {
          with_genres: genreId,
          page,
          sort_by: sortBy,
        };

        // Add year filter if specified
        if (year && year !== 'all') {
          const yearRange = year.split('-');
          if (yearRange.length === 2) {
            params['primary_release_date.gte'] = `${yearRange[0]}-01-01`;
            params['primary_release_date.lte'] = `${yearRange[1]}-12-31`;
          } else {
            params['primary_release_year'] = year;
          }
        }

        // Add rating filter if specified
        if (rating && rating !== 'all') {
          params['vote_average.gte'] = rating;
        }

        // Add duration filter if specified
        if (duration && duration !== 'all') {
          const durationMap: { [key: string]: { min: number; max: number } } = {
            'short': { min: 0, max: 90 },
            'medium': { min: 90, max: 120 },
            'long': { min: 120, max: 150 },
            'very-long': { min: 150, max: 999 },
          };
          const durationRange = durationMap[duration];
          if (durationRange) {
            params['with_runtime.gte'] = durationRange.min;
            params['with_runtime.lte'] = durationRange.max;
          }
        }

        // Usar caché para discover
        const cacheKey = cache.generateKey('discover/genre', { genreId, page, ...params });
        const cached = cache.get<MovieResponse>(cacheKey);
        
        if (cached) {
          response = cached;
        } else {
          const { data } = await api.get<MovieResponse>('/discover/movie', {
            params: {
              api_key: import.meta.env.VITE_TMDB_API_KEY,
              language: 'en-US',
              ...params,
            },
          });
          
          response = data;
          cache.set(cacheKey, response);
        }
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
        console.error('Error loading genre movies:', err);
        setError(err.message || 'Error loading movies');
        setMovies([]);
      }
    } finally {
      // Solo actualizar loading si el componente sigue montado y esta es la petición actual
      if (isMountedRef.current && currentRequestRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [genreId, searchQuery, sortBy, year, rating, duration, cache]);

  useEffect(() => {
    if (autoLoad && genreId) {
      loadMovies(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genreId, autoLoad]);

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

