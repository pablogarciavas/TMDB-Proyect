import { useState, useEffect, useCallback } from 'react';
import { tmdbApi } from '../services/tmdbApi';
import { Movie } from '../types/movie';
import { Person } from '../types/person';
import { Company } from '../types/company';

export type GenreSearchResultType = 'movie' | 'person' | 'company';

export interface GenreSearchResult {
  type: GenreSearchResultType;
  id: number;
  title: string;
  subtitle?: string;
  image?: string | null;
  data: Movie | Person | Company;
}

interface UseGenreSearchOptions {
  genreId: number | null;
}

export const useGenreSearch = (options: UseGenreSearchOptions & { query?: string } = { genreId: null }) => {
  const { genreId, query: externalQuery } = options;
  const [results, setResults] = useState<GenreSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchAll = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Buscar solo personas y compañías (las películas se manejan por separado)
      const [peopleResponse, companiesResponse] = await Promise.all([
        tmdbApi.searchPeople(searchQuery, 1),
        tmdbApi.searchCompanies(searchQuery, 1),
      ]);

      const allResults: GenreSearchResult[] = [];

      // Agregar personas (máximo 3)
      peopleResponse.results.slice(0, 3).forEach((person) => {
        allResults.push({
          type: 'person',
          id: person.id,
          title: person.name,
          subtitle: person.known_for_department || 'Actor',
          image: person.profile_path,
          data: person,
        });
      });

      // Agregar compañías (máximo 2)
      companiesResponse.results.slice(0, 2).forEach((company) => {
        allResults.push({
          type: 'company',
          id: company.id,
          title: company.name,
          subtitle: 'Studio',
          image: company.logo_path,
          data: company,
        });
      });

      setResults(allResults);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!externalQuery) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchAll(externalQuery);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [externalQuery, searchAll]);

  return {
    results,
    loading,
  };
};

