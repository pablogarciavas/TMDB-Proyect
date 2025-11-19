import React from 'react';
import { Movie } from '../../types/movie';
import { MovieCard } from './MovieCard';

interface MovieGridProps {
  movies: Movie[];
  onMovieClick?: (movie: Movie) => void;
  loading?: boolean;
}

export const MovieGrid: React.FC<MovieGridProps> = ({ movies, onMovieClick, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {[...Array(10)].map((_, index) => (
          <div
            key={index}
            className="bg-beige-light rounded-xl overflow-hidden border border-beige-medium/50 animate-pulse"
          >
            <div className="w-full aspect-[2/3] bg-beige-medium"></div>
            <div className="p-4 space-y-2">
              <div className="h-4 bg-beige-medium rounded w-3/4"></div>
              <div className="h-3 bg-beige-medium rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-dark-medium text-lg">No movies found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {movies.map((movie, index) => (
        <MovieCard key={movie.id} movie={movie} onClick={onMovieClick} index={index} />
      ))}
    </div>
  );
};

