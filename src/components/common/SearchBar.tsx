import React, { useRef, useEffect } from 'react';
import { useSearch } from '../../hooks/useSearch';
import { Movie } from '../../types/movie';
import { getImageUrl } from '../../services/tmdbApi';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  onMovieSelect?: (movie: Movie) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onMovieSelect,
  placeholder = "Search movies..."
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

  const handleMovieClick = (movie: Movie) => {
    setIsOpen(false);
    setQuery('');
    onMovieSelect?.(movie);
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
        <div className="absolute top-full left-0 right-0 mt-2 bg-beige-light border border-beige-medium rounded-2xl shadow-minimal-lg z-40 max-h-96 overflow-y-auto animate-scaleIn">
          {loading && results.length === 0 ? (
            <div className="p-4 text-center text-dark-medium">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => handleMovieClick(movie)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-beige transition-colors duration-200 text-left"
                >
                  {movie.poster_path ? (
                    <img
                      src={getImageUrl(movie.poster_path, 'w185')}
                      alt={movie.title}
                      className="w-12 h-16 object-cover rounded flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-16 bg-beige-medium rounded flex-shrink-0 flex items-center justify-center">
                      <span className="text-xs text-dark-light">No image</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-dark truncate">{movie.title}</h3>
                    {movie.release_date && (
                      <p className="text-sm text-dark-medium">
                        {new Date(movie.release_date).getFullYear()}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

