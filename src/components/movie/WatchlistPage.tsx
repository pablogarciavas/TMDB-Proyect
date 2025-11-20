import React from 'react';
import { useWatchlist } from '../../hooks/useWatchlist';
import { Movie } from '../../types/movie';
import { MovieGrid } from './MovieGrid';
import { Loading } from '../ui/Loading';
import { TrashIcon } from '@heroicons/react/24/outline';

interface WatchlistPageProps {
  onMovieClick?: (movie: Movie) => void;
}

export const WatchlistPage: React.FC<WatchlistPageProps> = ({
  onMovieClick,
}) => {
  const { watchlist, clearWatchlist } = useWatchlist();

  return (
    <div className="w-full py-8 relative z-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-dark mb-2">
              Watchlist
            </h1>
            {watchlist.length > 0 && (
              <p className="text-dark-medium">
                {watchlist.length} {watchlist.length === 1 ? 'movie' : 'movies'} in your watchlist
              </p>
            )}
          </div>
          {watchlist.length > 0 && (
            <button
              onClick={clearWatchlist}
              className="flex items-center gap-2 px-4 py-2 bg-beige-medium text-dark rounded-xl hover:bg-beige transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
              <span>Clear all</span>
            </button>
          )}
        </div>
      </div>

      {/* Watchlist Content */}
      {watchlist.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-dark-medium text-lg mb-4">
            Your watchlist is empty
          </p>
          <p className="text-dark-light">
            Add movies to your watchlist by clicking the watchlist button on any movie
          </p>
        </div>
      ) : (
        <MovieGrid movies={watchlist} onMovieClick={onMovieClick} />
      )}
    </div>
  );
};

