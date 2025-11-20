import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Movie } from '../types/movie';

const WATCHLIST_STORAGE_KEY = 'movie_watchlist';

export interface WatchlistMovie extends Movie {
  addedAt: string; // ISO date string
}

interface WatchlistContextType {
  watchlist: WatchlistMovie[];
  addToWatchlist: (movie: Movie) => void;
  removeFromWatchlist: (movieId: number) => void;
  isInWatchlist: (movieId: number) => boolean;
  clearWatchlist: () => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>([]);

  // Cargar watchlist desde sessionStorage al montar
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Asegurar que todas las películas tengan addedAt (para compatibilidad con watchlists antiguas)
        const watchlistWithDates: WatchlistMovie[] = parsed.map((movie: any) => ({
          ...movie,
          addedAt: movie.addedAt || new Date().toISOString(), // Fecha por defecto si no existe
        }));
        setWatchlist(watchlistWithDates);
      }
    } catch (error) {
      console.error('Error loading watchlist from sessionStorage:', error);
    }
  }, []);

  // Guardar watchlist en sessionStorage cuando cambie
  useEffect(() => {
    try {
      sessionStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
    } catch (error) {
      console.error('Error saving watchlist to sessionStorage:', error);
    }
  }, [watchlist]);

  const addToWatchlist = useCallback((movie: Movie) => {
    setWatchlist((prev) => {
      // Evitar duplicados
      if (prev.some((m) => m.id === movie.id)) {
        return prev;
      }
      // Añadir la película con la fecha de adición
      const watchlistMovie: WatchlistMovie = {
        ...movie,
        addedAt: new Date().toISOString(),
      };
      return [...prev, watchlistMovie];
    });
  }, []);

  const removeFromWatchlist = useCallback((movieId: number) => {
    setWatchlist((prev) => prev.filter((m) => m.id !== movieId));
  }, []);

  const isInWatchlist = useCallback(
    (movieId: number) => {
      return watchlist.some((m) => m.id === movieId);
    },
    [watchlist]
  );

  const clearWatchlist = useCallback(() => {
    setWatchlist([]);
    try {
      sessionStorage.removeItem(WATCHLIST_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing watchlist from sessionStorage:', error);
    }
  }, []);

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        clearWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = (): WatchlistContextType => {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};

