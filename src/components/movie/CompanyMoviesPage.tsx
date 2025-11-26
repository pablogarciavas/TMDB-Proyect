import React, { useState, useEffect } from 'react';
import { Company } from '../../types/company';
import { Movie } from '../../types/movie';
import { tmdbApi } from '../../services/tmdbApi';
import { MovieGrid } from './MovieGrid';
import { Loading } from '../ui/Loading';
import { ErrorMessage } from '../ui/ErrorMessage';
import { getImageUrl } from '../../services/tmdbApi';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface CompanyMoviesPageProps {
  company: Company;
  genreId?: number | null;
  genreName?: string;
  onMovieClick?: (movie: Movie) => void;
  onBack?: () => void;
}

export const CompanyMoviesPage: React.FC<CompanyMoviesPageProps> = ({
  company,
  genreId,
  genreName,
  onMovieClick,
  onBack,
}) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [companyDetails, setCompanyDetails] = useState<any>(null);

  useEffect(() => {
    const loadCompanyMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const [moviesResponse, details] = await Promise.all([
          tmdbApi.getCompanyMovies(company.id, currentPage),
          tmdbApi.getCompanyDetails(company.id).catch(() => null), // Opcional
        ]);

        setCompanyDetails(details);
        let filteredMovies = moviesResponse.results;

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

        setMovies(filteredMovies);
        setCurrentPage(moviesResponse.page);
        setTotalPages(genreId ? Math.ceil(filteredMovies.length / 20) : moviesResponse.total_pages);
        setTotalResults(genreId ? filteredMovies.length : moviesResponse.total_results);
      } catch (err: any) {
        console.error('Error loading company movies:', err);
        setError(err.message || 'Error loading movies');
      } finally {
        setLoading(false);
      }
    };

    loadCompanyMovies();
  }, [company.id, currentPage, genreId]);

  const loadPage = (page: number) => {
    setCurrentPage(page);
  };

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
          {company.logo_path ? (
            <img
              src={getImageUrl(company.logo_path, 'w500')}
              alt={company.name}
              className="h-16 md:h-20 object-contain bg-beige p-2 rounded flex-shrink-0"
            />
          ) : (
            <div className="h-16 md:h-20 w-32 md:w-40 bg-beige-medium rounded flex items-center justify-center flex-shrink-0">
              <BuildingOfficeIcon className="w-8 h-8 text-dark-light" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-dark mb-2">
              {company.name}
            </h1>
            {genreName && (
              <p className="text-dark-medium mb-2">
                {genreName} Movies
              </p>
            )}
            {companyDetails?.description && (
              <p className="text-dark-medium text-sm line-clamp-3">
                {companyDetails.description}
              </p>
            )}
          </div>
        </div>
        {!loading && totalResults > 0 && (
          <p className="text-dark-medium">
            {totalResults.toLocaleString()} {totalResults === 1 ? 'movie' : 'movies'} found
            {genreName && ` in ${genreName}`}
          </p>
        )}
      </div>

      {/* Loading State */}
      {loading && movies.length === 0 && (
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

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => loadPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-beige-medium text-dark rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-beige transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-dark-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => loadPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-beige-medium text-dark rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-beige transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {!loading && !error && movies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-dark-medium">No movies found for this studio.</p>
        </div>
      )}
    </div>
  );
};

