import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { tmdbApi } from '../services/tmdbApi';
import { MovieDetails, Credits } from '../types/movieDetails';
import { Movie, MovieResponse } from '../types/movie';
import { TMDB_CONFIG } from '../utils/constants';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameConfig {
  difficulty: Difficulty;
  year?: number;
  yearRange?: { start: number; end: number };
  genreId?: number;
}

export interface Hint {
  id: number;
  type: 'year' | 'genres' | 'director' | 'actors' | 'overview' | 'tagline' | 'rating';
  content: string;
  revealed: boolean;
}

interface UseMovieGuessGameReturn {
  movie: MovieDetails | null;
  credits: Credits | null;
  hints: Hint[];
  revealedHints: number;
  imageBlur: number;
  progress: number;
  gameState: 'config' | 'playing' | 'won' | 'lost';
  attempts: number;
  difficulty: Difficulty | null;
  loading: boolean;
  error: string | null;
  startGame: (config: GameConfig) => Promise<void>;
  revealHint: () => void;
  checkAnswer: (answer: string) => boolean;
  giveUp: () => void;
  resetGame: () => void;
}

const BLUR_LEVELS = [20, 15, 10, 5, 0]; // 5 niveles de blur
const MAX_HINTS = 12;

export const useMovieGuessGame = (): UseMovieGuessGameReturn => {
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [hints, setHints] = useState<Hint[]>([]);
  const [revealedHints, setRevealedHints] = useState(0);
  const [gameState, setGameState] = useState<'config' | 'playing' | 'won' | 'lost'>('config');
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<GameConfig | null>(null);

  // Calcular blur basado en pistas reveladas
  const imageBlur = BLUR_LEVELS[Math.min(Math.floor(revealedHints / 3), BLUR_LEVELS.length - 1)];
  const progress = Math.min((revealedHints / MAX_HINTS) * 100, 100);

  // Normalizar texto para comparación
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/^(the|a|an|el|la|los|las|un|una|unos|unas)\s+/i, '') // Eliminar artículos al inicio
      .replace(/\s+/g, '') // Eliminar TODOS los espacios (incluidos espacios internos)
      .replace(/[^\w]/g, '') // Eliminar todos los caracteres especiales (guiones, dos puntos, etc.)
      .trim();
  };

  // Verificar si la respuesta es correcta (flexible)
  const checkAnswer = useCallback((answer: string): boolean => {
    if (!movie) return false;

    const normalizedAnswer = normalizeText(answer);
    const normalizedTitle = normalizeText(movie.title);

    // Comparación exacta (después de normalizar)
    if (normalizedAnswer === normalizedTitle) return true;

    // Comparación parcial (si la respuesta contiene el título o viceversa)
    if (normalizedTitle.includes(normalizedAnswer) || normalizedAnswer.includes(normalizedTitle)) {
      // Verificar que la coincidencia sea significativa (al menos 70% del título más corto)
      const minLength = Math.min(normalizedTitle.length, normalizedAnswer.length);
      const maxLength = Math.max(normalizedTitle.length, normalizedAnswer.length);
      if (minLength / maxLength >= 0.7) return true;
    }

    // Comparación por similitud de caracteres (para casos como "Bad Boys" vs "Badboys")
    // Si después de eliminar espacios y caracteres especiales, los caracteres son los mismos
    const answerChars = normalizedAnswer.split('').sort().join('');
    const titleChars = normalizedTitle.split('').sort().join('');
    
    // Si tienen los mismos caracteres (ignorando orden), considerar válido
    if (answerChars === titleChars && normalizedAnswer.length > 0) {
      return true;
    }

    // Comparación por distancia de Levenshtein simplificada (para errores tipográficos menores)
    const maxLength = Math.max(normalizedTitle.length, normalizedAnswer.length);
    if (maxLength === 0) return false;
    
    let differences = 0;
    const minLength = Math.min(normalizedTitle.length, normalizedAnswer.length);
    
    // Contar diferencias de caracteres
    for (let i = 0; i < minLength; i++) {
      if (normalizedTitle[i] !== normalizedAnswer[i]) {
        differences++;
      }
    }
    
    // Agregar diferencias por longitud
    differences += Math.abs(normalizedTitle.length - normalizedAnswer.length);
    
    // Permitir hasta 1-2 diferencias dependiendo de la longitud
    const allowedDifferences = maxLength <= 5 ? 1 : Math.min(2, Math.floor(maxLength * 0.1));
    
    if (differences <= allowedDifferences) {
      return true;
    }

    return false;
  }, [movie]);

  // Generar pistas según la dificultad
  const generateHints = useCallback((movieData: MovieDetails, credits: Credits, difficulty: Difficulty, config: GameConfig): Hint[] => {
    const hintsList: Hint[] = [];
    let hintId = 1;

    // Año (solo en media y difícil)
    if (difficulty !== 'easy' && movieData.release_date) {
      const year = new Date(movieData.release_date).getFullYear();
      hintsList.push({
        id: hintId++,
        type: 'year',
        content: `Year: ${year}`,
        revealed: false,
      });
    }

    // Géneros individuales (solo en media y difícil) - Dividir en pistas individuales
    if (difficulty !== 'easy' && movieData.genres && movieData.genres.length > 0) {
      movieData.genres.forEach(genre => {
        hintsList.push({
          id: hintId++,
          type: 'genres',
          content: `Genre: ${genre.name}`,
          revealed: false,
        });
      });
    }

    // Director
    const director = credits.crew.find(person => person.job === 'Director');
    if (director) {
      hintsList.push({
        id: hintId++,
        type: 'director',
        content: `Director: ${director.name}`,
        revealed: false,
      });
    }

    // Actores principales individuales (top 5-6) - Dividir en pistas individuales
    const topActors = credits.cast.slice(0, 6);
    topActors.forEach(actor => {
      hintsList.push({
        id: hintId++,
        type: 'actors',
        content: `Actor: ${actor.name}`,
        revealed: false,
      });
    });

    // Rating
    if (movieData.vote_average > 0) {
      hintsList.push({
        id: hintId++,
        type: 'rating',
        content: `Rating: ${movieData.vote_average.toFixed(1)}/10`,
        revealed: false,
      });
    }

    // Tagline
    if (movieData.tagline) {
      hintsList.push({
        id: hintId++,
        type: 'tagline',
        content: `Tagline: "${movieData.tagline}"`,
        revealed: false,
      });
    }

    // Runtime (duración)
    if (movieData.runtime && movieData.runtime > 0) {
      const hours = Math.floor(movieData.runtime / 60);
      const minutes = movieData.runtime % 60;
      const runtimeText = hours > 0 
        ? `${hours}h ${minutes}min`
        : `${minutes}min`;
      hintsList.push({
        id: hintId++,
        type: 'rating', // Reutilizamos el tipo rating para runtime
        content: `Runtime: ${runtimeText}`,
        revealed: false,
      });
    }

    // Production Companies
    if (movieData.production_companies && movieData.production_companies.length > 0) {
      // Agregar hasta 3 compañías principales
      movieData.production_companies.slice(0, 3).forEach(company => {
        hintsList.push({
          id: hintId++,
          type: 'genres', // Reutilizamos el tipo genres para companies
          content: `Studio: ${company.name}`,
          revealed: false,
        });
      });
    }

    // Sinopsis dividida en dos mitades (guardar por separado para mantener orden)
    let overviewPart1: Hint | null = null;
    let overviewPart2: Hint | null = null;
    
    if (movieData.overview && movieData.overview.length > 50) {
      const midPoint = Math.floor(movieData.overview.length / 2);
      // Buscar un punto de corte natural (espacio o punto)
      let cutPoint = midPoint;
      for (let i = midPoint; i < midPoint + 50 && i < movieData.overview.length; i++) {
        if (movieData.overview[i] === '.' || movieData.overview[i] === ' ') {
          cutPoint = i + 1;
          break;
        }
      }
      
      const firstHalf = movieData.overview.substring(0, cutPoint).trim();
      const secondHalf = movieData.overview.substring(cutPoint).trim();
      
      if (firstHalf) {
        overviewPart1 = {
          id: hintId++,
          type: 'overview',
          content: `Overview (Part 1): ${firstHalf}${firstHalf.endsWith('.') ? '' : '...'}`,
          revealed: false,
        };
      }
      
      if (secondHalf) {
        overviewPart2 = {
          id: hintId++,
          type: 'overview',
          content: `Overview (Part 2): ${secondHalf}`,
          revealed: false,
        };
      }
    } else if (movieData.overview) {
      // Si la sinopsis es muy corta, mantenerla como una sola pista
      hintsList.push({
        id: hintId++,
        type: 'overview',
        content: `Overview: ${movieData.overview}`,
        revealed: false,
      });
    }

    // Mezclar las pistas (excepto las partes de sinopsis que mantendremos en orden)
    const shuffled = hintsList.sort(() => Math.random() - 0.5);

    // Insertar las partes de sinopsis manteniendo el orden (Part 1 antes de Part 2)
    if (overviewPart1 && overviewPart2) {
      // Encontrar una posición aleatoria para insertar la primera parte
      const insertPosition = Math.floor(Math.random() * (shuffled.length + 1));
      shuffled.splice(insertPosition, 0, overviewPart1);
      
      // Insertar la segunda parte después de la primera (en una posición posterior)
      const part1Index = shuffled.findIndex(h => h.id === overviewPart1!.id);
      const secondInsertPosition = part1Index + 1 + Math.floor(Math.random() * (shuffled.length - part1Index));
      shuffled.splice(secondInsertPosition, 0, overviewPart2);
    } else if (overviewPart1) {
      // Si solo hay primera parte, insertarla aleatoriamente
      const insertPosition = Math.floor(Math.random() * (shuffled.length + 1));
      shuffled.splice(insertPosition, 0, overviewPart1);
    } else if (overviewPart2) {
      // Si solo hay segunda parte, insertarla aleatoriamente
      const insertPosition = Math.floor(Math.random() * (shuffled.length + 1));
      shuffled.splice(insertPosition, 0, overviewPart2);
    }

    // Si tenemos más de MAX_HINTS, tomar solo las primeras MAX_HINTS
    // Si tenemos menos, está bien, no repetimos
    return shuffled.slice(0, MAX_HINTS);
  }, []);

  // Buscar película según configuración
  const findMovie = useCallback(async (gameConfig: GameConfig): Promise<MovieDetails | null> => {
    const maxAttempts = 50;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        let movie: Movie | null = null;

        if (gameConfig.difficulty === 'easy') {
          // Fácil: rango de años + género, rating > 7
          const discoverParams: any = {
            'primary_release_date.gte': `${gameConfig.yearRange!.start}-01-01`,
            'primary_release_date.lte': `${gameConfig.yearRange!.end}-12-31`,
            with_genres: gameConfig.genreId,
            'vote_average.gte': 7,
            sort_by: 'popularity.desc',
            page: Math.floor(Math.random() * 10) + 1, // Página aleatoria
          };

          const response = await tmdbApi.getMoviesByGenre(gameConfig.genreId!, 1, discoverParams);
          if (response.results.length > 0) {
            movie = response.results[Math.floor(Math.random() * response.results.length)];
          }
        } else if (gameConfig.difficulty === 'medium') {
          // Media: rango de años, rating > 6
          const discoverParams: any = {
            'primary_release_date.gte': `${gameConfig.yearRange!.start}-01-01`,
            'primary_release_date.lte': `${gameConfig.yearRange!.end}-12-31`,
            'vote_average.gte': 6,
            sort_by: 'popularity.desc',
            page: Math.floor(Math.random() * 10) + 1,
          };

          // Usar discover directamente sin género
          const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
          const { data } = await axios.get<MovieResponse>(`${TMDB_CONFIG.BASE_URL}/discover/movie`, {
            params: {
              ...discoverParams,
              api_key: API_KEY,
              language: 'en-US',
            },
          });
          
          if (data.results.length > 0) {
            movie = data.results[Math.floor(Math.random() * data.results.length)];
          }
        } else {
          // Difícil: aleatoria, rating > 5
          const page = Math.floor(Math.random() * 100) + 1;
          const response = await tmdbApi.getPopularMovies(page);
          const filtered = response.results.filter(m => m.vote_average >= 5);
          if (filtered.length > 0) {
            movie = filtered[Math.floor(Math.random() * filtered.length)];
          }
        }

        if (movie) {
          // Obtener detalles completos
          const [details, credits] = await Promise.all([
            tmdbApi.getMovieDetails(movie.id),
            tmdbApi.getMovieCredits(movie.id),
          ]);

          // Verificar que tenga datos suficientes
          const hasPoster = !!details.poster_path;
          const hasDirector = credits.crew.some(p => p.job === 'Director');
          const hasActors = credits.cast.length >= 3;
          const hasOverview = !!details.overview && details.overview.length > 50;

          if (hasPoster && hasDirector && hasActors && hasOverview) {
            return details;
          }
        }
      } catch (err) {
        console.error('Error finding movie:', err);
      }

      attempts++;
      // Pequeño delay entre intentos
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return null;
  }, []);

  // Iniciar juego
  const startGame = useCallback(async (gameConfig: GameConfig) => {
    setLoading(true);
    setError(null);
    setConfig(gameConfig);
    setGameState('playing');
    setRevealedHints(0);
    setAttempts(0);
    setHints([]);

    try {
      const movieData = await findMovie(gameConfig);
      
      if (!movieData) {
        setError('Could not find a valid movie. Please try again.');
        setGameState('config');
        setLoading(false);
        return;
      }

      // Obtener créditos
      const movieCredits = await tmdbApi.getMovieCredits(movieData.id);

      // Generar pistas
      const generatedHints = generateHints(movieData, movieCredits, gameConfig.difficulty, gameConfig);
      
      setMovie(movieData);
      setCredits(movieCredits);
      setHints(generatedHints);
      setGameState('playing');
    } catch (err: any) {
      console.error('Error starting game:', err);
      setError(err.message || 'Error starting the game');
      setGameState('config');
    } finally {
      setLoading(false);
    }
  }, [findMovie, generateHints]);

  // Revelar siguiente pista
  const revealHint = useCallback(() => {
    if (revealedHints >= MAX_HINTS || gameState !== 'playing') return;

    setHints(prev => {
      const newHints = [...prev];
      if (newHints[revealedHints]) {
        newHints[revealedHints].revealed = true;
      }
      return newHints;
    });

    setRevealedHints(prev => prev + 1);

    // Si se revelaron todas las pistas, perder
    if (revealedHints + 1 >= MAX_HINTS) {
      setGameState('lost');
    }
  }, [revealedHints, gameState]);

  // Verificar respuesta
  const handleCheckAnswer = useCallback((answer: string): boolean => {
    if (!movie || gameState !== 'playing') return false;

    const isCorrect = checkAnswer(answer);
    
    if (isCorrect) {
      setGameState('won');
      return true;
    } else {
      setAttempts(prev => prev + 1);
      // Revelar siguiente pista automáticamente después de un intento fallido (1 intento = 1 pista)
      if (revealedHints < MAX_HINTS) {
        setHints(prev => {
          const newHints = [...prev];
          if (newHints[revealedHints]) {
            newHints[revealedHints].revealed = true;
          }
          return newHints;
        });
        setRevealedHints(prev => {
          const newCount = prev + 1;
          // Si se revelaron todas las pistas, perder
          if (newCount >= MAX_HINTS) {
            setGameState('lost');
          }
          return newCount;
        });
      } else {
        // Si ya se revelaron todas las pistas, perder
        setGameState('lost');
      }
      return false;
    }
  }, [movie, gameState, checkAnswer, revealedHints]);

  // Rendirse
  const giveUp = useCallback(() => {
    setGameState('lost');
  }, []);

  // Reiniciar juego
  const resetGame = useCallback(() => {
    setMovie(null);
    setCredits(null);
    setHints([]);
    setRevealedHints(0);
    setGameState('config');
    setAttempts(0);
    setError(null);
    setConfig(null);
  }, []);

  return {
    movie,
    credits,
    hints,
    revealedHints,
    imageBlur,
    progress,
    gameState,
    attempts,
    difficulty: config?.difficulty || null,
    loading,
    error,
    startGame,
    revealHint,
    checkAnswer: handleCheckAnswer,
    giveUp,
    resetGame,
  };
};

