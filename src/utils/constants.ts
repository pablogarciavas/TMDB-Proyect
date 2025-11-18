// Constantes del proyecto

export const TMDB_CONFIG = {
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  IMAGE_SIZES: {
    POSTER: {
      SMALL: 'w185',
      MEDIUM: 'w500',
      LARGE: 'w780',
      ORIGINAL: 'original',
    },
    BACKDROP: {
      SMALL: 'w300',
      MEDIUM: 'w780',
      LARGE: 'w1280',
      ORIGINAL: 'original',
    },
  },
} as const;

export const APP_CONFIG = {
  NAME: 'MovieDB',
  DESCRIPTION: 'Aplicación para explorar películas usando The Movie Database API',
  DEFAULT_PAGE: 1,
  MOVIES_PER_PAGE: 20,
} as const;

