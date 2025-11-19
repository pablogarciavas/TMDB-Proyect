import { useState, useEffect } from 'react';
import { tmdbApi } from '../services/tmdbApi';
import { MovieDetails, Credits, WatchProviders, Videos } from '../types/movieDetails';
import { MovieResponse } from '../types/movie';

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
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [watchProviders, setWatchProviders] = useState<WatchProviders | null>(null);
  const [videos, setVideos] = useState<Videos | null>(null);
  const [similarMovies, setSimilarMovies] = useState<MovieResponse['results']>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movieId) {
      setMovie(null);
      setCredits(null);
      setWatchProviders(null);
      setVideos(null);
      setSimilarMovies([]);
      return;
    }

    const loadMovieDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load all data in parallel
        const [movieData, creditsData, providersData, videosData, similarData] = await Promise.all([
          tmdbApi.getMovieDetails(movieId),
          tmdbApi.getMovieCredits(movieId),
          tmdbApi.getWatchProviders(movieId),
          tmdbApi.getMovieVideos(movieId),
          tmdbApi.getSimilarMovies(movieId, 1),
        ]);

        setMovie(movieData);
        setCredits(creditsData);
        setWatchProviders(providersData);
        setVideos(videosData);
        setSimilarMovies(similarData.results.slice(0, 6)); // Show only first 6 similar movies
      } catch (err: any) {
        console.error('Error loading movie details:', err);
        setError(err.message || 'Error loading movie details');
      } finally {
        setLoading(false);
      }
    };

    loadMovieDetails();
  }, [movieId]);

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

