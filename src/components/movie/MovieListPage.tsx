import React from 'react';
import { useGenreMovies } from '../../hooks/useGenreMovies';
import { MovieGrid } from './MovieGrid';
import { Movie } from '../../types/movie';
import { Loading } from '../ui/Loading';
import { ErrorMessage } from '../ui/ErrorMessage';

interface MovieListPageProps {
  genreId: number;
  genreName: string;
  onMovieClick?: (movie: Movie) => void;
}

export const MovieListPage: React.FC<MovieListPageProps> = ({
  genreId,
  genreName,
  onMovieClick,
}) => {
  const { movies, loading, error, currentPage, totalPages, totalResults, loadMovies } = useGenreMovies({
    genreId,
    autoLoad: true,
  });

  return (
    <div className="w-full py-8 relative z-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2">
          {genreName} Movies
        </h1>
        {!loading && totalResults > 0 && (
          <p className="text-dark-medium">
            {totalResults.toLocaleString()} movies found
          </p>
        )}
      </div>

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

