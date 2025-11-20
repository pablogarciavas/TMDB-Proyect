import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { tmdbApi } from '../../services/tmdbApi';
import { Genre } from '../../types/genre';
import { Select } from '../ui/Select';

export interface UpcomingFiltersState {
  searchQuery: string;
  sortBy: string;
  genre: string;
}

interface UpcomingFiltersProps {
  filters: UpcomingFiltersState;
  onFiltersChange: (filters: UpcomingFiltersState) => void;
  totalResults?: number;
}

export const UpcomingFilters: React.FC<UpcomingFiltersProps> = ({
  filters,
  onFiltersChange,
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

  const handleFilterChange = (key: keyof UpcomingFiltersState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      sortBy: 'release_date.asc',
      genre: 'all',
    });
  };

  const hasActiveFilters = 
    filters.searchQuery !== '' ||
    filters.sortBy !== 'release_date.asc' ||
    filters.genre !== 'all';


  return (
    <div className="mb-8 space-y-4 relative z-50">
      {/* Barra de búsqueda */}
      <div className="relative">
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
          placeholder="Search upcoming movies..."
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
                { value: 'release_date.asc', label: 'Release Date (Soonest)' },
                { value: 'release_date.desc', label: 'Release Date (Latest)' },
                { value: 'title.asc', label: 'Title (A-Z)' },
                { value: 'title.desc', label: 'Title (Z-A)' },
              ]}
              className="w-full"
            />
          </div>

          {/* Género */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Genre
            </label>
            <Select
              value={filters.genre}
              onChange={(value) => handleFilterChange('genre', value)}
              options={[
                { value: 'all', label: 'All Genres' },
                ...genres.map((genre) => ({
                  value: genre.id.toString(),
                  label: genre.name,
                })),
              ]}
              className="w-full"
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

