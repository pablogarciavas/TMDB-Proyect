import React, { useState, useMemo } from 'react';
import { useWatchlist } from '../../hooks/useWatchlist';
import { Movie } from '../../types/movie';
import { MovieGrid } from './MovieGrid';
import { Loading } from '../ui/Loading';
import { TrashIcon } from '@heroicons/react/24/outline';
import { WatchlistFilters, WatchlistFiltersState } from './WatchlistFilters';

interface WatchlistPageProps {
  onMovieClick?: (movie: Movie) => void;
}

export const WatchlistPage: React.FC<WatchlistPageProps> = ({
  onMovieClick,
}) => {
  const { watchlist, clearWatchlist } = useWatchlist();
  const [filters, setFilters] = useState<WatchlistFiltersState>({
    searchQuery: '',
    sortBy: 'addedAt.desc',
    genre: 'all',
    year: 'all',
    rating: 'all',
  });

  // Filtrar y ordenar películas
  const filteredMovies = useMemo(() => {
    let filtered = [...watchlist];

    // Búsqueda por título
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter((movie) =>
        movie.title.toLowerCase().includes(query)
      );
    }

    // Filtrar por género
    if (filters.genre !== 'all') {
      const genreId = parseInt(filters.genre);
      filtered = filtered.filter((movie) =>
        movie.genre_ids?.includes(genreId)
      );
    }

    // Filtrar por año
    if (filters.year !== 'all') {
      if (filters.year.includes('-')) {
        const [start, end] = filters.year.split('-').map(Number);
        filtered = filtered.filter((movie) => {
          if (!movie.release_date) return false;
          const year = new Date(movie.release_date).getFullYear();
          return year >= start && year <= end;
        });
      } else {
        const year = parseInt(filters.year);
        filtered = filtered.filter((movie) => {
          if (!movie.release_date) return false;
          return new Date(movie.release_date).getFullYear() === year;
        });
      }
    }

    // Filtrar por rating
    if (filters.rating !== 'all') {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter((movie) => movie.vote_average >= minRating);
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'addedAt.desc':
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case 'addedAt.asc':
          return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
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

    return filtered;
  }, [watchlist, filters]);

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

      {/* Filters */}
      {watchlist.length > 0 && (
        <WatchlistFilters
          filters={filters}
          onFiltersChange={setFilters}
          watchlist={watchlist}
          totalResults={filteredMovies.length}
        />
      )}

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
      ) : filteredMovies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-dark-medium text-lg mb-4">
            No movies match your filters
          </p>
          <p className="text-dark-light">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <MovieGrid movies={filteredMovies} onMovieClick={onMovieClick} />
      )}
    </div>
  );
};

