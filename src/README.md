# Estructura del Proyecto

Esta carpeta contiene todo el código fuente de la aplicación.

## 📁 Estructura de Carpetas

```
src/
├── components/          # Componentes React
│   ├── common/         # Componentes comunes (Header, Footer, Layout)
│   ├── movie/          # Componentes específicos de películas
│   └── ui/             # Componentes UI básicos (Button, Loading, etc.)
│
├── hooks/              # Custom hooks reutilizables
│   └── useMovies.ts    # Hook para manejar lógica de películas
│
├── services/           # Servicios API y externos
│   └── tmdbApi.ts     # Servicio para consumir la API de TMDB
│
├── types/              # Definiciones TypeScript
│   └── movie.ts       # Tipos relacionados con películas
│
├── utils/              # Funciones auxiliares
│   ├── constants.ts   # Constantes del proyecto
│   └── formatters.ts  # Funciones de formateo
│
├── assets/             # Recursos estáticos
│   └── images/        # Imágenes e iconos
│
├── styles/             # Estilos globales
│   └── index.css      # Estilos principales con Tailwind
│
├── App.tsx             # Componente principal
└── main.tsx            # Punto de entrada de la aplicación
```

## 📝 Convenciones

### Componentes
- Los componentes se organizan por dominio/funcionalidad
- Cada componente debe estar en su propio archivo
- Usar archivos `index.ts` para exportaciones centralizadas

### Hooks
- Los custom hooks deben empezar con `use`
- Un hook por archivo
- Exportar desde `hooks/index.ts` para facilitar importaciones

### Utilidades
- Funciones puras y reutilizables
- Separar por responsabilidad (formatters, validators, etc.)
- Exportar desde `utils/index.ts`

### Servicios
- Un servicio por API o recurso externo
- Encapsular toda la lógica de comunicación con APIs
- Manejar errores y transformaciones de datos

### Tipos
- Un archivo por dominio (movie, user, etc.)
- Usar interfaces para objetos y types para uniones
- Exportar tipos relacionados juntos

