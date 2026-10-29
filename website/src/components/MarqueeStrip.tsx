import React, { useRef, useEffect } from 'react';

interface MarqueeStripProps {
  velocity?: number;
}

export const MarqueeStrip: React.FC<MarqueeStripProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const phrases = [
    'Kinetic lyrics',
    'Aurora',
    'Beat Pulse',
    'Smoky glass',
    '100% local',
    'Free and open source',
  ];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) return;

    let xPos = 0;
    let baseSpeed = 0.75;
    let currentSpeed = baseSpeed;
    let animationFrameId: number;
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = Math.abs(currentScrollY - lastScrollY);
      // Accelerate based on scroll delta
      currentSpeed = baseSpeed + Math.min(delta * 0.08, 4.0);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    const animate = () => {
      // Smooth decay back to base speed
      currentSpeed += (baseSpeed - currentSpeed) * 0.05;
      xPos -= currentSpeed;

      if (trackRef.current) {
        // Reset point: when half the duplicate list has scrolled past
        const halfWidth = trackRef.current.scrollWidth / 2;
        if (Math.abs(xPos) >= halfWidth) {
          xPos = 0;
        }
        trackRef.current.style.transform = `translate3d(${xPos}px, 0, 0)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="py-10 border-y border-border-subtle bg-surface/50 overflow-hidden select-none"
      aria-label="Features Highlights"
    >
      <div
        ref={trackRef}
        className="flex items-center gap-10 whitespace-nowrap will-change-transform"
      >
        {/* Repeating twice for seamless looping */}
        {[...phrases, ...phrases, ...phrases, ...phrases].map((phrase, idx) => (
          <div key={idx} className="flex items-center gap-10">
            <span className="font-display font-extrabold text-2xl sm:text-3xl text-secondary tracking-tight">
              {phrase}
            </span>
            <span className="w-2 h-2 rounded-full bg-primary" />
          </div>
        ))}
      </div>
    </section>
  );
};
