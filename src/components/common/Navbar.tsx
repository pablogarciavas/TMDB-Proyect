import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGenres } from '../../contexts/GenresContext';
import { Genre } from '../../types/genre';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface NavbarProps {
  onGenreSelect?: (genreId: number, genreName: string) => void;
  onNavigate?: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onGenreSelect, onNavigate }) => {
  const { genres: allGenres } = useGenres();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shouldRenderMenu, setShouldRenderMenu] = useState(false);
  const [shouldRenderGenreModal, setShouldRenderGenreModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const genreModalRef = useRef<HTMLDivElement>(null);
  const mobileMenuPanelRef = useRef<HTMLDivElement>(null);
  const mobileMenuOverlayRef = useRef<HTMLDivElement>(null);
  const mobileMenuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const genreModalContentRef = useRef<HTMLDivElement>(null);
  const genreButtonsRef = useRef<HTMLButtonElement[]>([]);

  // Reorganizar géneros para llenar columnas primero (column-major order)
  const genres = useMemo(() => {
    if (allGenres.length === 0) return [];
    
    // Sort genres alphabetically
    const sortedGenres = [...allGenres].sort((a, b) => 
      a.name.localeCompare(b.name, 'en')
    );
    
    // 5 columns, 4 rows = 20 slots, but we have 19 genres
    // We want: Col1: [0,1,2,3], Col2: [4,5,6,7], Col3: [8,9,10,11], etc.
    const columns = 5;
    const rows = 4;
    const reorganizedGenres: Genre[] = [];
    
    // Fill by columns: for each column, add genres row by row
    // Index calculation: col * rows + row (not row * columns + col)
    for (let col = 0; col < columns; col++) {
      for (let row = 0; row < rows; row++) {
        const index = col * rows + row;
        if (index < sortedGenres.length) {
          reorganizedGenres.push(sortedGenres[index]);
        }
      }
    }
    
    return reorganizedGenres;
  }, [allGenres]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Solo cerrar dropdown de desktop si el click está fuera
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // No cerrar si el click está en el modal de géneros mobile
        if (genreModalRef.current && genreModalRef.current.contains(event.target as Node)) {
          return;
        }
        setOpenDropdown(null);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        // No cerrar si el click está en el modal de géneros mobile
        if (genreModalRef.current && genreModalRef.current.contains(event.target as Node)) {
          return;
        }
        setMobileMenuOpen(false);
      }
      // Cerrar modal de géneros mobile si el click está fuera (solo en mobile)
      if (openDropdown === 'genre' && window.innerWidth < 640) {
        if (genreModalRef.current && !genreModalRef.current.contains(event.target as Node)) {
          setOpenDropdown(null);
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    if (openDropdown || mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el menú está abierto solo en mobile
      if (window.innerWidth < 640) { // sm breakpoint
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [openDropdown, mobileMenuOpen]);

  // Controlar renderizado del menú mobile
  useEffect(() => {
    if (mobileMenuOpen) {
      setShouldRenderMenu(true);
    } else {
      // Esperar a que termine la animación de salida antes de desmontar
      const timer = setTimeout(() => {
        setShouldRenderMenu(false);
      }, 500); // Duración máxima de la animación
      return () => clearTimeout(timer);
    }
  }, [mobileMenuOpen]);

  // Animaciones GSAP para el menú mobile (lazy loaded)
  useEffect(() => {
    if (shouldRenderMenu && mobileMenuPanelRef.current && mobileMenuOverlayRef.current) {
      // Solo cargar GSAP en mobile
      if (window.innerWidth >= 640) return;

      // Lazy load GSAP solo cuando se necesite
      import('gsap').then(({ default: gsap }) => {
        const panel = mobileMenuPanelRef.current;
        const overlay = mobileMenuOverlayRef.current;
        const items = mobileMenuItemsRef.current.filter(Boolean);

        if (!panel || !overlay) return;

        if (mobileMenuOpen) {
          // Optimizar para animaciones
          panel.style.willChange = 'transform';
          overlay.style.willChange = 'opacity';
          items.forEach(item => {
            if (item) item.style.willChange = 'opacity, transform';
          });

          // Animación de entrada
          gsap.set(panel, { x: '100%' });
          gsap.set(overlay, { opacity: 0 });
          gsap.set(items, { opacity: 0, y: 20 });

          const tl = gsap.timeline({
            onComplete: () => {
              // Limpiar will-change después de la animación
              panel.style.willChange = 'auto';
              overlay.style.willChange = 'auto';
              items.forEach(item => {
                if (item) item.style.willChange = 'auto';
              });
            },
          });

          tl.to(overlay, {
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out',
          });

          tl.to(panel, {
            x: '0%',
            duration: 0.4,
            ease: 'power3.out',
          }, '-=0.2');

          if (items.length > 0) {
            tl.to(items, {
              opacity: 1,
              y: 0,
              duration: 0.3,
              stagger: 0.05,
              ease: 'power2.out',
            }, '-=0.2');
          }
        } else {
          // Animación de salida
          const tl = gsap.timeline({
            onComplete: () => {
              // Limpiar will-change después de la animación
              panel.style.willChange = 'auto';
              overlay.style.willChange = 'auto';
              items.forEach(item => {
                if (item) item.style.willChange = 'auto';
              });
            },
          });

          if (items.length > 0) {
            tl.to(items, {
              opacity: 0,
              y: 20,
              duration: 0.2,
              stagger: 0.03,
              ease: 'power2.in',
            });
          }

          tl.to(panel, {
            x: '100%',
            duration: 0.3,
            ease: 'power3.in',
          }, '-=0.1');

          tl.to(overlay, {
            opacity: 0,
            duration: 0.2,
            ease: 'power2.in',
          }, '-=0.2');
        }
      });
    }
  }, [shouldRenderMenu, mobileMenuOpen]);

  // Controlar renderizado del modal de géneros
  useEffect(() => {
    if (openDropdown === 'genre') {
      setShouldRenderGenreModal(true);
    } else {
      // Esperar a que termine la animación de salida antes de desmontar
      const timer = setTimeout(() => {
        setShouldRenderGenreModal(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [openDropdown]);

  // Animaciones GSAP para el modal de géneros (lazy loaded)
  useEffect(() => {
    if (shouldRenderGenreModal && genreModalRef.current && genreModalContentRef.current) {
      // Solo animar en mobile
      if (window.innerWidth >= 640) return;

      // Lazy load GSAP solo cuando se necesite
      import('gsap').then(({ default: gsap }) => {
        const modal = genreModalRef.current;
        const content = genreModalContentRef.current;
        const buttons = genreButtonsRef.current.filter(Boolean);

        if (!modal || !content) return;

        if (openDropdown === 'genre') {
          // Optimizar para animaciones
          modal.style.willChange = 'opacity, transform';
          content.style.willChange = 'opacity, transform';
          buttons.forEach(btn => {
            if (btn) btn.style.willChange = 'opacity, transform';
          });

          // Animación de entrada
          gsap.set(modal, { opacity: 0, scale: 0.95 });
          gsap.set(content, { opacity: 0, y: 20 });
          gsap.set(buttons, { opacity: 0, scale: 0.9 });

          const tl = gsap.timeline({
            onComplete: () => {
              // Limpiar will-change después de la animación
              modal.style.willChange = 'auto';
              content.style.willChange = 'auto';
              buttons.forEach(btn => {
                if (btn) btn.style.willChange = 'auto';
              });
            },
          });

          tl.to(modal, {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
          });

          tl.to(content, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
          }, '-=0.2');

          if (buttons.length > 0) {
            tl.to(buttons, {
              opacity: 1,
              scale: 1,
              duration: 0.25,
              stagger: 0.03,
              ease: 'back.out(1.2)',
            }, '-=0.15');
          }
        } else {
          // Animación de salida
          const tl = gsap.timeline({
            onComplete: () => {
              // Limpiar will-change después de la animación
              modal.style.willChange = 'auto';
              content.style.willChange = 'auto';
              buttons.forEach(btn => {
                if (btn) btn.style.willChange = 'auto';
              });
            },
          });

          if (buttons.length > 0) {
            tl.to(buttons, {
              opacity: 0,
              scale: 0.9,
              duration: 0.2,
              stagger: 0.02,
              ease: 'power2.in',
            });
          }

          if (content) {
            tl.to(content, {
              opacity: 0,
              y: 20,
              duration: 0.2,
              ease: 'power2.in',
            }, '-=0.1');
          }

          tl.to(modal, {
            opacity: 0,
            scale: 0.95,
            duration: 0.25,
            ease: 'power2.in',
          }, '-=0.1');
        }
      });
    }
  }, [shouldRenderGenreModal, openDropdown]);

  const handleGenreClick = (genreId: number, genreName: string) => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
    onGenreSelect?.(genreId, genreName);
  };

  const handleNavClick = (route: string) => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
    onNavigate?.(route);
  };

  const navItems = [
    { id: 'watchlist', label: 'Watchlist' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'minigame', label: 'Minigame' },
  ];

  return (
    <>
      {/* Menú hamburguesa SOLO para mobile - oculto en desktop */}
      <div className="block sm:hidden" ref={mobileMenuRef}>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-dark hover:bg-dark/10 rounded-lg transition-colors"
          aria-label="Menu"
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>

        {/* Modal de menú mobile */}
        {shouldRenderMenu && (
          <>
            <div 
              ref={mobileMenuOverlayRef}
              className="fixed inset-0 bg-black/30 z-[98]"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div 
              ref={mobileMenuPanelRef}
              className="fixed inset-y-0 right-0 w-[85vw] max-w-sm bg-beige-light border-l border-beige-medium shadow-minimal-lg z-[99] overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-dark">Menu</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-dark hover:bg-dark/10 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Botón Genre en mobile */}
                <div className="mb-4">
                  <button
                    ref={(el) => {
                      if (el) mobileMenuItemsRef.current[0] = el;
                    }}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setOpenDropdown('genre');
                    }}
                    className="w-full text-left px-4 py-3 bg-dark text-beige-light rounded-xl font-medium flex items-center justify-between"
                  >
                    <span>Genre</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Resto de items de navegación en mobile */}
                {navItems.map((item, index) => (
                  <button
                    key={item.id}
                    ref={(el) => {
                      if (el) mobileMenuItemsRef.current[index + 1] = el;
                    }}
                    onClick={() => handleNavClick(item.id)}
                    className="w-full text-left px-4 py-3 text-dark hover:bg-dark/10 rounded-xl font-medium mb-2 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Navbar desktop - SOLO visible en desktop, oculto en mobile */}
      <nav className="hidden sm:flex items-center space-x-0 md:space-x-0.5 lg:space-x-1 animate-fadeInDown" ref={dropdownRef}>
      {/* Dropdown de Género */}
      <div className="relative z-[60]">
        <button
          ref={buttonRef}
          onClick={() => setOpenDropdown(openDropdown === 'genre' ? null : 'genre')}
          className="px-1.5 py-1 md:px-2 md:py-1.5 lg:px-4 lg:py-2 text-dark hover:bg-dark hover:text-beige-light rounded-lg md:rounded-xl transition-all duration-200 font-medium text-[10px] md:text-xs lg:text-base relative group"
          title="Genre"
        >
          <span className="hidden sm:inline">Genre</span>
          <span className="sm:hidden">G</span>
          <svg
            className={`inline-block ml-0.5 md:ml-1 lg:ml-2 w-2.5 h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 transition-transform duration-200 ${
              openDropdown === 'genre' ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {/* Tooltip para mobile - visible al tocar */}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark text-beige-light text-xs rounded whitespace-nowrap opacity-0 group-active:opacity-100 sm:group-hover:opacity-100 transition-opacity pointer-events-none z-50 sm:hidden">
            Genre
          </span>
        </button>

        {openDropdown === 'genre' && (
          <>
            {/* Dropdown desktop - SOLO visible en desktop (el nav tiene hidden sm:flex) */}
            <div className="absolute top-full left-0 mt-2 w-auto min-w-[700px] max-w-[700px] bg-beige-light/95 backdrop-blur-md border border-beige-medium/50 rounded-2xl shadow-minimal-lg z-[110] animate-scaleIn overflow-visible">
              <div className="p-6 overflow-visible">
                <div className="grid grid-cols-2 md:flex md:gap-x-4 gap-2 md:gap-0">
                {[0, 1, 2, 3, 4].map((colIndex) => {
                  const columnGenres = genres.filter((_, index) => Math.floor(index / 4) === colIndex);
                  const isLastColumn = colIndex === 4;
                  
                  return (
                    <div key={colIndex} className="flex-1 relative">
                      <div className="flex flex-col gap-y-1 md:gap-y-2">
                        {columnGenres.map((genre) => (
                          <button
                            key={genre.id}
                            onClick={() => handleGenreClick(genre.id, genre.name)}
                            className="text-left px-2 py-1.5 md:px-3 md:py-2 text-dark hover:bg-dark/10 rounded-xl transition-colors duration-200 whitespace-nowrap text-xs md:text-sm font-medium"
                          >
                            {genre.name}
                          </button>
                        ))}
                      </div>
                      {/* Continuous vertical separator on the right side of each column - solo en desktop */}
                      {!isLastColumn && (
                        <div className="hidden md:block absolute top-0 bottom-0 w-px bg-beige-medium/30" style={{ right: '-0.5rem' }}></div>
                      )}
                    </div>
                  );
                })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Resto de items de navegación */}
      {navItems.map((item, index) => (
        <button
          key={item.id}
          onClick={() => handleNavClick(item.id)}
          className="px-1.5 py-1 md:px-2 md:py-1.5 lg:px-4 lg:py-2 text-dark hover:bg-dark hover:text-beige-light rounded-lg md:rounded-xl transition-all duration-200 font-medium text-[10px] md:text-xs lg:text-base whitespace-nowrap relative group"
          title={item.label}
          style={{ animationDelay: `${(index + 1) * 0.1}s` }}
        >
          <span className="hidden sm:inline">{item.label}</span>
          <span className="sm:hidden">{item.label.charAt(0)}</span>
          {/* Tooltip para mobile - visible al tocar */}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark text-beige-light text-xs rounded whitespace-nowrap opacity-0 group-active:opacity-100 sm:group-hover:opacity-100 transition-opacity pointer-events-none z-50 sm:hidden">
            {item.label}
          </span>
        </button>
      ))}
      </nav>

      {/* Modal de géneros SOLO para mobile - fullscreen */}
      {shouldRenderGenreModal && (
        <div 
          ref={genreModalRef}
          className="fixed inset-0 sm:hidden z-[110] bg-beige-light overflow-y-auto"
          onClick={(e) => {
            // Solo cerrar si se hace click en el fondo, no en los botones
            if (e.target === e.currentTarget) {
              setOpenDropdown(null);
            }
          }}
        >
          <div ref={genreModalContentRef} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-dark">Select Genre</h2>
              <button
                onClick={() => setOpenDropdown(null)}
                className="p-2 text-dark hover:bg-dark/10 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {genres.map((genre, index) => (
                <button
                  key={genre.id}
                  ref={(el) => {
                    if (el) genreButtonsRef.current[index] = el;
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevenir que el click se propague al contenedor
                    handleGenreClick(genre.id, genre.name);
                  }}
                  className="text-left px-4 py-3 text-dark hover:bg-dark/10 rounded-xl transition-colors font-medium"
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

