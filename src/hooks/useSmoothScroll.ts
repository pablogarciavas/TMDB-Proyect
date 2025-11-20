import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registrar el plugin de ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Variable global para acceder a la instancia de Lenis
let lenisInstance: Lenis | null = null;

export const useSmoothScroll = () => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Crear instancia de Lenis con configuración suave
    const lenis = new Lenis({
      duration: 1.2, // Duración del scroll suave
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing suave
      orientation: 'vertical', // Scroll vertical
      gestureOrientation: 'vertical',
      smoothWheel: true, // Habilitar scroll suave con rueda
      wheelMultiplier: 1, // Multiplicador de velocidad de rueda
      smoothTouch: false, // Desactivar en touch para mejor rendimiento
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;
    lenisInstance = lenis; // Guardar en variable global

    // Función para actualizar Lenis en cada frame
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    // Iniciar el loop de animación
    requestAnimationFrame(raf);

    // Sincronizar Lenis con GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Actualizar ScrollTrigger cuando Lenis se actualiza
    lenis.on('scroll', () => {
      ScrollTrigger.update();
    });

    // Cleanup
    return () => {
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return lenisRef.current;
};

// Función helper para hacer scroll con Lenis
export const scrollTo = (target: number | string | HTMLElement, options?: any) => {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, options);
  }
};
