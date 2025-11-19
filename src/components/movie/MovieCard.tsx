import React from 'react';
import { Movie } from '../../types/movie';
import { getImageUrl } from '../../services/tmdbApi';
import { StarIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface MovieCardProps {
  movie: Movie;
  onClick?: (movie: Movie) => void;
  index?: number;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick, index = 0 }) => {
  const handleClick = () => {
    onClick?.(movie);
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
      {movie.poster_path ? (
        <img
          src={getImageUrl(movie.poster_path, 'w500')}
          alt={movie.title}
          className="w-full aspect-[2/3] object-cover"
        />
      ) : (
        <div className="w-full aspect-[2/3] bg-beige-medium flex items-center justify-center">
          <span className="text-dark-light text-sm">No image</span>
        </div>
      )}

      {/* Movie Info */}
      <div className="p-4">
        <h3 className="font-semibold text-dark mb-2 line-clamp-2 min-h-[3rem]">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-sm text-dark-medium">
          <span className="flex items-center gap-1">
            <StarIcon className="w-4 h-4" />
            {formatRating(movie.vote_average)}
          </span>
          <span className="flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" />
            {formatYear(movie.release_date)}
          </span>
        </div>
      </div>
    </div>
  );
};

