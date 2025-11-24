import React, { useState, useMemo } from 'react';
import { Difficulty, GameConfig } from '../../hooks/useMovieGuessGame';
import { useGenres } from '../../contexts/GenresContext';
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
  const { genres: allGenres } = useGenres();
  const [selectedYearRangeEasy, setSelectedYearRangeEasy] = useState<{ start: number; end: number }>({
    start: 2021,
    end: 2025,
  });
  const [selectedYearRange, setSelectedYearRange] = useState<{ start: number; end: number }>({
    start: 2000,
    end: 2010,
  });
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

  // Ordenar géneros alfabéticamente
  const genres = useMemo(() => {
    return [...allGenres].sort((a, b) => a.name.localeCompare(b.name));
  }, [allGenres]);

  // Generar rangos de años por décadas
  const currentYear = new Date().getFullYear();
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
      config.yearRange = selectedYearRangeEasy;
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
                Release Year Range
              </label>
              <Select
                value={`${selectedYearRangeEasy.start}-${selectedYearRangeEasy.end}`}
                onChange={(value) => {
                  const [start, end] = value.split('-').map(Number);
                  setSelectedYearRangeEasy({ start, end });
                }}
                options={yearRanges.map(range => ({
                  value: `${range.start}-${range.end}`,
                  label: range.label,
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

