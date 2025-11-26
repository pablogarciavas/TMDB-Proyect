import { useState, useEffect, useCallback, useRef } from 'react';
import { tmdbApi } from '../services/tmdbApi';
import { Movie, MovieResponse } from '../types/movie';
import { useApiCache } from './useApiCache';

export interface UpcomingMoviesFilters {
  searchQuery?: string;
  sortBy?: string;
  genre?: string;
}

interface UseUpcomingMoviesOptions {
  filters?: UpcomingMoviesFilters;
  autoLoad?: boolean;
}

export const useUpcomingMovies = (options: UseUpcomingMoviesOptions = {}) => {
  const { filters = {}, autoLoad = true } = options;
  const cache = useApiCache();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalResults, setTotalResults] = useState<number>(0);
  const isMountedRef = useRef(true);
  const currentRequestRef = useRef<string>('');

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Memoizar valores de filtros para evitar re-renders innecesarios
  const searchQuery = filters.searchQuery?.trim() || '';
  const sortBy = filters.sortBy || 'release_date.asc';
  const genre = filters.genre || 'all';

  const loadMovies = useCallback(async (page: number = 1) => {
    // Crear un identificador único para esta petición
    const requestId = `${searchQuery}-${sortBy}-${genre}-${page}`;
    currentRequestRef.current = requestId;

    if (isMountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      let response: MovieResponse;
      let allMovies: Movie[] = [];

      // Si hay búsqueda, usar el endpoint de búsqueda
      if (searchQuery) {
        const cacheKey = cache.generateKey('search/upcoming', { query: searchQuery, page });
        const cached = cache.get<MovieResponse>(cacheKey);
        
        if (cached) {
          response = cached;
        } else {
          response = await tmdbApi.searchMovies(searchQuery, page);
          cache.set(cacheKey, response);
        }
        
        // Filtrar solo películas con fecha de lanzamiento futura
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        allMovies = response.results.filter((movie) => {
          if (!movie.release_date) return false;
          const releaseDate = new Date(movie.release_date);
          releaseDate.setHours(0, 0, 0, 0);
          return releaseDate >= today;
        });
      } else {
        // SOLO cargar la página solicitada - usar paginación del servidor
        // El endpoint /movie/upcoming ya devuelve solo películas futuras, no necesitamos filtrar
        const cacheKey = cache.generateKey('upcoming', { page, genre });
        const cached = cache.get<MovieResponse>(cacheKey);
        
        if (cached) {
          response = cached;
        } else {
          // Si hay filtro de género, usar discover endpoint en lugar de upcoming
          if (genre !== 'all') {
            const genreId = parseInt(genre);
            // Mapear sortBy a los valores que acepta el endpoint discover
            let discoverSortBy = 'popularity.desc';
            if (sortBy === 'release_date.asc') {
              discoverSortBy = 'release_date.asc';
            } else if (sortBy === 'release_date.desc') {
              discoverSortBy = 'release_date.desc';
            }
            
            response = await tmdbApi.getMoviesByGenre(genreId, page, {
              'primary_release_date.gte': new Date().toISOString().split('T')[0], // Solo fechas futuras
              sort_by: discoverSortBy,
            });
          } else {
            response = await tmdbApi.getUpcomingMovies(page);
          }
          cache.set(cacheKey, response);
        }
        
        // El endpoint upcoming ya devuelve películas futuras, no necesitamos filtrar
        allMovies = response.results;
      }

      // Aplicar filtros adicionales sobre las películas de la página actual
      let filteredMovies = allMovies;

      // Si usamos búsqueda, aplicar filtro de fecha futura y género
      if (searchQuery) {
        // Filtrar por género si está aplicado
        if (genre !== 'all') {
          const genreId = parseInt(genre);
          filteredMovies = filteredMovies.filter((movie) =>
            movie.genre_ids?.includes(genreId)
          );
        }
      } else {
        // Si no es búsqueda y no hay filtro de género, el endpoint upcoming ya viene ordenado
        // Solo necesitamos ordenar por título si se solicita (el endpoint no soporta ordenar por título)
        if (sortBy && genre === 'all' && (sortBy === 'title.asc' || sortBy === 'title.desc')) {
          filteredMovies.sort((a, b) => {
            if (sortBy === 'title.asc') {
              return a.title.localeCompare(b.title);
            } else {
              return b.title.localeCompare(a.title);
            }
          });
        }
        // Si hay filtro de género, el ordenamiento ya se aplicó en el endpoint discover
      }

      // Verificar que el componente sigue montado y esta es la petición actual
      if (isMountedRef.current && currentRequestRef.current === requestId) {
        setMovies(filteredMovies);
        setCurrentPage(page);
        // Usar total_pages y total_results de la respuesta de la API
        setTotalPages(response.total_pages);
        setTotalResults(response.total_results);
      }
    } catch (err: any) {
      // Solo actualizar error si el componente sigue montado y esta es la petición actual
      if (isMountedRef.current && currentRequestRef.current === requestId) {
        console.error('Error loading upcoming movies:', err);
        setError(err.message || 'Error loading upcoming movies');
        setMovies([]);
      }
    } finally {
      // Solo actualizar loading si el componente sigue montado y esta es la petición actual
      if (isMountedRef.current && currentRequestRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [searchQuery, sortBy, genre, cache]);

  useEffect(() => {
    if (autoLoad) {
      loadMovies(1);
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
  };
};

