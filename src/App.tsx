import React, { useState } from 'react';
import { Header, SearchBar } from './components/common';
import { Movie } from './types/movie';

function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [currentView, setCurrentView] = useState<string>('home');
  const [currentGenre, setCurrentGenre] = useState<{ id: number; name: string } | null>(null);

  const handleGenreSelect = (genreId: number, genreName: string) => {
    console.log('Genre selected:', genreId, genreName);
    setCurrentGenre({ id: genreId, name: genreName });
    setCurrentView('genre');
    // Here you'll implement the logic to show movies by genre
  };

  const handleNavigate = (route: string) => {
    console.log('Navigating to:', route);
    if (route === 'home') {
      setCurrentView('home');
      setCurrentGenre(null);
      setSelectedMovie(null);
    } else {
      setCurrentView(route);
      setCurrentGenre(null);
    }
    // Here you'll implement navigation to different sections
  };

  const handleMovieSelect = (movie: Movie) => {
    console.log('Movie selected:', movie);
    setSelectedMovie(movie);
    // Here you'll implement the movie detail view
  };

  return (
    <div className="min-h-screen bg-beige flex flex-col">
      <Header onGenreSelect={handleGenreSelect} onNavigate={handleNavigate} />
      
      <main className="flex-1 flex items-center justify-center">
        <div className="container-elegant w-full">
          {currentView === 'home' && (
            <>
              {/* Search bar centered vertically */}
              <div className="animate-fadeInUp opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                <SearchBar onMovieSelect={handleMovieSelect} />
              </div>
              
              <div className="text-center mt-8 animate-fadeInUp opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                <p className="text-dark-medium text-lg md:text-xl max-w-2xl mx-auto">
                  Search for your favorite movie in the search bar
                </p>
              </div>
            </>
          )}

          {/* Contenido de otras vistas */}
          {currentView !== 'home' && (
            <div className="animate-fadeInUp opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>

              {currentView === 'genre' && currentGenre && (
                <div className="text-center py-12">
                  <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">
                    Genre: {currentGenre.name}
                  </h2>
                  <p className="text-dark-medium">
                    Feature in development...
                  </p>
                </div>
              )}

              {currentView === 'top-rated' && (
                <div className="text-center py-12">
                  <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">
                    Top Rated
                  </h2>
                  <p className="text-dark-medium">
                    Feature in development...
                  </p>
                </div>
              )}

              {currentView === 'favorites' && (
                <div className="text-center py-12">
                  <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">
                    Favorites
                  </h2>
                  <p className="text-dark-medium">
                    Feature in development...
                  </p>
                </div>
              )}

              {currentView === 'watchlist' && (
                <div className="text-center py-12">
                  <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">
                    Watchlist
                  </h2>
                  <p className="text-dark-medium">
                    Feature in development...
                  </p>
                </div>
              )}

              {currentView === 'upcoming' && (
                <div className="text-center py-12">
                  <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">
                    Upcoming
                  </h2>
                  <p className="text-dark-medium">
                    Feature in development...
                  </p>
                </div>
              )}

              {currentView === 'minigame' && (
                <div className="text-center py-12">
                  <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">
                    Minigame
                  </h2>
                  <p className="text-dark-medium">
                    Feature in development...
                  </p>
                </div>
              )}

              {selectedMovie && (
                <div className="max-w-4xl mx-auto mt-8 p-6 bg-beige-light rounded-2xl border border-beige-medium">
                  <h2 className="text-2xl font-bold text-dark mb-4">{selectedMovie.title}</h2>
                  <p className="text-dark-medium">{selectedMovie.overview}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

