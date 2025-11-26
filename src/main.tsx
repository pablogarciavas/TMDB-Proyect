import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { WatchlistProvider } from './contexts/WatchlistContext'
import { GenresProvider } from './contexts/GenresContext'
import './styles/index.css'

// Ocultar contenido crítico del HTML solo después de que React haya renderizado
const rootElement = document.getElementById('root')!

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <GenresProvider>
      <WatchlistProvider>
        <App />
      </WatchlistProvider>
    </GenresProvider>
  </React.StrictMode>,
)

