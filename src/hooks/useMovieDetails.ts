import { useState, useEffect, useRef } from 'react';
import { tmdbApi } from '../services/tmdbApi';
import { MovieDetails, Credits, WatchProviders, Videos } from '../types/movieDetails';
import { MovieResponse } from '../types/movie';
import { useApiCache } from './useApiCache';

interface UseMovieDetailsReturn {
  movie: MovieDetails | null;
  credits: Credits | null;
  watchProviders: WatchProviders | null;
  videos: Videos | null;
  similarMovies: MovieResponse['results'];
  loading: boolean;
  error: string | null;
}

export const useMovieDetails = (movieId: number | null): UseMovieDetailsReturn => {
  const cache = useApiCache();
  const isMountedRef = useRef(true);
  const currentMovieIdRef = useRef<number | null>(null);
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [watchProviders, setWatchProviders] = useState<WatchProviders | null>(null);
  const [videos, setVideos] = useState<Videos | null>(null);
  const [similarMovies, setSimilarMovies] = useState<MovieResponse['results']>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Marcar como montado cuando el componente se monta
    isMountedRef.current = true;
    currentMovieIdRef.current = movieId;

    return () => {
      // Marcar como desmontado cuando el componente se desmonta
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!movieId) {
      if (isMountedRef.current) {
        setMovie(null);
        setCredits(null);
        setWatchProviders(null);
        setVideos(null);
        setSimilarMovies([]);
      }
      return;
    }

    // Actualizar la referencia del movieId actual
    currentMovieIdRef.current = movieId;

    const loadMovieDetails = async () => {
      // Verificar que el componente sigue montado y el movieId no ha cambiado
      if (!isMountedRef.current || currentMovieIdRef.current !== movieId) {
        return;
      }

      if (isMountedRef.current) {
        setLoading(true);
        setError(null);
      }

      try {
        // Verificar caché para cada endpoint
        const movieCacheKey = cache.generateKey(`movie/${movieId}`, {});
        const creditsCacheKey = cache.generateKey(`movie/${movieId}/credits`, {});
        const providersCacheKey = cache.generateKey(`movie/${movieId}/watch/providers`, {});
        const videosCacheKey = cache.generateKey(`movie/${movieId}/videos`, {});
        const similarCacheKey = cache.generateKey(`movie/${movieId}/similar`, { page: 1 });

        const cachedMovie = cache.get<MovieDetails>(movieCacheKey);
        const cachedCredits = cache.get<Credits>(creditsCacheKey);
        const cachedProviders = cache.get<WatchProviders>(providersCacheKey);
        const cachedVideos = cache.get<Videos>(videosCacheKey);
        const cachedSimilar = cache.get<MovieResponse>(similarCacheKey);

        // Cargar solo lo que no está en caché
        const promises: Promise<any>[] = [];
        const cachedData: any = {};
        
        if (cachedMovie) {
          cachedData.movie = cachedMovie;
        } else {
          promises.push(
            tmdbApi.getMovieDetails(movieId).then(data => {
              cache.set(movieCacheKey, data);
              return { type: 'movie', data };
            })
          );
        }

        if (cachedCredits) {
          cachedData.credits = cachedCredits;
        } else {
          promises.push(
            tmdbApi.getMovieCredits(movieId).then(data => {
              cache.set(creditsCacheKey, data);
              return { type: 'credits', data };
            })
          );
        }

        if (cachedProviders) {
          cachedData.providers = cachedProviders;
        } else {
          promises.push(
            tmdbApi.getWatchProviders(movieId).then(data => {
              cache.set(providersCacheKey, data);
              return { type: 'providers', data };
            })
          );
        }

        if (cachedVideos) {
          cachedData.videos = cachedVideos;
        } else {
          promises.push(
            tmdbApi.getMovieVideos(movieId).then(data => {
              cache.set(videosCacheKey, data);
              return { type: 'videos', data };
            })
          );
        }

        if (cachedSimilar) {
          cachedData.similar = cachedSimilar.results.slice(0, 6);
        } else {
          promises.push(
            tmdbApi.getSimilarMovies(movieId, 1).then(data => {
              cache.set(similarCacheKey, data);
              return { type: 'similar', data };
            })
          );
        }

        // Establecer datos del caché primero (en un solo batch) - solo si el componente sigue montado
        if (isMountedRef.current && currentMovieIdRef.current === movieId) {
          if (cachedData.movie) setMovie(cachedData.movie);
          if (cachedData.credits) setCredits(cachedData.credits);
          if (cachedData.providers) setWatchProviders(cachedData.providers);
          if (cachedData.videos) setVideos(cachedData.videos);
          if (cachedData.similar) setSimilarMovies(cachedData.similar);
        }

        // Ejecutar todas las promesas en paralelo
        if (promises.length > 0) {
          const results = await Promise.all(promises);
          
          // Verificar nuevamente antes de actualizar el estado
          if (!isMountedRef.current || currentMovieIdRef.current !== movieId) {
            return; // El componente se desmontó o cambió el movieId, no actualizar estado
          }

          results.forEach(result => {
            // Verificar en cada iteración por si acaso
            if (!isMountedRef.current || currentMovieIdRef.current !== movieId) {
              return;
            }

            switch (result.type) {
              case 'movie':
                setMovie(result.data);
                break;
              case 'credits':
                setCredits(result.data);
                break;
              case 'providers':
                setWatchProviders(result.data);
                break;
              case 'videos':
                setVideos(result.data);
                break;
              case 'similar':
                setSimilarMovies(result.data.results.slice(0, 6));
                break;
            }
          });
        }
      } catch (err: any) {
        // Solo actualizar error si el componente sigue montado y el movieId no ha cambiado
        if (isMountedRef.current && currentMovieIdRef.current === movieId) {
          console.error('Error loading movie details:', err);
          setError(err.message || 'Error loading movie details');
        }
      } finally {
        // Solo actualizar loading si el componente sigue montado y el movieId no ha cambiado
        if (isMountedRef.current && currentMovieIdRef.current === movieId) {
          setLoading(false);
        }
      }
    };

    loadMovieDetails();
  }, [movieId, cache]);

  return {
    movie,
    credits,
    watchProviders,
    videos,
    similarMovies,
    loading,
    error,
  };
};

