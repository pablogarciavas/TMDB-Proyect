import React, { useState } from 'react';
import { Header, SearchBar } from './components/common';
import { MovieListPage, MovieDetail, PersonMoviesPage, CompanyMoviesPage, WatchlistPage, UpcomingPage, MovieGuessGame } from './components/movie';
import { Movie } from './types/movie';
import { Person } from './types/person';
import { Company } from './types/company';
import { useSmoothScroll, scrollTo } from './hooks/useSmoothScroll';

function App() {
  // Enable smooth scroll with Lenis
  useSmoothScroll();
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<string>('home');
  const [currentGenre, setCurrentGenre] = useState<{ id: number; name: string } | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handleGenreSelect = (genreId: number, genreName: string) => {
    console.log('Genre selected:', genreId, genreName);
    setSelectedMovieId(null); // Clear selected movie when navigating to genre
    setCurrentGenre({ id: genreId, name: genreName });
    setCurrentView('genre');
    // Scroll to top when navigating
    scrollTo(0, { immediate: false });
  };

  const handleNavigate = (route: string) => {
    console.log('Navigating to:', route);
    if (route === 'home') {
      setCurrentView('home');
      setCurrentGenre(null);
      setSelectedMovieId(null);
      setSelectedPerson(null);
      setSelectedCompany(null);
    } else {
      setCurrentView(route);
      setCurrentGenre(null);
      setSelectedMovieId(null);
      setSelectedPerson(null);
      setSelectedCompany(null);
    }
    // Scroll to top when navigating
    scrollTo(0, { immediate: false });
  };

  const handleMovieSelect = (movie: Movie) => {
    console.log('Movie selected:', movie);
    setSelectedMovieId(movie.id);
    setCurrentView('movie-detail');
    setSelectedPerson(null);
    setSelectedCompany(null);
    scrollTo(0, { immediate: false });
  };

  const handlePersonSelect = (person: Person) => {
    console.log('Person selected:', person);
    setSelectedPerson(person);
    setCurrentView('person-movies');
    setSelectedMovieId(null);
    setSelectedCompany(null);
    // Mantener el género actual si estamos en la vista de género
    scrollTo(0, { immediate: false });
  };

  const handleCompanySelect = (company: Company) => {
    console.log('Company selected:', company);
    setSelectedCompany(company);
    setCurrentView('company-movies');
    setSelectedMovieId(null);
    setSelectedPerson(null);
    scrollTo(0, { immediate: false });
  };

  const handleBackFromDetail = () => {
    setSelectedMovieId(null);
    // Mantener la vista actual (genre, person-movies, company-movies, etc.)
    // Solo cambiar si estamos en movie-detail sin contexto
    if (currentView === 'movie-detail') {
      if (currentGenre) {
        setCurrentView('genre');
      } else if (selectedPerson) {
        setCurrentView('person-movies');
      } else if (selectedCompany) {
        setCurrentView('company-movies');
      } else {
        setCurrentView('home');
      }
    }
    scrollTo(0, { immediate: false });
  };

  const handleBackFromPerson = () => {
    // Si veníamos de un género, volver al género
    if (currentGenre) {
      setCurrentView('genre');
      setSelectedPerson(null);
    } else {
      setCurrentView('home');
      setSelectedPerson(null);
    }
    scrollTo(0, { immediate: false });
  };

  const handleBackFromCompany = () => {
    // Si veníamos de un género, volver al género
    if (currentGenre) {
      setCurrentView('genre');
      setSelectedCompany(null);
    } else {
      setCurrentView('home');
      setSelectedCompany(null);
    }
    scrollTo(0, { immediate: false });
  };

  return (
    <div className="min-h-screen bg-beige flex flex-col">
      <Header onGenreSelect={handleGenreSelect} onNavigate={handleNavigate} />
      
      <main className={`flex-1 ${currentView === 'home' ? 'flex items-start justify-center pt-48' : ''}`}>
        <div className="container-elegant w-full">
          {currentView === 'home' && (
            <div className="flex flex-col items-center justify-start pt-20">
              {/* Search bar positioned higher */}
              <div className="w-full max-w-2xl mx-auto animate-fadeInUp opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                <SearchBar 
                  onMovieSelect={handleMovieSelect}
                  onPersonSelect={handlePersonSelect}
                  onCompanySelect={handleCompanySelect}
                />
              </div>
            </div>
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
                  onPersonSelect={handlePersonSelect}
                  onCompanySelect={handleCompanySelect}
                />
              )}

              {currentView === 'person-movies' && selectedPerson && !selectedMovieId && (
                <PersonMoviesPage
                  person={selectedPerson}
                  genreId={currentGenre?.id || null}
                  genreName={currentGenre?.name}
                  onMovieClick={handleMovieSelect}
                  onBack={handleBackFromPerson}
                />
              )}

              {currentView === 'company-movies' && selectedCompany && !selectedMovieId && (
                <CompanyMoviesPage
                  company={selectedCompany}
                  genreId={currentGenre?.id || null}
                  genreName={currentGenre?.name}
                  onMovieClick={handleMovieSelect}
                  onBack={handleBackFromCompany}
                />
              )}

              {currentView === 'watchlist' && (
                <WatchlistPage onMovieClick={handleMovieSelect} />
              )}

              {currentView === 'upcoming' && !selectedMovieId && (
                <UpcomingPage onMovieClick={handleMovieSelect} />
              )}

              {currentView === 'minigame' && (
                <MovieGuessGame />
              )}

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

