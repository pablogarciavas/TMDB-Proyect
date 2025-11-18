# 🎬 MovieDB - The Movie Database App

Una aplicación web moderna y responsive para explorar películas utilizando la API de The Movie Database (TMDB). Este proyecto fue desarrollado como parte de mi portfolio personal.

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.0.8-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.6-38B2AC?logo=tailwind-css)

## ✨ Características

- 🎯 **Búsqueda en tiempo real** - Busca películas instantáneamente
- 🎨 **Diseño moderno y responsive** - Optimizado para todos los dispositivos
- ⭐ **Información detallada** - Visualiza detalles completos de cada película
- 🚀 **Rendimiento optimizado** - Carga rápida con Vite
- 📱 **Mobile-first** - Experiencia perfecta en móviles y tablets

## 🛠️ Tecnologías Utilizadas

- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de CSS utility-first
- **Axios** - Cliente HTTP
- **The Movie Database API** - Fuente de datos

## 📋 Prerrequisitos

- Node.js (versión 18 o superior)
- npm o yarn
- API Key de The Movie Database ([obtener aquí](https://www.themoviedb.org/settings/api))

## 🚀 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd ProyectoAPI
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` en la raíz del proyecto:
```env
VITE_TMDB_API_KEY=tu_api_key_aqui
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

5. Abre tu navegador en `http://localhost:5173`

## 📜 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción

## 🏗️ Estructura del Proyecto

```
ProyectoAPI/
├── public/              # Archivos estáticos
├── src/
│   ├── components/      # Componentes React
│   ├── services/        # Servicios API
│   │   └── tmdbApi.ts
│   ├── types/           # Definiciones TypeScript
│   │   └── movie.ts
│   ├── App.tsx          # Componente principal
│   ├── main.tsx         # Punto de entrada
│   └── index.css        # Estilos globales
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🔐 Variables de Entorno

Crea un archivo `.env` con la siguiente variable:

```
VITE_TMDB_API_KEY=tu_api_key_de_tmdb
```

**⚠️ Importante:** Nunca subas tu archivo `.env` al repositorio. Está incluido en `.gitignore`.

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Laptops (1024px+)
- 🖥️ Desktops (1280px+)

## 🤝 Contribuciones

Este es un proyecto de portfolio personal, pero las sugerencias y mejoras son bienvenidas. Siéntete libre de abrir un issue o un pull request.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Tu Nombre**
- Portfolio: [tu-portfolio.com](https://tu-portfolio.com)
- LinkedIn: [tu-linkedin](https://linkedin.com/in/tu-perfil)
- GitHub: [@tu-usuario](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- [The Movie Database](https://www.themoviedb.org/) por proporcionar la API
- Comunidad de React y TypeScript

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!

