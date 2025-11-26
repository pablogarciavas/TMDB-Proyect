import React, { useState, useEffect } from 'react';
import { Person } from '../../types/person';
import { Movie } from '../../types/movie';
import { tmdbApi } from '../../services/tmdbApi';
import { MovieGrid } from './MovieGrid';
import { Loading } from '../ui/Loading';
import { ErrorMessage } from '../ui/ErrorMessage';
import { getImageUrl } from '../../services/tmdbApi';
import { UserIcon } from '@heroicons/react/24/outline';

interface PersonMoviesPageProps {
  person: Person;
  genreId?: number | null;
  genreName?: string;
  onMovieClick?: (movie: Movie) => void;
  onBack?: () => void;
}

export const PersonMoviesPage: React.FC<PersonMoviesPageProps> = ({
  person,
  genreId,
  genreName,
  onMovieClick,
  onBack,
}) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personDetails, setPersonDetails] = useState<any>(null);

  useEffect(() => {
    const loadPersonMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const [credits, details] = await Promise.all([
          tmdbApi.getPersonMovieCredits(person.id),
          tmdbApi.getPersonDetails(person.id),
        ]);

        setPersonDetails(details);
        
        // Combinar cast y crew, eliminar duplicados
        const allMovies = new Map<number, Movie>();
        
        credits.cast.forEach((movie) => {
          allMovies.set(movie.id, {
            id: movie.id,
            title: movie.title,
            overview: '',
            poster_path: movie.poster_path,
            backdrop_path: null,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            vote_count: 0,
          });
        });

        credits.crew.forEach((movie) => {
          if (!allMovies.has(movie.id)) {
            allMovies.set(movie.id, {
              id: movie.id,
              title: movie.title,
              overview: '',
              poster_path: movie.poster_path,
              backdrop_path: null,
              release_date: movie.release_date,
              vote_average: movie.vote_average,
              vote_count: 0,
            });
          }
        });

        let filteredMovies = Array.from(allMovies.values());

        // Si hay un género seleccionado, filtrar las películas por ese género
        if (genreId) {
          // Obtener detalles de cada película para verificar géneros
          const moviesWithGenres = await Promise.all(
            filteredMovies.map(async (movie) => {
              try {
                const movieDetails = await tmdbApi.getMovieDetails(movie.id);
                return {
                  ...movie,
                  genre_ids: (movieDetails as any).genres?.map((g: any) => g.id) || [],
                };
              } catch {
                return { ...movie, genre_ids: [] };
              }
            })
          );

          // Filtrar solo las películas que pertenecen al género
          filteredMovies = moviesWithGenres.filter((movie) =>
            (movie as any).genre_ids?.includes(genreId)
          );
        }

        // Ordenar por fecha de lanzamiento (más recientes primero)
        const sortedMovies = filteredMovies.sort((a, b) => {
          const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
          const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
          return dateB - dateA;
        });

        setMovies(sortedMovies);
      } catch (err: any) {
        console.error('Error loading person movies:', err);
        setError(err.message || 'Error loading movies');
      } finally {
        setLoading(false);
      }
    };

    loadPersonMovies();
  }, [person.id, genreId]);

  return (
    <div className="w-full py-8 relative z-10">
      {/* Header */}
      <div className="mb-8">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 text-dark-medium hover:text-dark transition-colors"
          >
            ← Back
          </button>
        )}
        <div className="flex items-start gap-4 mb-4">
          {personDetails?.profile_path ? (
            <img
              src={getImageUrl(personDetails.profile_path, 'w185')}
              alt={person.name}
              className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 bg-beige-medium rounded-full flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-12 h-12 text-dark-light" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-dark mb-2">
              {person.name}
            </h1>
            {genreName && (
              <p className="text-dark-medium mb-2">
                {genreName} Movies
              </p>
            )}
            {!genreName && personDetails?.known_for_department && (
              <p className="text-dark-medium mb-2">
                {personDetails.known_for_department}
              </p>
            )}
            {personDetails?.biography && (
              <p className="text-dark-medium text-sm line-clamp-3">
                {personDetails.biography}
              </p>
            )}
          </div>
        </div>
        {!loading && movies.length > 0 && (
          <p className="text-dark-medium">
            {movies.length} {movies.length === 1 ? 'movie' : 'movies'} found
            {genreName && ` in ${genreName}`}
          </p>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loading />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-8">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Movies Grid */}
      {!loading && movies.length > 0 && (
        <MovieGrid movies={movies} onMovieClick={onMovieClick} />
      )}

      {!loading && !error && movies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-dark-medium">No movies found for this person.</p>
        </div>
      )}
    </div>
  );
};

