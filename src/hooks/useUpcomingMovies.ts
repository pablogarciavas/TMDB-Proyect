import { useState, useEffect, useCallback } from 'react';
import { tmdbApi } from '../services/tmdbApi';
import { Movie, MovieResponse } from '../types/movie';

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
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalResults, setTotalResults] = useState<number>(0);

  const loadMovies = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      let allMovies: Movie[] = [];

      // Si hay búsqueda, usar el endpoint de búsqueda y filtrar por fecha
      if (filters.searchQuery?.trim()) {
        const searchResponse = await tmdbApi.searchMovies(filters.searchQuery, page);
        
        // Filtrar solo películas con fecha de lanzamiento futura
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcomingMovies = searchResponse.results.filter((movie) => {
          if (!movie.release_date) return false;
          const releaseDate = new Date(movie.release_date);
          releaseDate.setHours(0, 0, 0, 0);
          return releaseDate >= today;
        });

        allMovies = upcomingMovies;
      } else {
        // Cargar TODAS las páginas de upcoming movies
        let currentPage = 1;
        let hasMorePages = true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        while (hasMorePages) {
          const response = await tmdbApi.getUpcomingMovies(currentPage);
          
          // Filtrar solo películas con fecha de lanzamiento futura (por si acaso)
          const upcomingMovies = response.results.filter((movie) => {
            if (!movie.release_date) return false;
            const releaseDate = new Date(movie.release_date);
            releaseDate.setHours(0, 0, 0, 0);
            return releaseDate >= today;
          });

          allMovies = [...allMovies, ...upcomingMovies];

          // Continuar cargando si hay más páginas
          if (currentPage >= response.total_pages || response.results.length === 0) {
            hasMorePages = false;
          } else {
            currentPage++;
            // Pequeño delay para no sobrecargar la API
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        // Eliminar duplicados basándose en el ID de la película
        const uniqueMoviesMap = new Map<number, Movie>();
        allMovies.forEach((movie) => {
          if (!uniqueMoviesMap.has(movie.id)) {
            uniqueMoviesMap.set(movie.id, movie);
          }
        });
        allMovies = Array.from(uniqueMoviesMap.values());
      }

      // Aplicar filtros adicionales sobre todas las películas
      let filteredMovies = allMovies;

      // Filtrar por género
      if (filters.genre && filters.genre !== 'all') {
        const genreId = parseInt(filters.genre);
        filteredMovies = filteredMovies.filter((movie) =>
          movie.genre_ids?.includes(genreId)
        );
      }

      // Ordenar
      if (filters.sortBy) {
        filteredMovies.sort((a, b) => {
          switch (filters.sortBy) {
            case 'release_date.asc':
              return (
                new Date(a.release_date || 0).getTime() -
                new Date(b.release_date || 0).getTime()
              );
            case 'release_date.desc':
              return (
                new Date(b.release_date || 0).getTime() -
                new Date(a.release_date || 0).getTime()
              );
            case 'title.asc':
              return a.title.localeCompare(b.title);
            case 'title.desc':
              return b.title.localeCompare(a.title);
            default:
              return 0;
          }
        });
      }

      // Paginación client-side
      const moviesPerPage = 20;
      const startIndex = (page - 1) * moviesPerPage;
      const endIndex = startIndex + moviesPerPage;
      const paginatedMovies = filteredMovies.slice(startIndex, endIndex);

      setMovies(paginatedMovies);
      setCurrentPage(page);
      setTotalPages(Math.ceil(filteredMovies.length / moviesPerPage) || 1);
      setTotalResults(filteredMovies.length);
    } catch (err: any) {
      console.error('Error loading upcoming movies:', err);
      setError(err.message || 'Error loading upcoming movies');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (autoLoad) {
      loadMovies(1);
    }
  }, [loadMovies, autoLoad]);

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

