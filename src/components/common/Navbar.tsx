import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGenres } from '../../contexts/GenresContext';
import { Genre } from '../../types/genre';

interface NavbarProps {
  onGenreSelect?: (genreId: number, genreName: string) => void;
  onNavigate?: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onGenreSelect, onNavigate }) => {
  const { genres: allGenres } = useGenres();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reorganizar géneros para llenar columnas primero (column-major order)
  const genres = useMemo(() => {
    if (allGenres.length === 0) return [];
    
    // Sort genres alphabetically
    const sortedGenres = [...allGenres].sort((a, b) => 
      a.name.localeCompare(b.name, 'en')
    );
    
    // 5 columns, 4 rows = 20 slots, but we have 19 genres
    // We want: Col1: [0,1,2,3], Col2: [4,5,6,7], Col3: [8,9,10,11], etc.
    const columns = 5;
    const rows = 4;
    const reorganizedGenres: Genre[] = [];
    
    // Fill by columns: for each column, add genres row by row
    // Index calculation: col * rows + row (not row * columns + col)
    for (let col = 0; col < columns; col++) {
      for (let row = 0; row < rows; row++) {
        const index = col * rows + row;
        if (index < sortedGenres.length) {
          reorganizedGenres.push(sortedGenres[index]);
        }
      }
    }
    
    return reorganizedGenres;
  }, [allGenres]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGenreClick = (genreId: number, genreName: string) => {
    setOpenDropdown(null);
    onGenreSelect?.(genreId, genreName);
  };

  const handleNavClick = (route: string) => {
    setOpenDropdown(null);
    onNavigate?.(route);
  };

  const navItems = [
    { id: 'watchlist', label: 'Watchlist' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'minigame', label: 'Minigame' },
  ];

  return (
    <nav className="flex items-center space-x-1 animate-fadeInDown" ref={dropdownRef}>
      {/* Dropdown de Género */}
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(openDropdown === 'genre' ? null : 'genre')}
          className="px-4 py-2 text-dark hover:bg-dark hover:text-beige-light rounded-xl transition-all duration-200 font-medium text-sm md:text-base"
        >
          Genre
          <svg
            className={`inline-block ml-2 w-4 h-4 transition-transform duration-200 ${
              openDropdown === 'genre' ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openDropdown === 'genre' && (
          <div className="absolute top-full left-0 mt-2 w-auto min-w-[700px] bg-beige-light/95 backdrop-blur-md border border-beige-medium/50 rounded-2xl shadow-minimal-lg z-[100] animate-scaleIn">
            <div className="p-6">
              <div className="flex gap-x-4">
                {[0, 1, 2, 3, 4].map((colIndex) => {
                  const columnGenres = genres.filter((_, index) => Math.floor(index / 4) === colIndex);
                  const isLastColumn = colIndex === 4;
                  
                  return (
                    <div key={colIndex} className="flex-1 relative">
                      <div className="flex flex-col gap-y-2">
                        {columnGenres.map((genre) => (
                          <button
                            key={genre.id}
                            onClick={() => handleGenreClick(genre.id, genre.name)}
                            className="text-left px-3 py-2 text-dark hover:bg-dark/10 rounded-xl transition-colors duration-200 whitespace-nowrap text-sm font-medium"
                          >
                            {genre.name}
                          </button>
                        ))}
                      </div>
                      {/* Continuous vertical separator on the right side of each column */}
                      {!isLastColumn && (
                        <div className="absolute top-0 bottom-0 w-px bg-beige-medium/30" style={{ right: '-0.5rem' }}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resto de items de navegación */}
      {navItems.map((item, index) => (
        <button
          key={item.id}
          onClick={() => handleNavClick(item.id)}
          className="px-4 py-2 text-dark hover:bg-dark hover:text-beige-light rounded-xl transition-all duration-200 font-medium text-sm md:text-base"
          style={{ animationDelay: `${(index + 1) * 0.1}s` }}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};

