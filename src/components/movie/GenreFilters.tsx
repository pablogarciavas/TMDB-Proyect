import React, { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { useGenreSearch } from '../../hooks/useGenreSearch';
import { getImageUrl } from '../../services/tmdbApi';
import { Movie } from '../../types/movie';
import { Person } from '../../types/person';
import { Company } from '../../types/company';

export interface GenreFiltersState {
  searchQuery: string;
  sortBy: string;
  year: string;
  rating: string;
  duration: string;
}

interface GenreFiltersProps {
  genreId: number;
  filters: GenreFiltersState;
  onFiltersChange: (filters: GenreFiltersState) => void;
  totalResults?: number;
  onPersonSelect?: (person: Person) => void;
  onCompanySelect?: (company: Company) => void;
}

export const GenreFilters: React.FC<GenreFiltersProps> = ({
  genreId,
  filters,
  onFiltersChange,
  totalResults,
  onPersonSelect,
  onCompanySelect,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Buscar personas y estudios cuando hay búsqueda
  const { results: searchResults, loading: searchLoading } = useGenreSearch({
    genreId,
    query: filters.searchQuery,
  });

  // Mostrar sugerencias cuando hay resultados de personas/estudios
  React.useEffect(() => {
    const hasPeopleOrCompanies = searchResults.some(
      r => r.type === 'person' || r.type === 'company'
    );
    setShowSuggestions(filters.searchQuery.trim() !== '' && hasPeopleOrCompanies);
  }, [filters.searchQuery, searchResults]);

  const handleFilterChange = (key: keyof GenreFiltersState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      sortBy: 'popularity.desc',
      year: 'all',
      rating: 'all',
      duration: 'all',
    });
  };

  const hasActiveFilters = 
    filters.searchQuery !== '' ||
    filters.sortBy !== 'popularity.desc' ||
    filters.year !== 'all' ||
    filters.rating !== 'all' ||
    filters.duration !== 'all';

  // Generar rangos de años por décadas (10 años) desde 1900 hasta el año actual
  const currentYear = new Date().getFullYear();
  const yearRanges: { value: string; label: string }[] = [
    { value: 'all', label: 'All Years' },
  ];

  // Crear rangos por décadas (10 años) desde 1900
  for (let start = 1900; start <= currentYear; start += 10) {
    const end = Math.min(start + 9, currentYear);
    if (start === end) {
      yearRanges.push({ value: start.toString(), label: start.toString() });
    } else {
      yearRanges.push({ value: `${start}-${end}`, label: `${start}-${end}` });
    }
  }

  const groupedResults = {
    people: searchResults.filter(r => r.type === 'person'),
    companies: searchResults.filter(r => r.type === 'company'),
  };

  const handleResultClick = (result: any) => {
    setShowSuggestions(false);
    handleFilterChange('searchQuery', ''); // Limpiar búsqueda
    
    if (result.type === 'person' && onPersonSelect) {
      onPersonSelect(result.data as Person);
    } else if (result.type === 'company' && onCompanySelect) {
      onCompanySelect(result.data as Company);
    }
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Barra de búsqueda de películas, actores, directores y estudios */}
      <div className="relative">
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
          placeholder="Search movies, actors, directors, studios..."
          className="input pr-12 w-full"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {searchLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-dark border-t-transparent"></div>
          ) : (
            <MagnifyingGlassIcon className="w-5 h-5 text-dark-light" />
          )}
        </div>
      </div>

      {/* Sugerencias de personas y estudios (no dropdown flotante) */}
      {showSuggestions && (groupedResults.people.length > 0 || groupedResults.companies.length > 0) && (
        <div className="space-y-2">
          {/* Personas */}
          {groupedResults.people.length > 0 && (
            <div className="bg-beige-light border border-beige-medium rounded-xl p-3">
              <div className="text-xs font-semibold text-dark-medium uppercase tracking-wide mb-2">
                People
              </div>
              <div className="flex flex-wrap gap-2">
                {groupedResults.people.map((result) => (
                  <button
                    key={`person-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="flex items-center gap-2 px-3 py-2 bg-beige text-dark rounded-lg hover:bg-beige-medium transition-colors text-sm"
                  >
                    {result.image ? (
                      <img
                        src={getImageUrl(result.image, 'w185')}
                        alt={result.title}
                        className="w-8 h-8 object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-beige-medium rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-dark-light" />
                      </div>
                    )}
                    <span className="font-medium">{result.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Estudios */}
          {groupedResults.companies.length > 0 && (
            <div className="bg-beige-light border border-beige-medium rounded-xl p-3">
              <div className="text-xs font-semibold text-dark-medium uppercase tracking-wide mb-2">
                Studios
              </div>
              <div className="flex flex-wrap gap-2">
                {groupedResults.companies.map((result) => (
                  <button
                    key={`company-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="flex items-center gap-2 px-3 py-2 bg-beige text-dark rounded-lg hover:bg-beige-medium transition-colors text-sm"
                  >
                    {result.image ? (
                      <img
                        src={getImageUrl(result.image, 'w185')}
                        alt={result.title}
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-beige-medium rounded flex items-center justify-center">
                        <BuildingOfficeIcon className="w-4 h-4 text-dark-light" />
                      </div>
                    )}
                    <span className="font-medium">{result.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="input w-full"
            >
              <option value="popularity.desc">Popularity (High to Low)</option>
              <option value="popularity.asc">Popularity (Low to High)</option>
              <option value="vote_average.desc">Rating (High to Low)</option>
              <option value="vote_average.asc">Rating (Low to High)</option>
              <option value="release_date.desc">Release Date (Newest)</option>
              <option value="release_date.asc">Release Date (Oldest)</option>
              <option value="title.asc">Title (A-Z)</option>
              <option value="title.desc">Title (Z-A)</option>
            </select>
          </div>

          {/* Año de lanzamiento */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Release Year
            </label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="input w-full"
            >
              {yearRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

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
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="input w-full mt-2"
            >
              <option value="all">Any Rating</option>
              <option value="7">7+</option>
              <option value="7.5">7.5+</option>
              <option value="8">8+</option>
              <option value="8.5">8.5+</option>
              <option value="9">9+</option>
            </select>
          </div>

          {/* Duración */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Duration
            </label>
            <select
              value={filters.duration}
              onChange={(e) => handleFilterChange('duration', e.target.value)}
              className="input w-full"
            >
              <option value="all">Any Duration</option>
              <option value="short">Short (&lt; 90 min)</option>
              <option value="medium">Medium (90-120 min)</option>
              <option value="long">Long (120-150 min)</option>
              <option value="very-long">Very Long (&gt; 150 min)</option>
            </select>
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

