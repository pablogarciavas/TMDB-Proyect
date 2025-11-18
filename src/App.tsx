import React, { useEffect, useState } from 'react'
import { tmdbApi } from './services/tmdbApi'
import { Movie } from './types/movie'
import { Loading } from './components/ui/Loading'
import { ErrorMessage } from './components/ui/ErrorMessage'
import { formatRating, getYear } from './utils/formatters'

function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [movies, setMovies] = useState<Movie[]>([])
  const [apiStatus, setApiStatus] = useState<string>('Probando conexión...')

  useEffect(() => {
    const testApi = async () => {
      try {
        setApiStatus('🔄 Conectando con TMDB API...')
        console.log('🔍 Iniciando prueba de API...')
        console.log('📋 API Key configurada:', import.meta.env.VITE_TMDB_API_KEY ? '✅ Sí' : '❌ No')
        
        const response = await tmdbApi.getPopularMovies(1)
        
        console.log('✅ API funcionando correctamente!')
        console.log('📊 Datos recibidos:', response)
        console.log(`🎬 Total de películas: ${response.results.length}`)
        
        setMovies(response.results.slice(0, 5)) // Mostrar solo las primeras 5
        setApiStatus('✅ API conectada correctamente!')
        setLoading(false)
      } catch (err: any) {
        console.error('❌ Error al conectar con la API:', err)
        setError(err.message || 'Error desconocido')
        setApiStatus('❌ Error al conectar con la API')
        setLoading(false)
      }
    }

    testApi()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          🎬 MovieDB
        </h1>
        
        {/* Estado de la API */}
        <div className="max-w-2xl mx-auto mb-8 p-4 rounded-lg bg-gray-800">
          <h2 className="text-xl font-semibold mb-2">Estado de la API:</h2>
          <p className={loading ? 'text-yellow-400' : error ? 'text-red-400' : 'text-green-400'}>
            {apiStatus}
          </p>
          {error && (
            <p className="text-red-400 text-sm mt-2">
              Detalles: {error}
            </p>
          )}
        </div>

        {/* Instrucciones para verificar en el navegador */}
        <div className="max-w-2xl mx-auto mb-8 p-4 rounded-lg bg-blue-900 bg-opacity-30 border border-blue-500">
          <h3 className="text-lg font-semibold mb-2">🔍 Cómo verificar en el navegador:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
            <li>Abre las <strong>DevTools</strong> (F12 o clic derecho → Inspeccionar)</li>
            <li>Ve a la pestaña <strong>"Console"</strong> para ver los logs</li>
            <li>Ve a la pestaña <strong>"Network"</strong> para ver las peticiones HTTP</li>
            <li>Busca peticiones a <code className="bg-gray-700 px-1 rounded">api.themoviedb.org</code></li>
          </ol>
        </div>

        {/* Mostrar películas de prueba si la API funciona */}
        {!loading && !error && movies.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">🎬 Películas populares (prueba):</h2>
            <div className="space-y-3">
              {movies.map((movie) => (
                <div key={movie.id} className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold">{movie.title}</h3>
                  <p className="text-sm text-gray-400">
                    ⭐ {formatRating(movie.vote_average)} | 📅 {getYear(movie.release_date)}
                  </p>
                  <p className="text-sm text-gray-300 mt-2 line-clamp-2">{movie.overview}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

