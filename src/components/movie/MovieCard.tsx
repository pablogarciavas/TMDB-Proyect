import React from 'react';
import { Movie } from '../../types/movie';
import { useWatchlist } from '../../hooks/useWatchlist';
import { getImageUrl } from '../../services/tmdbApi';
import { StarIcon, CalendarIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';

interface MovieCardProps {
  movie: Movie;
  onClick?: (movie: Movie) => void;
  index?: number;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick, index = 0 }) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  
  const handleClick = () => {
    onClick?.(movie);
  };

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir que se active el onClick del card
    if (isInWatchlist(movie.id)) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  const formatYear = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).getFullYear();
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  // Calculate animation delay based on index (stagger effect)
  const animationDelay = index * 0.05; // 50ms between each card

  return (
    <div
      onClick={handleClick}
      className="bg-beige-light rounded-xl overflow-hidden border border-beige-medium/50 
                 transition-all duration-200 cursor-pointer
                 hover:shadow-minimal hover:border-dark/10 hover:scale-[1.02]
                 opacity-0 animate-fadeInUp"
      style={{
        animationDelay: `${animationDelay}s`,
        animationFillMode: 'forwards',
      }}
    >
      {/* Poster */}
      <div className="relative">
        {movie.poster_path ? (
          <img
            src={getImageUrl(movie.poster_path, 'w500')}
            alt={movie.title}
            className="w-full aspect-[2/3] object-cover"
            loading="lazy"
            decoding="async"
            width="500"
            height="750"
          />
        ) : (
          <div className="w-full aspect-[2/3] bg-beige-medium flex items-center justify-center">
            <span className="text-dark-light text-sm">No image</span>
          </div>
        )}
        {/* Watchlist Button */}
        <button
          onClick={handleWatchlistClick}
          className={`absolute top-1.5 right-1.5 md:top-2 md:right-2 p-1.5 md:p-2 rounded-full backdrop-blur-sm transition-all ${
            isInWatchlist(movie.id)
              ? 'bg-dark/90 text-beige-light'
              : 'bg-dark/60 text-beige-light hover:bg-dark/80'
          }`}
          title={isInWatchlist(movie.id) ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {isInWatchlist(movie.id) ? (
            <BookmarkIconSolid className="w-4 h-4 md:w-5 md:h-5" />
          ) : (
            <BookmarkIcon className="w-4 h-4 md:w-5 md:h-5" />
          )}
        </button>
      </div>

      {/* Movie Info */}
      <div className="p-3 md:p-4">
        <h3 className="font-semibold text-dark mb-1.5 md:mb-2 line-clamp-2 min-h-[2.5rem] md:min-h-[3rem] text-sm md:text-base">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-xs md:text-sm text-dark-medium">
          <span className="flex items-center gap-0.5 md:gap-1">
            <StarIcon className="w-3 h-3 md:w-4 md:h-4" />
            {formatRating(movie.vote_average)}
          </span>
          <span className="flex items-center gap-0.5 md:gap-1">
            <CalendarIcon className="w-3 h-3 md:w-4 md:h-4" />
            {formatYear(movie.release_date)}
          </span>
        </div>
      </div>
    </div>
  );
};

