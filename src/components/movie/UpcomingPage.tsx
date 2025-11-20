import React, { useState, useEffect } from 'react';
import { useUpcomingMovies } from '../../hooks/useUpcomingMovies';
import { MovieGrid } from './MovieGrid';
import { Movie } from '../../types/movie';
import { Loading } from '../ui/Loading';
import { ErrorMessage } from '../ui/ErrorMessage';
import { UpcomingFilters, UpcomingFiltersState } from './UpcomingFilters';

interface UpcomingPageProps {
  onMovieClick?: (movie: Movie) => void;
}

export const UpcomingPage: React.FC<UpcomingPageProps> = ({
  onMovieClick,
}) => {
  const [filters, setFilters] = useState<UpcomingFiltersState>({
    searchQuery: '',
    sortBy: 'release_date.asc',
    genre: 'all',
  });

  const { movies, loading, error, currentPage, totalPages, totalResults, loadMovies } = useUpcomingMovies({
    filters: {
      searchQuery: filters.searchQuery,
      sortBy: filters.sortBy,
      genre: filters.genre,
    },
    autoLoad: false, // Controlamos la carga manualmente
  });

  // Recargar cuando cambien los filtros (con debounce para la búsqueda)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadMovies(1);
    }, filters.searchQuery ? 500 : 0); // Debounce de 500ms para búsqueda

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return (
    <div className="w-full py-8 relative z-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2">
          Upcoming Movies
        </h1>
        <p className="text-dark-medium">
          Discover movies that are coming soon
        </p>
      </div>

      {/* Filters */}
      <UpcomingFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalResults={totalResults}
      />

      {/* Loading State */}
      {loading && movies.length === 0 && (
        <div className="flex justify-center py-12">
          <Loading />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-8">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Movies Grid */}
      {!loading && movies.length > 0 && (
        <MovieGrid movies={movies} onMovieClick={onMovieClick} />
      )}

      {/* Empty State */}
      {!loading && !error && movies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-dark-medium text-lg mb-4">
            No upcoming movies found
          </p>
          <p className="text-dark-light">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => loadMovies(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-beige-medium text-dark rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-beige transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-dark-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => loadMovies(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-beige-medium text-dark rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-beige transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

