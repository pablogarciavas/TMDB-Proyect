import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { WatchlistProvider } from './contexts/WatchlistContext'
import { GenresProvider } from './contexts/GenresContext'
import './styles/index.css'

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

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const criticalHeader = document.getElementById('critical-header')
    const criticalMain = document.getElementById('critical-main')
    if (criticalHeader) criticalHeader.remove()
    if (criticalMain) criticalMain.remove()
  })
})

