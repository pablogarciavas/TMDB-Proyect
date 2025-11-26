import React, { useState, useEffect, useRef } from 'react';
import { useMovieGuessGame } from '../../hooks/useMovieGuessGame';
import { DifficultySelector } from './DifficultySelector';
import { getImageUrl } from '../../services/tmdbApi';
import { Loading } from '../ui/Loading';
import { ErrorMessage } from '../ui/ErrorMessage';
import { MagnifyingGlassIcon, LightBulbIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { tmdbApi } from '../../services/tmdbApi';

export const MovieGuessGame: React.FC = () => {
  const {
    movie,
    credits,
    hints,
    revealedHints,
    imageBlur,
    progress,
    gameState,
    attempts,
    difficulty,
    loading,
    error,
    startGame,
    revealHint,
    checkAnswer,
    giveUp,
    resetGame,
  } = useMovieGuessGame();

  const [answer, setAnswer] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hintsContainerRef = useRef<HTMLDivElement>(null);

  // Buscar sugerencias para autocompletado (solo en fácil y media)
  useEffect(() => {
    if (answer.trim().length >= 2 && gameState === 'playing' && (difficulty === 'easy' || difficulty === 'medium')) {
      const timeoutId = setTimeout(async () => {
        setSuggestionsLoading(true);
        try {
          // Buscar en inglés y sin especificar idioma (permite búsqueda en todos los idiomas incluyendo español)
          const [responseEn, responseAll] = await Promise.all([
            tmdbApi.searchMovies(answer.trim(), 1),
            tmdbApi.searchMovies(answer.trim(), 1, true), // true = sin especificar idioma
          ]);
          
          // Combinar resultados y eliminar duplicados por ID
          const allMovies = new Map<number, typeof responseEn.results[0]>();
          
          // Agregar resultados en inglés primero (prioridad)
          responseEn.results?.forEach(movie => {
            if (!allMovies.has(movie.id)) {
              allMovies.set(movie.id, movie);
            }
          });
          
          // Agregar resultados de otros idiomas (incluyendo español)
          responseAll.results?.forEach(movie => {
            if (!allMovies.has(movie.id)) {
              allMovies.set(movie.id, movie);
            }
          });
          
          const combinedResults = Array.from(allMovies.values());
          
          if (combinedResults.length === 0) {
            setSuggestions([]);
            setShowSuggestions(false);
            setSuggestionsLoading(false);
            return;
          }
          
          // Filtrar películas por calidad y relevancia (filtros más flexibles)
          let filteredMovies = combinedResults
            .filter(movie => {
              // Asegurar que tenga título
              if (!movie.title || movie.title.trim() === '') return false;
              
              // Asegurar que tenga fecha de lanzamiento
              if (!movie.release_date) return false;
              
              // Filtrar por rating mínimo (>= 4.0, más flexible)
              if (movie.vote_average < 4.0) return false;
              
              // Filtrar por popularidad mínima (>= 5, más flexible)
              if ((movie.popularity ?? 0) < 5) return false;
              
              return true;
            })
            // Ordenar por popularidad y rating (más relevantes primero)
            .sort((a, b) => {
              // Priorizar por popularidad, luego por rating
              if (Math.abs((b.popularity ?? 0) - (a.popularity ?? 0)) > 5) {
                return (b.popularity ?? 0) - (a.popularity ?? 0);
              }
              return b.vote_average - a.vote_average;
            });
          
          // Si después de filtrar no hay resultados, usar filtros más relajados
          if (filteredMovies.length === 0) {
            filteredMovies = combinedResults
              .filter(movie => {
                // Solo verificar que tenga título y fecha
                if (!movie.title || movie.title.trim() === '') return false;
                if (!movie.release_date) return false;
                // Rating mínimo más bajo (>= 3.0)
                if (movie.vote_average < 3.0) return false;
                return true;
              })
              .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
          }
          
          // Tomar solo las 5 mejores
          const suggestions = filteredMovies
            .slice(0, 5)
            .map(m => m.title);
          
          setSuggestions(suggestions);
          setShowSuggestions(suggestions.length > 0);
        } catch (error) {
          console.error('Error searching suggestions:', error);
          setSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setSuggestionsLoading(false);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [answer, gameState, difficulty]);

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Limpiar input cuando se reinicia el juego
  useEffect(() => {
    if (gameState === 'config') {
      setAnswer('');
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [gameState]);

  // Hacer scroll automático a la última pista revelada
  useEffect(() => {
    if (hintsContainerRef.current && revealedHints > 0) {
      // Pequeño delay para asegurar que el DOM se haya actualizado
      setTimeout(() => {
        if (hintsContainerRef.current) {
          hintsContainerRef.current.scrollTop = hintsContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [revealedHints]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    const isCorrect = checkAnswer(answer.trim());
    if (isCorrect) {
      setAnswer('');
      setShowSuggestions(false);
    } else {
      // El hook ya maneja revelar la siguiente pista
      setAnswer('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setAnswer(suggestion);
    setShowSuggestions(false);
    // Auto-submit cuando se selecciona una sugerencia
    const isCorrect = checkAnswer(suggestion);
    if (!isCorrect) {
      setAnswer('');
    }
  };

  if (gameState === 'config') {
    return (
      <div className="w-full py-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-dark mb-2">
            Movie Guess Game
          </h1>
          <p className="text-dark-medium">
            Guess the movie based on hints and the pixelated image
          </p>
        </div>
        <DifficultySelector onStart={startGame} loading={loading} />
        {error && (
          <div className="mt-6">
            <ErrorMessage message={error} />
          </div>
        )}
      </div>
    );
  }

  if (loading && !movie) {
    return (
      <div className="w-full py-8">
        <div className="flex justify-center items-center py-20">
          <Loading size="lg" message="Searching for movie..." />
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="w-full py-8">
        <ErrorMessage message="Could not load the movie. Please try again." />
        <div className="text-center mt-6">
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-dark text-beige-light rounded-xl font-medium hover:bg-dark/90 transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'won' || gameState === 'lost') {
    return (
      <div className="w-full py-8">
        <div className="max-w-3xl mx-auto">
          {/* Mensaje de resultado */}
          <div className="text-center mb-8">
            <h2 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-4 ${
              gameState === 'won' ? 'text-green-600' : 'text-red-600'
            }`}>
              {gameState === 'won' ? 'Congratulations! You won!' : 'Too bad! Better luck next time...'}
            </h2>
            <p className="text-dark-medium">
              {gameState === 'won' 
                ? `You guessed the movie using ${revealedHints} hint${revealedHints !== 1 ? 's' : ''}`
                : 'You couldn\'t guess the movie'
              }
            </p>
          </div>

          {/* Información de la película */}
          <div className="bg-beige-light border border-beige-medium rounded-2xl p-4 md:p-6 lg:p-8 mb-4 md:mb-6">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              {/* Poster */}
              {movie.poster_path && (
                <img
                  src={getImageUrl(movie.poster_path, 'w500')}
                  alt={movie.title}
                  className="w-full md:w-64 h-auto rounded-xl object-cover max-w-full"
                />
              )}

              {/* Información */}
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-dark mb-3 md:mb-4">
                  {movie.title}
                </h3>
                {movie.tagline && (
                  <p className="text-lg text-dark-medium italic mb-4">"{movie.tagline}"</p>
                )}
                {movie.release_date && (
                  <p className="text-dark-medium mb-2">
                    <strong>Year:</strong> {new Date(movie.release_date).getFullYear()}
                  </p>
                )}
                {movie.genres && movie.genres.length > 0 && (
                  <p className="text-dark-medium mb-2">
                    <strong>Genres:</strong> {movie.genres.map(g => g.name).join(', ')}
                  </p>
                )}
                {credits && (() => {
                  const director = credits.crew.find(person => person.job === 'Director');
                  return director ? (
                    <p className="text-dark-medium mb-2">
                      <strong>Director:</strong> {director.name}
                    </p>
                  ) : null;
                })()}
                {credits && credits.cast.length > 0 && (
                  <p className="text-dark-medium mb-2">
                    <strong>Main Cast:</strong> {credits.cast.slice(0, 3).map(actor => actor.name).join(', ')}
                  </p>
                )}
                {movie.vote_average > 0 && (
                  <p className="text-dark-medium mb-2">
                    <strong>Rating:</strong> {movie.vote_average.toFixed(1)}/10
                  </p>
                )}
                {movie.overview && (
                  <div className="mt-4">
                    <p className="text-dark-medium">
                      <strong>Overview:</strong>
                    </p>
                    <p className="text-dark-medium mt-2">{movie.overview}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botón volver a jugar */}
          <div className="text-center">
            <button
              onClick={resetGame}
              className="px-8 py-4 bg-dark text-beige-light rounded-xl font-medium hover:bg-dark/90 transition-colors text-lg"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header - Sin cambios */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-dark mb-2">
              Guess the Movie
            </h1>
            <p className="text-dark-medium">
              Hints revealed: {revealedHints}/{MAX_HINTS}
            </p>
          </div>
          <button
            onClick={giveUp}
            className="flex items-center gap-2 px-4 py-2 bg-beige-medium text-dark rounded-xl hover:bg-beige transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
            <span>Give Up</span>
          </button>
        </div>

        {/* Barra de progreso - Sin cambios */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-dark-medium">Revelation Progress</span>
            <span className="text-sm font-medium text-dark-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-3 bg-beige-medium rounded-full overflow-hidden">
            <div
              className="h-full bg-dark transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Layout principal: 3 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Columna Izquierda: Imagen pixelada */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative w-full max-w-xs">
              {movie.poster_path ? (
                <img
                  src={getImageUrl(movie.poster_path, 'w500')}
                  alt="Movie poster"
                  className="w-full rounded-2xl shadow-minimal-lg transition-all duration-500"
                  style={{
                    filter: `blur(${imageBlur}px)`,
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-beige-medium rounded-2xl flex items-center justify-center">
                  <span className="text-dark-light">No image available</span>
                </div>
              )}
            </div>
          </div>

          {/* Columna Centro: Input de texto + Dropdown */}
          <div className="flex flex-col items-center justify-center">
            <div ref={containerRef} className="relative w-full max-w-md" style={{ zIndex: 100 }}>
              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter the movie title..."
                    className="input pr-12 w-full text-lg py-4"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-dark text-beige-light rounded-lg hover:bg-dark/90 transition-colors"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {/* Sugerencias de autocompletado */}
              {showSuggestions && (suggestions.length > 0 || suggestionsLoading) && (
                <div 
                  className="absolute top-full left-0 right-0 mt-2 bg-beige-light border border-beige-medium rounded-2xl shadow-minimal-lg overflow-hidden dropdown-rounded z-40 max-h-64"
                  data-lenis-prevent
                  style={{ 
                    overscrollBehavior: 'contain',
                    WebkitOverflowScrolling: 'touch'
                  }}
                  onWheel={(e) => {
                    e.stopPropagation();
                  }}
                  onTouchMove={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <div className="max-h-64 overflow-y-auto custom-scrollbar py-2">
                    {suggestionsLoading ? (
                      <div className="px-4 py-3 text-center text-dark-medium">
                        Searching...
                      </div>
                    ) : (
                      suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full px-4 py-3 text-left text-dark hover:bg-beige transition-colors duration-200"
                        >
                          {suggestion}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Contador de intentos */}
            {attempts > 0 && (
              <div className="mt-4 text-center">
                <p className="text-dark-medium">
                  Attempts: {attempts}
                </p>
              </div>
            )}
          </div>

          {/* Columna Derecha: Pistas */}
          <div className="flex flex-col h-full">
            <h2 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
              <LightBulbIcon className="w-6 h-6" />
              Hints
            </h2>
            
            {/* Lista de pistas reveladas */}
            <div 
              ref={hintsContainerRef}
              className="flex-1 space-y-3 mb-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2"
              data-lenis-prevent
              style={{ 
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch'
              }}
              onWheel={(e) => {
                e.stopPropagation();
              }}
              onTouchMove={(e) => {
                e.stopPropagation();
              }}
            >
              {hints.filter(h => h.revealed).map((hint, index) => {
                const isNewHint = index === hints.filter(h => h.revealed).length - 1;
                return (
                  <div
                    key={hint.id}
                    className={`bg-beige-light border border-beige-medium rounded-xl p-4 ${
                      isNewHint ? 'animate-fadeIn' : ''
                    }`}
                  >
                    <p className="text-dark font-medium text-sm">{hint.content}</p>
                  </div>
                );
              })}
              {revealedHints === 0 && (
                <p className="text-dark-medium italic text-sm">No hints have been revealed yet. Try to guess or ask for a hint!</p>
              )}
            </div>

            {/* Botón para pedir pista */}
            {revealedHints < MAX_HINTS && (
              <button
                onClick={revealHint}
                disabled={revealedHints >= MAX_HINTS}
                className="w-full px-6 py-3 bg-beige-medium text-dark rounded-xl font-medium hover:bg-beige transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LightBulbIcon className="w-5 h-5" />
                <span>Ask for Hint ({revealedHints}/{MAX_HINTS})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MAX_HINTS = 12;

