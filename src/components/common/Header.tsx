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
    <header className="w-full bg-beige">
      <div className="container-elegant">
        <div className="flex items-center justify-between py-4 md:py-5">
          {/* Título a la izquierda */}
          <div className="flex-shrink-0 animate-slideInRight">
            <button
              onClick={handleTitleClick}
              className="text-xl md:text-2xl lg:text-3xl font-bold text-dark tracking-tight hover:opacity-70 transition-opacity duration-200 cursor-pointer"
            >
              The Movie Database
            </button>
          </div>

          {/* Navbar a la derecha */}
          <div className="flex-1 flex justify-end ml-4">
            <Navbar onGenreSelect={onGenreSelect} onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </header>
  );
};

