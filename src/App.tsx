import React, { useState } from 'react';
import { Header, SearchBar } from './components/common';
import { MovieListPage, MovieDetail } from './components/movie';
import { Movie } from './types/movie';
import { useSmoothScroll } from './hooks/useSmoothScroll';

function App() {
  // Enable smooth scroll with momentum
  useSmoothScroll();
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<string>('home');
  const [currentGenre, setCurrentGenre] = useState<{ id: number; name: string } | null>(null);

  const handleGenreSelect = (genreId: number, genreName: string) => {
    console.log('Genre selected:', genreId, genreName);
    setSelectedMovieId(null); // Clear selected movie when navigating to genre
    setCurrentGenre({ id: genreId, name: genreName });
    setCurrentView('genre');
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (route: string) => {
    console.log('Navigating to:', route);
    if (route === 'home') {
      setCurrentView('home');
      setCurrentGenre(null);
      setSelectedMovieId(null);
    } else {
      setCurrentView(route);
      setCurrentGenre(null);
      setSelectedMovieId(null);
    }
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMovieSelect = (movie: Movie) => {
    console.log('Movie selected:', movie);
    setSelectedMovieId(movie.id);
    setCurrentView('movie-detail');
    // Scroll to top when navigating to movie detail
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromDetail = () => {
    if (currentGenre) {
      setCurrentView('genre');
      setSelectedMovieId(null);
    } else {
      setCurrentView('home');
      setSelectedMovieId(null);
    }
    // Scroll to top when going back
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-beige flex flex-col">
      <Header onGenreSelect={handleGenreSelect} onNavigate={handleNavigate} />
      
      <main className={`flex-1 ${currentView === 'home' ? 'flex items-center justify-center' : ''}`}>
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
            <div className="animate-fadeInUp opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>

              {currentView === 'movie-detail' && selectedMovieId && (
                <MovieDetail
                  movieId={selectedMovieId}
                  onBack={handleBackFromDetail}
                  onMovieClick={handleMovieSelect}
                />
              )}

              {currentView === 'genre' && currentGenre && !selectedMovieId && (
                <MovieListPage
                  genreId={currentGenre.id}
                  genreName={currentGenre.name}
                  onMovieClick={handleMovieSelect}
                />
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

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

