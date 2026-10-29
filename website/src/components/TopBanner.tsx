import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

export const TopBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside
      aria-label="Announcement"
      className="relative z-40 bg-surface-2/80 backdrop-blur-sm border-b border-border-subtle py-2.5 px-4 text-center text-xs sm:text-sm text-tertiary transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 pr-6">
        <Star className="w-3.5 h-3.5 text-primary fill-primary inline-block flex-shrink-0" />
        <span>Open source and free forever.</span>
        <a
          href="https://github.com/jeetron1x/lyriic"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary-80 underline font-semibold transition-colors inline-flex items-center gap-1"
        >
          Star it on GitHub
          <span aria-hidden="true">&rarr;</span>
        </a>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-1 text-tertiary hover:text-secondary hover:bg-white/5 rounded-full transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
    </aside>
  );
};
