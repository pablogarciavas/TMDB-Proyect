import React, { createContext, useContext, useState, useEffect } from 'react';
import { tmdbApi } from '../services/tmdbApi';
import { Genre } from '../types/genre';

interface GenresContextType {
  genres: Genre[];
  loading: boolean;
  error: string | null;
  getGenreById: (id: number) => Genre | undefined;
  getGenreByName: (name: string) => Genre | undefined;
}

const GenresContext = createContext<GenresContextType>({
  genres: [],
  loading: false,
  error: null,
  getGenreById: () => undefined,
  getGenreByName: () => undefined,
});

/**
 * Provider de géneros que carga la lista una sola vez
 * y la comparte entre todos los componentes
 */
export const GenresProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const response = await tmdbApi.getGenres();
        setGenres(response.genres);
      } catch (err: any) {
        setError(err.message || 'Error loading genres');
        console.error('Error loading genres:', err);
      } finally {
        setLoading(false);
      }
    };
    loadGenres();
  }, []);

  const getGenreById = (id: number): Genre | undefined => {
    return genres.find(genre => genre.id === id);
  };

  const getGenreByName = (name: string): Genre | undefined => {
    return genres.find(genre => genre.name.toLowerCase() === name.toLowerCase());
  };

  return (
    <GenresContext.Provider value={{ genres, loading, error, getGenreById, getGenreByName }}>
      {children}
    </GenresContext.Provider>
  );
};

export const useGenres = () => useContext(GenresContext);

