import { useEffect } from 'react';

export const useSmoothScroll = () => {
  useEffect(() => {
    let scrollTimeout: number | null = null;
    let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    let velocity = 0;
    let lastTime = Date.now();
    let animationFrameId: number | null = null;
    let isAnimating = false;
    let accumulatedDelta = 0;
    let wheelTimeout: number | null = null;
    let lastWheelTime = Date.now();
    let lastWheelDelta = 0;
    let isWheelScrolling = false;

    // Smooth wheel handler for better scroll feel
    const handleWheel = (e: WheelEvent) => {
      // Prevent default scroll behavior
      e.preventDefault();
      
      isWheelScrolling = true;
      const currentTime = Date.now();
      const deltaTime = currentTime - lastWheelTime;
      
      // Calculate velocity from wheel events
      if (deltaTime > 0 && deltaTime < 100) { // Only if reasonable time difference
        const currentDelta = e.deltaY;
        // Smooth velocity calculation using exponential moving average
        const alpha = 0.3; // Smoothing factor
        const instantVelocity = currentDelta / deltaTime;
        velocity = velocity * (1 - alpha) + instantVelocity * alpha;
        lastWheelDelta = currentDelta;
      } else {
        // Reset if too much time passed
        velocity = e.deltaY / Math.max(deltaTime, 1);
        lastWheelDelta = e.deltaY;
      }
      
      lastWheelTime = currentTime;
      
      // Accumulate wheel delta for smoother scrolling
      accumulatedDelta += e.deltaY;
      
      // Clear existing timeouts
      if (wheelTimeout) {
        clearTimeout(wheelTimeout);
      }
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Cancel any ongoing momentum animation
      if (animationFrameId && isAnimating) {
        cancelAnimationFrame(animationFrameId);
        isAnimating = false;
      }

      // Apply smooth scroll with accumulated delta
      const scrollAmount = accumulatedDelta * 0.5; // Reduce scroll speed for smoother feel
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      const targetScroll = Math.max(0, Math.min(
        currentScroll + scrollAmount,
        document.documentElement.scrollHeight - window.innerHeight
      ));

      // Update lastScrollTop for momentum calculation
      lastScrollTop = currentScroll;

      // Smooth scroll animation
      const startScroll = currentScroll;
      const distance = targetScroll - startScroll;
      let startTime: number | null = null;

      const easeOutQuad = (t: number): number => {
        return t * (2 - t);
      };

      const animateWheelScroll = (currentTime: number) => {
        if (startTime === null) {
          startTime = currentTime;
        }
        
        const elapsed = currentTime - startTime;
        const duration = 150;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuad(progress);
        
        const newScroll = startScroll + distance * easedProgress;
        window.scrollTo(0, newScroll);
        
        // Update lastScrollTop during animation
        lastScrollTop = newScroll;
        
        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animateWheelScroll);
        } else {
          accumulatedDelta = 0;
          animationFrameId = null;
        }
      };

      // Cancel previous animation if still running
      if (animationFrameId && !isAnimating) {
        cancelAnimationFrame(animationFrameId);
      }
      
      animationFrameId = requestAnimationFrame(animateWheelScroll);

      // Reset accumulated delta and apply momentum after wheel stops
      wheelTimeout = window.setTimeout(() => {
        accumulatedDelta = 0;
        isWheelScrolling = false;
        
        // Apply momentum after wheel stops
        if (Math.abs(velocity) > 0.02 && !isAnimating) {
          isAnimating = true;
          const momentum = velocity * 300;
          const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const targetScroll = Math.max(0, Math.min(
            currentScrollTop + momentum,
            document.documentElement.scrollHeight - window.innerHeight
          ));
          
          if (Math.abs(targetScroll - currentScrollTop) > 1) {
            const startScroll = currentScrollTop;
            const distance = targetScroll - startScroll;
            const duration = 500;
            let startTime: number | null = null;

            const easeOutCubic = (t: number): number => {
              return 1 - Math.pow(1 - t, 3);
            };

            const animateScroll = (currentTime: number) => {
              if (startTime === null) startTime = currentTime;
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const easedProgress = easeOutCubic(progress);
              
              const newScroll = startScroll + distance * easedProgress;
              window.scrollTo(0, newScroll);
              
              if (progress < 1) {
                animationFrameId = requestAnimationFrame(animateScroll);
              } else {
                isAnimating = false;
                animationFrameId = null;
                velocity = 0; // Reset velocity after momentum completes
              }
            };

            animationFrameId = requestAnimationFrame(animateScroll);
          } else {
            isAnimating = false;
            velocity = 0;
          }
        } else {
          velocity = 0;
        }
      }, 30);
    };

    const handleScroll = () => {
      // Only handle scroll events if not using wheel (for touch devices, etc.)
      if (isWheelScrolling || isAnimating) return;
      
      const currentTime = Date.now();
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime > 0 && deltaTime < 100) {
        const deltaScroll = currentScrollTop - lastScrollTop;
        velocity = deltaScroll / deltaTime;
      }

      lastScrollTop = currentScrollTop;
      lastTime = currentTime;

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      scrollTimeout = window.setTimeout(() => {
        if (Math.abs(velocity) > 0.02 && !isAnimating) {
          isAnimating = true;
          const momentum = velocity * 300;
          const targetScroll = Math.max(0, Math.min(
            currentScrollTop + momentum,
            document.documentElement.scrollHeight - window.innerHeight
          ));
          
          if (Math.abs(targetScroll - currentScrollTop) > 1) {
            const startScroll = currentScrollTop;
            const distance = targetScroll - startScroll;
            const duration = 500;
            let startTime: number | null = null;

            const easeOutCubic = (t: number): number => {
              return 1 - Math.pow(1 - t, 3);
            };

            const animateScroll = (currentTime: number) => {
              if (startTime === null) startTime = currentTime;
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const easedProgress = easeOutCubic(progress);
              
              const newScroll = startScroll + distance * easedProgress;
              window.scrollTo(0, newScroll);
              
              if (progress < 1) {
                animationFrameId = requestAnimationFrame(animateScroll);
              } else {
                isAnimating = false;
                animationFrameId = null;
                velocity = 0;
              }
            };

            animationFrameId = requestAnimationFrame(animateScroll);
          } else {
            isAnimating = false;
            velocity = 0;
          }
        } else {
          velocity = 0;
        }
      }, 30);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (wheelTimeout) clearTimeout(wheelTimeout);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);
};
