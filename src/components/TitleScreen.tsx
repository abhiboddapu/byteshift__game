import React, { useEffect } from 'react';
import { Volume2, VolumeX, Play } from 'lucide-react';

interface TitleScreenProps {
  bestScore: number;
  bestLevel: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  bestScore,
  bestLevel,
  isMuted,
  onToggleMute,
  onStart,
}) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onStart]);

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between bg-slate-950/55 px-6 py-6 sm:px-10 sm:py-8">
      {/* Top Bar: mute toggle only */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={onToggleMute}
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/90 px-4 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-amber-400 whitespace-nowrap shrink-0"
          aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
        >
          {isMuted ? <VolumeX className="h-4 w-4 text-slate-400" /> : <Volume2 className="h-4 w-4 text-amber-400" />}
          <span>{isMuted ? 'Sound Off' : 'Sound On'}</span>
        </button>
      </div>

      {/* Centerpiece Lockup over calm scrim */}
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        {/* Bespoke inline SVG Title Lockup */}
        <svg
          viewBox="0 0 540 132"
          className="mb-4 w-full max-w-[480px] drop-shadow-[0_10px_24px_rgba(0,0,0,0.65)]"
          role="img"
          aria-label="ByteShift Rally"
        >
          <defs>
            <linearGradient id="rallyAmber" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
          </defs>

          {/* Checkered speed accent bar */}
          <g transform="translate(150, 8)">
            <rect x="0" y="0" width="16" height="8" fill="#F8FAFC" />
            <rect x="16" y="0" width="16" height="8" fill="#0F172A" />
            <rect x="32" y="0" width="16" height="8" fill="#F8FAFC" />
            <rect x="48" y="0" width="16" height="8" fill="#0F172A" />
            <rect x="64" y="0" width="176" height="8" fill="url(#rallyAmber)" rx="2" />
          </g>

          {/* Main Wordmark */}
          <text
            x="270"
            y="74"
            textAnchor="middle"
            fill="#F8FAFC"
            fontFamily="Outfit, system-ui, sans-serif"
            fontWeight="800"
            fontSize="60"
            letterSpacing="2"
          >
            BYTESHIFT
          </text>

          {/* Sub-lockup */}
          <text
            x="270"
            y="112"
            textAnchor="middle"
            fill="url(#rallyAmber)"
            fontFamily="Outfit, system-ui, sans-serif"
            fontWeight="700"
            fontSize="26"
            letterSpacing="11"
          >
            RALLY
          </text>
        </svg>

        <p className="mb-8 max-w-md text-base leading-relaxed text-slate-200 sm:text-lg">
          Dodge highway traffic, collect data cores, and solve a quick IT quiz at each checkpoint to unlock the next level.
        </p>

        {/* Primary Start CTA */}
        <button
          type="button"
          onClick={onStart}
          className="inline-flex h-13 items-center justify-center gap-2.5 rounded-xl bg-amber-500 px-8 text-base font-bold text-slate-950 shadow-lg transition-transform duration-150 hover:scale-[1.02] hover:bg-amber-400 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Play className="h-5 w-5 fill-slate-950" />
          <span>Start Game</span>
        </button>

        {bestScore > 0 && (
          <div className="mt-5 flex items-center gap-3 text-sm font-medium text-slate-300">
            <span className="font-mono-num">Best Score: {bestScore.toLocaleString()}</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="font-mono-num">Best Level: {bestLevel}</span>
          </div>
        )}
      </div>

      {/* Single flat control hint line */}
      <div className="text-center text-xs font-medium tracking-wide text-slate-300 sm:text-sm">
        Arrow Keys / WASD or Drag to Steer · Space Nitro Boost · Esc Pause
      </div>
    </div>
  );
};
