import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { WatchlistProvider } from './contexts/WatchlistContext'
import { GenresProvider } from './contexts/GenresContext'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GenresProvider>
      <WatchlistProvider>
        <App />
      </WatchlistProvider>
    </GenresProvider>
  </React.StrictMode>,
)

