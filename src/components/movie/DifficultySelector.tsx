import React, { useState, useEffect } from 'react';
import { Difficulty, GameConfig } from '../../hooks/useMovieGuessGame';
import { tmdbApi } from '../../services/tmdbApi';
import { Genre } from '../../types/genre';
import { Select } from '../ui/Select';

interface DifficultySelectorProps {
  onStart: (config: GameConfig) => void;
  loading?: boolean;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  onStart,
  loading = false,
}) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedYearRange, setSelectedYearRange] = useState<{ start: number; end: number }>({
    start: 2000,
    end: 2010,
  });
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

  // Cargar géneros
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const response = await tmdbApi.getGenres();
        setGenres(response.genres.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Error loading genres:', error);
      }
    };
    loadGenres();
  }, []);

  // Generar años disponibles (desde 1900 hasta el año actual)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);

  // Generar rangos de años por décadas
  const yearRanges: { start: number; end: number; label: string }[] = [];
  for (let start = 1900; start <= currentYear; start += 10) {
    const end = Math.min(start + 9, currentYear);
    yearRanges.push({
      start,
      end,
      label: `${start}-${end}`,
    });
  }

  const handleStart = () => {
    if (difficulty === 'easy' && !selectedGenre) {
      alert('Please select a genre');
      return;
    }

    const config: GameConfig = {
      difficulty,
    };

    if (difficulty === 'easy') {
      config.year = selectedYear;
      config.genreId = selectedGenre!;
    } else if (difficulty === 'medium') {
      config.yearRange = selectedYearRange;
    }

    onStart(config);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-beige-light border border-beige-medium rounded-2xl p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-dark mb-2">Select Difficulty</h2>
          <p className="text-dark-medium">Choose the difficulty level for the minigame</p>
        </div>

        {/* Selector de dificultad */}
        <div>
          <label className="block text-sm font-medium text-dark mb-2">
            Difficulty
          </label>
          <Select
            value={difficulty}
            onChange={(value) => setDifficulty(value as Difficulty)}
            options={[
              { value: 'easy', label: 'Easy' },
              { value: 'medium', label: 'Medium' },
              { value: 'hard', label: 'Hard' },
            ]}
            className="w-full"
          />
        </div>

        {/* Configuración para Fácil */}
        {difficulty === 'easy' && (
          <>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Release Year
              </label>
              <Select
                value={selectedYear.toString()}
                onChange={(value) => setSelectedYear(parseInt(value))}
                options={years.map(year => ({
                  value: year.toString(),
                  label: year.toString(),
                }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Genre
              </label>
              <Select
                value={selectedGenre?.toString() || ''}
                onChange={(value) => setSelectedGenre(value ? parseInt(value) : null)}
                placeholder="Select a genre"
                options={[
                  { value: '', label: 'Select a genre' },
                  ...genres.map(genre => ({
                    value: genre.id.toString(),
                    label: genre.name,
                  })),
                ]}
                className="w-full"
              />
            </div>
          </>
        )}

        {/* Configuración para Media */}
        {difficulty === 'medium' && (
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Year Range
            </label>
            <Select
              value={`${selectedYearRange.start}-${selectedYearRange.end}`}
              onChange={(value) => {
                const [start, end] = value.split('-').map(Number);
                setSelectedYearRange({ start, end });
              }}
              options={yearRanges.map(range => ({
                value: `${range.start}-${range.end}`,
                label: range.label,
              }))}
              className="w-full"
            />
          </div>
        )}

        {/* Información para Difícil */}
        {difficulty === 'hard' && (
          <div className="bg-beige-medium/50 rounded-xl p-4">
            <p className="text-dark-medium text-sm">
              In Hard mode, the movie will be completely random. Good luck!
            </p>
          </div>
        )}

        {/* Botón de inicio */}
        <button
          onClick={handleStart}
          disabled={loading || (difficulty === 'easy' && !selectedGenre)}
          className="w-full px-6 py-3 bg-dark text-beige-light rounded-xl font-medium hover:bg-dark/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Start Game'}
        </button>
      </div>
    </div>
  );
};

