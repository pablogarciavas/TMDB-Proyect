import { useState, useEffect, useCallback, useRef } from 'react';
import { tmdbApi } from '../services/tmdbApi';
import { Movie } from '../types/movie';
import { Person } from '../types/person';
import { Company } from '../types/company';
import { useApiCache } from './useApiCache';
import { MovieResponse } from '../types/movie';
import { PersonResponse } from '../types/person';
import { CompanyResponse } from '../types/company';

export type SearchResultType = 'movie' | 'person' | 'company';

export interface SearchResult {
  type: SearchResultType;
  id: number;
  title: string;
  subtitle?: string;
  image?: string | null;
  data: Movie | Person | Company;
}

export const useSearch = () => {
  const cache = useApiCache();
  const isMountedRef = useRef(true);
  const currentRequestRef = useRef<string>('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const searchAll = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      if (isMountedRef.current) {
        setResults([]);
        setIsOpen(false);
      }
      return;
    }

    const requestId = searchQuery;
    currentRequestRef.current = requestId;

    if (isMountedRef.current) {
      setLoading(true);
    }

    try {
      // Verificar caché primero
      const cacheKey = cache.generateKey('search/all', { query: searchQuery });
      const cached = cache.get<SearchResult[]>(cacheKey);
      
      if (cached) {
        if (isMountedRef.current && currentRequestRef.current === requestId) {
          setResults(cached);
          setIsOpen(true);
          setLoading(false);
        }
        return;
      }

      // Verificar caché individual para cada tipo de búsqueda
      const moviesCacheKey = cache.generateKey('search/movie', { query: searchQuery, page: 1 });
      const peopleCacheKey = cache.generateKey('search/person', { query: searchQuery, page: 1 });
      const companiesCacheKey = cache.generateKey('search/company', { query: searchQuery, page: 1 });

      const cachedMovies = cache.get<MovieResponse>(moviesCacheKey);
      const cachedPeople = cache.get<PersonResponse>(peopleCacheKey);
      const cachedCompanies = cache.get<CompanyResponse>(companiesCacheKey);

      // Cargar solo lo que no está en caché
      const promises: Promise<any>[] = [];
      
      if (cachedMovies) {
        promises.push(Promise.resolve({ type: 'movies', data: cachedMovies }));
      } else {
        promises.push(
          tmdbApi.searchMovies(searchQuery, 1).then(data => {
            cache.set(moviesCacheKey, data);
            return { type: 'movies', data };
          })
        );
      }

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

      // Buscar en paralelo: películas, personas y compañías
      const responses = await Promise.all(promises);
      
      let moviesResponse: MovieResponse | undefined;
      let peopleResponse: PersonResponse | undefined;
      let companiesResponse: CompanyResponse | undefined;

      responses.forEach(response => {
        if (response.type === 'movies') moviesResponse = response.data;
        else if (response.type === 'people') peopleResponse = response.data;
        else if (response.type === 'companies') companiesResponse = response.data;
      });

      const allResults: SearchResult[] = [];

      // Agregar películas (máximo 3)
      if (moviesResponse) {
        moviesResponse.results.slice(0, 3).forEach((movie) => {
        allResults.push({
          type: 'movie',
          id: movie.id,
          title: movie.title,
          subtitle: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : undefined,
          image: movie.poster_path,
          data: movie,
        });
        });
      }

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

      // Guardar en caché los resultados combinados
      cache.set(cacheKey, allResults);

      // Verificar que el componente sigue montado y esta es la petición actual
      if (isMountedRef.current && currentRequestRef.current === requestId) {
        setResults(allResults);
        setIsOpen(true);
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
  }, [cache]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        searchAll(query);
      } else {
        setResults([]);
        setIsOpen(false);
      }
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
