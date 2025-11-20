import React, { useRef, useEffect } from 'react';
import { useSearch, SearchResult } from '../../hooks/useSearch';
import { Movie } from '../../types/movie';
import { Person } from '../../types/person';
import { Company } from '../../types/company';
import { getImageUrl } from '../../services/tmdbApi';
import { MagnifyingGlassIcon, FilmIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  onMovieSelect?: (movie: Movie) => void;
  onPersonSelect?: (person: Person) => void;
  onCompanySelect?: (company: Company) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onMovieSelect,
  onPersonSelect,
  onCompanySelect,
  placeholder = "Search movies, actors, directors, studios..."
}) => {
  const { query, setQuery, results, loading, isOpen, setIsOpen } = useSearch();
  const searchRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    
    if (result.type === 'movie' && onMovieSelect) {
      onMovieSelect(result.data as Movie);
    } else if (result.type === 'person' && onPersonSelect) {
      onPersonSelect(result.data as Person);
    } else if (result.type === 'company' && onCompanySelect) {
      onCompanySelect(result.data as Company);
    }
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'movie':
        return <FilmIcon className="w-4 h-4" />;
      case 'person':
        return <UserIcon className="w-4 h-4" />;
      case 'company':
        return <BuildingOfficeIcon className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'movie':
        return 'Movie';
      case 'person':
        return 'Person';
      case 'company':
        return 'Studio';
    }
  };

  // Agrupar resultados por tipo
  const groupedResults = {
    movies: results.filter(r => r.type === 'movie'),
    people: results.filter(r => r.type === 'person'),
    companies: results.filter(r => r.type === 'company'),
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          placeholder={placeholder}
          className="input pr-12 text-lg py-4 md:py-5 w-full rounded-2xl"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-dark border-t-transparent"></div>
          ) : (
            <MagnifyingGlassIcon className="w-5 h-5 text-dark-light" />
          )}
        </div>
      </div>

      {/* Dropdown de resultados */}
      {isOpen && (results.length > 0 || loading) && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 bg-beige-light border border-beige-medium rounded-2xl shadow-minimal-lg z-40 max-h-96 overflow-hidden animate-scaleIn dropdown-rounded"
          data-lenis-prevent
          style={{ 
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch'
          }}
          onWheel={(e) => {
            // Prevenir que el scroll del dropdown afecte el scroll de la página
            e.stopPropagation();
          }}
          onTouchMove={(e) => {
            // Permitir scroll táctil en el dropdown
            e.stopPropagation();
          }}
        >
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
          {loading && results.length === 0 ? (
            <div className="p-4 text-center text-dark-medium">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {/* Películas */}
              {groupedResults.movies.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-dark-medium uppercase tracking-wide">
                    Movies
                  </div>
                  {groupedResults.movies.map((result) => (
                    <button
                      key={`movie-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-beige transition-colors duration-200 text-left"
                    >
                      {result.image ? (
                        <img
                          src={getImageUrl(result.image, 'w185')}
                          alt={result.title}
                          className="w-12 h-16 object-cover rounded flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-beige-medium rounded flex-shrink-0 flex items-center justify-center">
                          <FilmIcon className="w-6 h-6 text-dark-light" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-dark truncate">{result.title}</h3>
                        {result.subtitle && (
                          <p className="text-sm text-dark-medium">{result.subtitle}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-dark-light">
                        {getIcon(result.type)}
                        <span>{getTypeLabel(result.type)}</span>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {/* Personas */}
              {groupedResults.people.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-dark-medium uppercase tracking-wide border-t border-beige-medium mt-1">
                    People
                  </div>
                  {groupedResults.people.map((result) => (
                    <button
                      key={`person-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-beige transition-colors duration-200 text-left"
                    >
                      {result.image ? (
                        <img
                          src={getImageUrl(result.image, 'w185')}
                          alt={result.title}
                          className="w-12 h-12 object-cover rounded-full flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-beige-medium rounded-full flex-shrink-0 flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-dark-light" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-dark truncate">{result.title}</h3>
                        {result.subtitle && (
                          <p className="text-sm text-dark-medium">{result.subtitle}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-dark-light">
                        {getIcon(result.type)}
                        <span>{getTypeLabel(result.type)}</span>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {/* Compañías */}
              {groupedResults.companies.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-dark-medium uppercase tracking-wide border-t border-beige-medium mt-1">
                    Studios
                  </div>
                  {groupedResults.companies.map((result) => (
                    <button
                      key={`company-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-beige transition-colors duration-200 text-left"
                    >
                      {result.image ? (
                        <img
                          src={getImageUrl(result.image, 'w185')}
                          alt={result.title}
                          className="w-12 h-12 object-contain bg-beige p-1 rounded flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-beige-medium rounded flex-shrink-0 flex items-center justify-center">
                          <BuildingOfficeIcon className="w-6 h-6 text-dark-light" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-dark truncate">{result.title}</h3>
                        {result.subtitle && (
                          <p className="text-sm text-dark-medium">{result.subtitle}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-dark-light">
                        {getIcon(result.type)}
                        <span>{getTypeLabel(result.type)}</span>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
