import React from 'react';
import { Navbar } from './Navbar';

interface HeaderProps {
  onGenreSelect?: (genreId: number, genreName: string) => void;
  onNavigate?: (route: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onGenreSelect, onNavigate }) => {
  const handleTitleClick = () => {
    onNavigate?.('home');
  };

  return (
    <header className="w-full bg-beige relative z-50 overflow-visible sm:overflow-visible">
      <div className="container-elegant overflow-visible">
        <div className="flex items-center justify-between py-3 md:py-5 gap-2 overflow-visible">
          {/* Título a la izquierda - sin animación para mejor LCP */}
          <div className="flex-shrink-0 min-w-0">
            <button
              onClick={handleTitleClick}
              className="text-sm md:text-lg lg:text-2xl xl:text-3xl font-bold text-dark tracking-tight hover:opacity-70 transition-opacity duration-200 cursor-pointer truncate"
            >
              <span className="hidden sm:inline">The Movie Database</span>
              <span className="sm:hidden">MovieDB</span>
            </button>
          </div>

          {/* Navbar a la derecha */}
          <div className="flex-shrink-0">
            <Navbar onGenreSelect={onGenreSelect} onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </header>
  );
};

