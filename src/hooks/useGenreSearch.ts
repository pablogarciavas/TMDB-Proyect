import { useState, useEffect, useCallback, useRef } from 'react';
import { tmdbApi } from '../services/tmdbApi';
import { Movie } from '../types/movie';
import { Person } from '../types/person';
import { Company } from '../types/company';
import { useApiCache } from './useApiCache';
import { PersonResponse } from '../types/person';
import { CompanyResponse } from '../types/company';

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
  const cache = useApiCache();
  const isMountedRef = useRef(true);
  const currentRequestRef = useRef<string>('');
  const [results, setResults] = useState<GenreSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<string>(externalQuery || '');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (externalQuery !== undefined) {
      setQuery(externalQuery);
    }
  }, [externalQuery]);

  const searchAll = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      if (isMountedRef.current) {
        setResults([]);
      }
      return;
    }

    const requestId = `${genreId}-${searchQuery}`;
    currentRequestRef.current = requestId;

    if (isMountedRef.current) {
      setLoading(true);
    }

    try {
      // Verificar caché
      const cacheKey = cache.generateKey('genre/search', { query: searchQuery, genreId });
      const cached = cache.get<GenreSearchResult[]>(cacheKey);
      
      if (cached) {
        if (isMountedRef.current && currentRequestRef.current === requestId) {
          setResults(cached);
          setLoading(false);
        }
        return;
      }

      // Verificar caché individual
      const peopleCacheKey = cache.generateKey('search/person', { query: searchQuery, page: 1 });
      const companiesCacheKey = cache.generateKey('search/company', { query: searchQuery, page: 1 });

      const cachedPeople = cache.get<PersonResponse>(peopleCacheKey);
      const cachedCompanies = cache.get<CompanyResponse>(companiesCacheKey);

      // Cargar solo lo que no está en caché
      const promises: Promise<any>[] = [];
      
      if (cachedPeople) {
        promises.push(Promise.resolve({ type: 'people', data: cachedPeople }));
      } else {
        promises.push(
          tmdbApi.searchPeople(searchQuery, 1).then(data => {
            cache.set(peopleCacheKey, data);
            return { type: 'people', data };
          })
        );
      }

      if (cachedCompanies) {
        promises.push(Promise.resolve({ type: 'companies', data: cachedCompanies }));
      } else {
        promises.push(
          tmdbApi.searchCompanies(searchQuery, 1).then(data => {
            cache.set(companiesCacheKey, data);
            return { type: 'companies', data };
          })
        );
      }

      // Buscar solo personas y compañías (las películas se manejan por separado)
      const responses = await Promise.all(promises);
      
      let peopleResponse: PersonResponse | undefined;
      let companiesResponse: CompanyResponse | undefined;

      responses.forEach(response => {
        if (response.type === 'people') peopleResponse = response.data;
        else if (response.type === 'companies') companiesResponse = response.data;
      });

      const allResults: GenreSearchResult[] = [];

      // Agregar personas (máximo 3)
      if (peopleResponse) {
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
      }

      // Agregar compañías (máximo 2)
      if (companiesResponse) {
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
      }

      // Guardar en caché
      cache.set(cacheKey, allResults);

      // Verificar que el componente sigue montado y esta es la petición actual
      if (isMountedRef.current && currentRequestRef.current === requestId) {
        setResults(allResults);
      }
    } catch (error) {
      // Solo actualizar error si el componente sigue montado y esta es la petición actual
      if (isMountedRef.current && currentRequestRef.current === requestId) {
        console.error('Error en búsqueda:', error);
        setResults([]);
      }
    } finally {
      // Solo actualizar loading si el componente sigue montado y esta es la petición actual
      if (isMountedRef.current && currentRequestRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [cache, genreId]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchAll(query);
      setIsOpen(true);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [query, searchAll]);

  return {
    query,
    setQuery,
    results,
    loading,
    isOpen,
    setIsOpen,
  };
};

