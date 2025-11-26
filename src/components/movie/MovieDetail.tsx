import React, { useMemo } from 'react';
import { useMovieDetails } from '../../hooks/useMovieDetails';
import { useWatchlist } from '../../hooks/useWatchlist';
import { Movie } from '../../types/movie';
import { Person } from '../../types/person';
import { Loading } from '../ui/Loading';
import { ErrorMessage } from '../ui/ErrorMessage';
import { getImageUrl } from '../../services/tmdbApi';
import { 
  StarIcon, 
  CalendarIcon, 
  ClockIcon,
  ArrowLeftIcon,
  FilmIcon,
  UserGroupIcon,
  LanguageIcon,
  BuildingOfficeIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';

interface MovieDetailProps {
  movieId: number;
  onBack?: () => void;
  onMovieClick?: (movie: Movie) => void;
  onPersonSelect?: (person: Person) => void;
}

export const MovieDetail: React.FC<MovieDetailProps> = ({
  movieId,
  onBack,
  onMovieClick,
  onPersonSelect,
}) => {
  const { movie, credits, videos, similarMovies, loading, error } = useMovieDetails(movieId);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  // Get main trailer (first official trailer, or first video) - MUST be before conditional returns
  const mainTrailer = useMemo(() => {
    return videos?.results.find(v => v.type === 'Trailer' && v.official) || videos?.results[0];
  }, [videos?.results]);

  // Memoize YouTube embed URL to prevent unnecessary re-renders - MUST be before conditional returns
  const trailerUrl = useMemo(() => {
    if (!mainTrailer?.key) return null;
    // Add YouTube parameters to optimize loading and prevent unnecessary requests
    return `https://www.youtube.com/embed/${mainTrailer.key}?rel=0&modestbranding=1&playsinline=1&enablejsapi=0`;
  }, [mainTrailer?.key]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loading size="lg" message="Loading movie details..." />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="py-12">
        <ErrorMessage message={error || 'Movie not found'} />
        {onBack && (
          <div className="text-center mt-6">
            <button onClick={onBack} className="btn-primary">
              Go Back
            </button>
          </div>
        )}
      </div>
    );
  }

  // Get director from crew
  const director = credits?.crew.find(person => person.job === 'Director');

  // Get top 12 cast members
  const topCast = credits?.cast.slice(0, 12) || [];

  // Format runtime
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get original language name
  const originalLanguage = movie.spoken_languages?.find(
    lang => lang.iso_639_1 === movie.original_language
  )?.english_name || movie.original_language.toUpperCase();

  return (
    <div className="w-full animate-fadeIn">
      {/* Backdrop Header */}
      {movie.backdrop_path && (
        <div className="relative w-full h-[250px] md:h-[400px] lg:h-[500px] mb-6 md:mb-8 rounded-t-2xl overflow-hidden">
          <img
            src={getImageUrl(movie.backdrop_path, 'w1280')}
            alt={movie.title}
            className="w-full h-full object-cover"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-beige via-beige/80 to-transparent"></div>
          
          {/* Back button */}
          {onBack && (
            <button
              onClick={onBack}
              className="absolute top-3 left-3 md:top-4 md:left-4 px-3 py-1.5 md:px-4 md:py-2 bg-dark/80 text-beige-light rounded-xl hover:bg-dark transition-colors backdrop-blur-sm flex items-center gap-1.5 md:gap-2 text-sm md:text-base"
            >
              <ArrowLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
              Back
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6 lg:space-y-8">
          {/* Title and Basic Info */}
          <div className="bg-beige-light/50 rounded-2xl p-4 md:p-6 lg:p-8 border border-beige-medium/30">
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-dark mb-2 md:mb-3">
              {movie.title}
            </h1>
            {movie.tagline && (
              <p className="text-base md:text-lg lg:text-xl text-dark-medium italic mb-4 md:mb-6">"{movie.tagline}"</p>
            )}
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <span className="flex items-center gap-1 md:gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-dark text-beige-light rounded-xl font-medium text-sm md:text-base">
                <StarIcon className="w-4 h-4 md:w-5 md:h-5" />
                {movie.vote_average.toFixed(1)}
              </span>
              <span className="flex items-center gap-1 md:gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-beige-medium/50 text-dark rounded-xl text-sm md:text-base">
                <CalendarIcon className="w-4 h-4 md:w-5 md:h-5" />
                {formatDate(movie.release_date)}
              </span>
              {movie.runtime > 0 && (
                <span className="flex items-center gap-1 md:gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-beige-medium/50 text-dark rounded-xl text-sm md:text-base">
                  <ClockIcon className="w-4 h-4 md:w-5 md:h-5" />
                  {formatRuntime(movie.runtime)}
                </span>
              )}
            </div>
            {/* Watchlist Button */}
            <button
              onClick={() => {
                if (isInWatchlist(movie.id)) {
                  removeFromWatchlist(movie.id);
                } else {
                  addToWatchlist(movie);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                isInWatchlist(movie.id)
                  ? 'bg-dark text-beige-light hover:bg-dark/90'
                  : 'bg-beige-medium text-dark hover:bg-beige'
              }`}
            >
              {isInWatchlist(movie.id) ? (
                <>
                  <BookmarkIconSolid className="w-5 h-5" />
                  <span>In Watchlist</span>
                </>
              ) : (
                <>
                  <BookmarkIcon className="w-5 h-5" />
                  <span>Add to Watchlist</span>
                </>
              )}
            </button>
          </div>

          {/* Overview */}
          {movie.overview && (
            <div className="bg-beige-light/50 rounded-2xl p-4 md:p-6 lg:p-8 border border-beige-medium/30">
              <h2 className="text-xl md:text-2xl font-bold text-dark mb-3 md:mb-4">Overview</h2>
              <p className="text-dark-medium leading-relaxed text-base md:text-lg">{movie.overview}</p>
            </div>
          )}

          {/* Cast */}
          {topCast.length > 0 && (
            <div className="bg-beige-light/50 rounded-2xl p-4 md:p-6 lg:p-8 border border-beige-medium/30">
              <h2 className="text-xl md:text-2xl font-bold text-dark mb-4 md:mb-6 flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 md:w-6 md:h-6" />
                Cast
              </h2>
              <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 -mx-2 px-2">
                {topCast.map((actor) => (
                  <div 
                    key={actor.id} 
                    onClick={() => onPersonSelect?.({
                      id: actor.id,
                      name: actor.name,
                      profile_path: actor.profile_path || null,
                    } as Person)}
                    className="flex-shrink-0 w-24 md:w-28 text-center group cursor-pointer transition-transform duration-200 hover:scale-105"
                  >
                    <div className="relative mb-3">
                      {actor.profile_path ? (
                        <img
                          src={getImageUrl(actor.profile_path, 'w185')}
                          alt={actor.name}
                          className="w-28 h-28 rounded-full object-cover border-2 border-beige-medium group-hover:border-dark/30 transition-colors duration-200 shadow-minimal"
                          loading="lazy"
                          decoding="async"
                          width="185"
                          height="185"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-beige-medium flex items-center justify-center border-2 border-beige-medium group-hover:border-dark/30 transition-colors duration-200 shadow-minimal">
                          <span className="text-xs text-dark-light">No photo</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-dark truncate mb-1">{actor.name}</p>
                    <p className="text-xs text-dark-medium truncate">{actor.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trailer */}
          {mainTrailer && trailerUrl && (
            <div className="bg-beige-light/50 rounded-2xl p-4 md:p-6 lg:p-8 border border-beige-medium/30">
              <h2 className="text-xl md:text-2xl font-bold text-dark mb-4 md:mb-6 flex items-center gap-2">
                <FilmIcon className="w-5 h-5 md:w-6 md:h-6" />
                Trailer
              </h2>
              <div className="aspect-video rounded-xl overflow-hidden shadow-minimal-lg">
                <iframe
                  key={mainTrailer.key}
                  src={trailerUrl}
                  title={mainTrailer.name}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  frameBorder="0"
                ></iframe>
              </div>
            </div>
          )}

          {/* Similar Movies */}
          {similarMovies.length > 0 && (
            <div className="bg-beige-light/50 rounded-2xl p-4 md:p-6 lg:p-8 border border-beige-medium/30">
              <h2 className="text-xl md:text-2xl font-bold text-dark mb-4 md:mb-6">You might also like</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {similarMovies.map((similarMovie) => (
                  <div
                    key={similarMovie.id}
                    onClick={() => onMovieClick?.(similarMovie)}
                    className="cursor-pointer group"
                  >
                    {similarMovie.poster_path ? (
                      <img
                        src={getImageUrl(similarMovie.poster_path, 'w500')}
                        alt={similarMovie.title}
                        className="w-full aspect-[2/3] object-cover rounded-xl group-hover:scale-105 transition-transform duration-200 shadow-minimal"
                        loading="lazy"
                        decoding="async"
                        width="500"
                        height="750"
                      />
                    ) : (
                      <div className="w-full aspect-[2/3] bg-beige-medium rounded-xl flex items-center justify-center shadow-minimal">
                        <span className="text-xs text-dark-light">No image</span>
                      </div>
                    )}
                    <p className="text-sm font-medium text-dark mt-2 line-clamp-2 group-hover:text-dark transition-colors">{similarMovie.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar Info */}
        <div className="space-y-6">
          {/* Poster */}
          {movie.poster_path && (
            <div className="overflow-hidden rounded-xl shadow-minimal-lg">
              <img
                src={getImageUrl(movie.poster_path, 'w500')}
                alt={movie.title}
                className="w-full h-auto block"
                loading="lazy"
                decoding="async"
                width="500"
                height="750"
              />
            </div>
          )}

          {/* Director */}
          {director && (
            <div className="bg-beige-light/50 rounded-2xl p-5 border border-beige-medium/30">
              <h3 className="text-lg font-semibold text-dark mb-3">Director</h3>
              <button
                onClick={() => {
                  // TODO: Implement director filter/search
                  console.log('Director clicked:', director.name);
                }}
                className="text-dark-medium hover:text-dark transition-colors cursor-pointer font-medium hover:underline"
              >
                {director.name}
              </button>
            </div>
          )}

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="bg-beige-light/50 rounded-2xl p-5 border border-beige-medium/30">
              <h3 className="text-lg font-semibold text-dark mb-3">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1.5 bg-beige text-dark rounded-lg text-sm font-medium border border-beige-medium/50 hover:border-dark/20 hover:bg-beige-medium/50 transition-all duration-200 cursor-pointer"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-beige-light/50 rounded-2xl p-5 border border-beige-medium/30 space-y-3">
            <h3 className="text-lg font-semibold text-dark mb-3">Details</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-dark-medium">Runtime</span>
                <span className="text-sm font-semibold text-dark">{formatRuntime(movie.runtime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-dark-medium">Release Date</span>
                <span className="text-sm font-semibold text-dark">{formatDate(movie.release_date)}</span>
              </div>
              {movie.budget > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-dark-medium">Budget</span>
                  <span className="text-sm font-semibold text-dark">
                    ${movie.budget.toLocaleString()}
                  </span>
                </div>
              )}
              {movie.revenue > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-dark-medium">Revenue</span>
                  <span className="text-sm font-semibold text-dark">
                    ${movie.revenue.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Original Language */}
          {movie.spoken_languages && movie.spoken_languages.length > 0 && (
            <div className="bg-beige-light/50 rounded-2xl p-5 border border-beige-medium/30">
              <h3 className="text-lg font-semibold text-dark mb-3 flex items-center gap-2">
                <LanguageIcon className="w-5 h-5" />
                Original Language
              </h3>
              <p className="text-sm font-medium text-dark">{originalLanguage}</p>
            </div>
          )}

          {/* Production Companies */}
          {movie.production_companies && movie.production_companies.length > 0 && (
            <div className="bg-beige-light/50 rounded-2xl p-5 border border-beige-medium/30">
              <h3 className="text-lg font-semibold text-dark mb-3 flex items-center gap-2">
                <BuildingOfficeIcon className="w-5 h-5" />
                Production
              </h3>
              <div className="space-y-2">
                {movie.production_companies.slice(0, 3).map((company) => (
                  <div key={company.id} className="text-sm font-medium text-dark-medium">
                    {company.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

