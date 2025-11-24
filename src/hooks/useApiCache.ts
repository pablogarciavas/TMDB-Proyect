import { useRef, useCallback, useMemo } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Duración del caché: 5 minutos
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Hook para gestionar caché de llamadas a la API
 * Evita llamadas duplicadas y mejora el rendimiento
 */
export const useApiCache = () => {
  const cacheRef = useRef<Map<string, CacheEntry<any>>>(new Map());

  /**
   * Obtiene un valor del caché si existe y no ha expirado
   */
  const get = useCallback(<T,>(key: string): T | null => {
    const entry = cacheRef.current.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > CACHE_DURATION) {
      cacheRef.current.delete(key);
      return null;
    }

    return entry.data as T;
  }, []);

  /**
   * Guarda un valor en el caché
   */
  const set = useCallback(<T,>(key: string, data: T): void => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
    });
  }, []);

  /**
   * Limpia todo el caché
   */
  const clear = useCallback((): void => {
    cacheRef.current.clear();
  }, []);

  /**
   * Elimina una entrada específica del caché
   */
  const remove = useCallback((key: string): void => {
    cacheRef.current.delete(key);
  }, []);

  /**
   * Genera una clave de caché a partir de parámetros
   */
  const generateKey = useCallback((endpoint: string, params?: Record<string, any>): string => {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${endpoint}:${paramsStr}`;
  }, []);

  // Usar useMemo para mantener la misma referencia del objeto
  return useMemo(() => ({ get, set, clear, remove, generateKey }), [get, set, clear, remove, generateKey]);
};

