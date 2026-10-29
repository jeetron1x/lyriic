import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showWordmark = true,
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 font-display font-bold select-none ${className}`}>
      <div
        className={`${iconSizes[size]} rounded-lg bg-surface flex items-center justify-center border border-white/10 relative overflow-hidden group`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          {/* Subtle background glow */}
          <circle cx="16" cy="16" r="10" fill="#fb6e90" fillOpacity="0.12" />
          
          {/* Kinetic audio-reactive waveform / lyric pulse */}
          <path
            d="M7 16C7 16 9.5 7.5 13 7.5C16.5 7.5 15.5 24.5 19 24.5C22.5 24.5 25 16 25 16"
            stroke="#fb6e90"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="16" r="2.2" fill="#f4f4f5" />
        </svg>
      </div>

      {showWordmark && (
        <span className={`tracking-tight font-extrabold text-secondary ${textSizes[size]}`}>
          lyriic<span className="text-primary inline-block">.</span>
        </span>
      )}
    </div>
  );
};
