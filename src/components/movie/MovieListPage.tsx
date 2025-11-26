import React, { useState, useEffect } from 'react';
import { useGenreMovies } from '../../hooks/useGenreMovies';
import { MovieGrid } from './MovieGrid';
import { Movie } from '../../types/movie';
import { Person } from '../../types/person';
import { Company } from '../../types/company';
import { Loading } from '../ui/Loading';
import { ErrorMessage } from '../ui/ErrorMessage';
import { GenreFilters, GenreFiltersState } from './GenreFilters';

interface MovieListPageProps {
  genreId: number;
  genreName: string;
  onMovieClick?: (movie: Movie) => void;
  onPersonSelect?: (person: Person) => void;
  onCompanySelect?: (company: Company) => void;
}

export const MovieListPage: React.FC<MovieListPageProps> = ({
  genreId,
  genreName,
  onMovieClick,
  onPersonSelect,
  onCompanySelect,
}) => {
  const [filters, setFilters] = useState<GenreFiltersState>({
    searchQuery: '',
    sortBy: 'popularity.desc',
    year: 'all',
    rating: 'all',
    duration: 'all',
  });

  const { movies, loading, error, currentPage, totalPages, totalResults, loadMovies } = useGenreMovies({
    genreId,
    filters: {
      searchQuery: filters.searchQuery,
      sortBy: filters.sortBy,
      year: filters.year,
      rating: filters.rating,
      duration: filters.duration,
    },
    autoLoad: false, // Controlamos la carga manualmente
  });

  // Recargar cuando cambien los filtros o el género (con debounce para la búsqueda)
  useEffect(() => {
    if (!genreId) return;
    
    const timeoutId = setTimeout(() => {
      loadMovies(1);
    }, filters.searchQuery ? 500 : 0); // Debounce de 500ms para búsqueda

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.searchQuery, filters.sortBy, filters.year, filters.rating, filters.duration, genreId]);

  return (
    <div className="w-full py-8 relative z-10">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-dark mb-2">
          {genreName} Movies
        </h1>
      </div>

      {/* Filters */}
      <GenreFilters
        genreId={genreId}
        filters={filters}
        onFiltersChange={setFilters}
        totalResults={totalResults}
        onPersonSelect={onPersonSelect}
        onCompanySelect={onCompanySelect}
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

      {/* Pagination - Basic for now */}
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

