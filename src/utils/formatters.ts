// Funciones auxiliares para formateo

/**
 * Formatea una fecha a formato legible
 */
export const formatDate = (dateString: string, locale: string = 'es-ES'): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Obtiene solo el año de una fecha
 */
export const getYear = (dateString: string): number => {
  return new Date(dateString).getFullYear();
};

/**
 * Formatea un número de votos a formato legible
 */
export const formatVoteCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

/**
 * Formatea el rating a un decimal
 */
export const formatRating = (rating: number, decimals: number = 1): string => {
  return rating.toFixed(decimals);
};

