import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Command } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Shortcut {
  keys: string[];
  action: string;
  category: string;
}

export const Shortcuts: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);

  const shortcuts: Shortcut[] = [
    { keys: ['Space'], action: 'Play / Pause playback', category: 'Playback' },
    { keys: ['Left', 'Right'], action: 'Seek backward / forward 5s', category: 'Playback' },
    { keys: ['Ctrl', 'Left / Right'], action: 'Previous / next track', category: 'Playback' },
    { keys: ['Up', 'Down'], action: 'Increase / decrease volume', category: 'Playback' },
    { keys: ['L'], action: 'Toggle kinetic lyrics view', category: 'View' },
    { keys: ['F', 'F11'], action: 'Toggle fullscreen lyrics', category: 'View' },
    { keys: ['T'], action: 'Toggle smoky glass overlay mode', category: 'View' },
    { keys: ['M'], action: 'Mute / unmute audio', category: 'Playback' },
    { keys: ['S'], action: 'Toggle shuffle order', category: 'Playback' },
    { keys: ['R'], action: 'Cycle repeat modes', category: 'Playback' },
    { keys: ['Ctrl', ','], action: 'Open preferences & settings', category: 'System' },
    { keys: ['Esc'], action: 'Exit overlay / exit fullscreen', category: 'System' },
  ];

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) return;

      const validRows = rowsRef.current.filter(Boolean);
      gsap.fromTo(
        validRows,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.04,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="shortcuts"
      ref={containerRef}
      className="py-20 sm:py-28 bg-surface/40 border-y border-border-subtle"
      aria-label="Keyboard Shortcuts"
    >
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-white/10 text-xs font-semibold text-primary mb-3">
            <Command className="w-3.5 h-3.5" />
            Tactile Shortcuts
          </div>
          <h2 className="text-3xl sm:text-headline-md font-display font-extrabold text-secondary tracking-tight">
            Stay in the flow.
          </h2>
          <p className="mt-3 text-base text-tertiary">
            Full desktop control without reaching for your mouse.
          </p>
        </div>

        {/* Two-Column Shortcuts Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shortcuts.map((sc, idx) => (
            <div
              key={`${sc.keys.join('+')}-${idx}`}
              ref={(el) => (rowsRef.current[idx] = el)}
              className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-surface border border-border-subtle hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-secondary">
                  {sc.action}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {sc.keys.map((k, kIdx) => (
                  <React.Fragment key={kIdx}>
                    <kbd className="px-2.5 py-1 text-xs font-mono font-semibold bg-surface-2 text-secondary border border-white/10 rounded-md">
                      {k}
                    </kbd>
                    {kIdx < sc.keys.length - 1 && (
                      <span className="text-xs text-tertiary font-mono">+</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
