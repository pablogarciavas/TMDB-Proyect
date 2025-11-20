import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { WatchlistMovie } from '../../contexts/WatchlistContext';
import { tmdbApi } from '../../services/tmdbApi';
import { Genre } from '../../types/genre';
import { Select, SelectOption } from '../ui/Select';

export interface WatchlistFiltersState {
  searchQuery: string;
  sortBy: string;
  genre: string;
  year: string;
  rating: string;
}

interface WatchlistFiltersProps {
  filters: WatchlistFiltersState;
  onFiltersChange: (filters: WatchlistFiltersState) => void;
  watchlist: WatchlistMovie[];
  totalResults?: number;
}

export const WatchlistFilters: React.FC<WatchlistFiltersProps> = ({
  filters,
  onFiltersChange,
  watchlist,
  totalResults,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);

  // Cargar géneros desde la API
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const response = await tmdbApi.getGenres();
        setGenres(response.genres);
      } catch (error) {
        console.error('Error loading genres:', error);
      }
    };
    loadGenres();
  }, []);

  const handleFilterChange = (key: keyof WatchlistFiltersState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      sortBy: 'addedAt.desc',
      genre: 'all',
      year: 'all',
      rating: 'all',
    });
  };

  const hasActiveFilters = 
    filters.searchQuery !== '' ||
    filters.sortBy !== 'addedAt.desc' ||
    filters.genre !== 'all' ||
    filters.year !== 'all' ||
    filters.rating !== 'all';

  // Obtener géneros únicos de las películas en la watchlist con sus nombres
  const availableGenres = React.useMemo(() => {
    const genreSet = new Set<number>();
    watchlist.forEach((movie) => {
      if (movie.genre_ids) {
        movie.genre_ids.forEach((id) => genreSet.add(id));
      }
    });
    const genreIds = Array.from(genreSet);
    // Mapear IDs a objetos Genre con nombres
    return genreIds
      .map((id) => genres.find((g) => g.id === id))
      .filter((g): g is Genre => g !== undefined)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [watchlist, genres]);

  // Generar rangos de años por décadas
  const currentYear = new Date().getFullYear();
  const yearRanges: { value: string; label: string }[] = [
    { value: 'all', label: 'All Years' },
  ];

  // Obtener años únicos de las películas en la watchlist
  const availableYears = React.useMemo(() => {
    const years = new Set<number>();
    watchlist.forEach((movie) => {
      if (movie.release_date) {
        const year = new Date(movie.release_date).getFullYear();
        if (year > 0) {
          years.add(year);
        }
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [watchlist]);

  // Crear rangos por décadas basados en los años disponibles
  const minYear = availableYears.length > 0 ? Math.min(...availableYears) : 1900;
  const maxYear = availableYears.length > 0 ? Math.max(...availableYears) : currentYear;
  
  for (let start = Math.floor(minYear / 10) * 10; start <= maxYear; start += 10) {
    const end = Math.min(start + 9, maxYear);
    if (start === end) {
      yearRanges.push({ value: start.toString(), label: start.toString() });
    } else {
      yearRanges.push({ value: `${start}-${end}`, label: `${start}-${end}` });
    }
  }

  return (
    <div className="mb-8 space-y-4 relative z-50">
      {/* Barra de búsqueda */}
      <div className="relative">
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
          placeholder="Search movies in your watchlist..."
          className="input pr-12 w-full"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <MagnifyingGlassIcon className="w-5 h-5 text-dark-light" />
        </div>
      </div>

      {/* Botón para expandir/colapsar filtros */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 bg-beige-medium text-dark rounded-xl hover:bg-beige transition-colors"
        >
          <FunnelIcon className="w-5 h-5" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 bg-dark text-beige-light text-xs rounded-full">
              Active
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 text-dark-medium hover:text-dark transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* Panel de filtros expandible */}
      {isExpanded && (
        <div className="bg-beige-light border border-beige-medium rounded-2xl p-6 space-y-6 animate-fadeIn">
          {/* Ordenar por */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Sort By
            </label>
            <Select
              value={filters.sortBy}
              onChange={(value) => handleFilterChange('sortBy', value)}
              options={[
                { value: 'addedAt.desc', label: 'Date Added (Newest)' },
                { value: 'addedAt.asc', label: 'Date Added (Oldest)' },
                { value: 'popularity.desc', label: 'Popularity (High to Low)' },
                { value: 'popularity.asc', label: 'Popularity (Low to High)' },
                { value: 'vote_average.desc', label: 'Rating (High to Low)' },
                { value: 'vote_average.asc', label: 'Rating (Low to High)' },
                { value: 'release_date.desc', label: 'Release Date (Newest)' },
                { value: 'release_date.asc', label: 'Release Date (Oldest)' },
                { value: 'title.asc', label: 'Title (A-Z)' },
                { value: 'title.desc', label: 'Title (Z-A)' },
              ]}
              className="w-full"
            />
          </div>

          {/* Género */}
          {availableGenres.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Genre
              </label>
              <Select
                value={filters.genre}
                onChange={(value) => handleFilterChange('genre', value)}
                options={[
                  { value: 'all', label: 'All Genres' },
                  ...availableGenres.map((genre) => ({
                    value: genre.id.toString(),
                    label: genre.name,
                  })),
                ]}
                className="w-full"
              />
            </div>
          )}

          {/* Año de lanzamiento */}
          {yearRanges.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Release Year
              </label>
              <Select
                value={filters.year}
                onChange={(value) => handleFilterChange('year', value)}
                options={yearRanges.map((range) => ({
                  value: range.value,
                  label: range.label,
                }))}
                className="w-full"
              />
            </div>
          )}

          {/* Valoración mínima */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Minimum Rating: {filters.rating === 'all' ? 'Any' : `${filters.rating}+`}
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={filters.rating === 'all' ? 0 : parseFloat(filters.rating)}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('rating', value === '0' ? 'all' : value);
                }}
                className="w-full h-2 bg-beige-medium rounded-lg appearance-none cursor-pointer accent-dark"
              />
              <div className="flex justify-between text-xs text-dark-medium">
                <span>Any</span>
                <span>10</span>
              </div>
            </div>
            <Select
              value={filters.rating}
              onChange={(value) => handleFilterChange('rating', value)}
              options={[
                { value: 'all', label: 'Any Rating' },
                { value: '7', label: '7+' },
                { value: '7.5', label: '7.5+' },
                { value: '8', label: '8+' },
                { value: '8.5', label: '8.5+' },
                { value: '9', label: '9+' },
              ]}
              className="w-full mt-2"
            />
          </div>
        </div>
      )}

      {/* Contador de resultados */}
      {totalResults !== undefined && totalResults > 0 && (
        <p className="text-sm text-dark-medium">
          {totalResults.toLocaleString()} {totalResults === 1 ? 'movie' : 'movies'} found
        </p>
      )}
    </div>
  );
};

