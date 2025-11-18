import { useState, useEffect, useCallback } from 'react';
import { tmdbApi } from '../services/tmdbApi';
import { Movie } from '../types/movie';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const searchMovies = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const response = await tmdbApi.searchMovies(searchQuery, 1);
      setResults(response.results.slice(0, 5)); // Mostrar solo las primeras 5
      setIsOpen(true);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        searchMovies(query);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [query, searchMovies]);

  return {
    query,
    setQuery,
    results,
    loading,
    isOpen,
    setIsOpen,
  };
};

