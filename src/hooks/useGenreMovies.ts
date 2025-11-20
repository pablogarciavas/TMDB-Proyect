import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { MovieResponse } from '../types/movie';
import { TMDB_CONFIG } from '../utils/constants';

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
      const api = axios.create({
        baseURL: TMDB_CONFIG.BASE_URL,
      });

      let response: MovieResponse;

      // Si hay búsqueda, usar el endpoint de búsqueda y filtrar por género
      if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
        // Primero buscar películas
        const searchResponse = await api.get<MovieResponse>('/search/movie', {
          params: {
            api_key: import.meta.env.VITE_TMDB_API_KEY,
            language: 'en-US',
            query: filters.searchQuery,
            page,
          },
        });

        // La respuesta de búsqueda incluye genre_ids, pero necesitamos obtenerlos
        // Hacemos requests en paralelo solo para las películas que necesitamos
        const moviesWithGenres = await Promise.all(
          searchResponse.data.results.map(async (movie) => {
            // Si ya tiene genre_ids en la respuesta, usarlo
            if ((movie as any).genre_ids && Array.isArray((movie as any).genre_ids)) {
              return movie;
            }
            // Si no, obtener los detalles (esto es menos común)
            try {
              const detailsResponse = await api.get(`/movie/${movie.id}`, {
                params: {
                  api_key: import.meta.env.VITE_TMDB_API_KEY,
                  language: 'en-US',
                },
              });
              return {
                ...movie,
                genre_ids: (detailsResponse.data as any).genre_ids || [],
              };
            } catch {
              return { ...movie, genre_ids: [] };
            }
          })
        );

        // Filtrar por género
        const filteredMovies = moviesWithGenres.filter((movie) =>
          (movie as any).genre_ids?.includes(genreId)
        );

        // Aplicar otros filtros en el cliente
        let finalMovies = filteredMovies;

        // Filtrar por año
        if (filters?.year && filters.year !== 'all') {
          const yearRange = filters.year.split('-');
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
            const year = parseInt(filters.year);
            finalMovies = finalMovies.filter((movie) => {
              const movieYear = movie.release_date
                ? new Date(movie.release_date).getFullYear()
                : 0;
              return movieYear === year;
            });
          }
        }

        // Filtrar por rating
        if (filters?.rating && filters.rating !== 'all') {
          const minRating = parseFloat(filters.rating);
          finalMovies = finalMovies.filter(
            (movie) => movie.vote_average >= minRating
          );
        }

        // Ordenar
        const sortBy = filters?.sortBy || 'popularity.desc';
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
      } else {
        // Si no hay búsqueda, usar el endpoint discover como antes
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

        const { data } = await api.get<MovieResponse>('/discover/movie', {
          params: {
            api_key: import.meta.env.VITE_TMDB_API_KEY,
            language: 'en-US',
            ...params,
          },
        });
        
        response = data;
      }
      
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

