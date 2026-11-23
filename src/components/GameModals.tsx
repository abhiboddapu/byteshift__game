import React, { useEffect } from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Trophy } from 'lucide-react';
import { QuizStats } from '../types/game';

interface PauseModalProps {
  level: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onResume: () => void;
  onRestart: () => void;
  onQuitToTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  level,
  isMuted,
  onToggleMute,
  onResume,
  onRestart,
  onQuitToTitle,
}) => {
  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-heading"
    >
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-50 shadow-2xl">
        <p className="text-xs font-medium text-amber-400">Level {level}</p>
        <h2 id="pause-heading" className="font-display mt-1 text-2xl font-bold text-white">
          Game Paused
        </h2>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onResume}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400 cursor-pointer whitespace-nowrap"
          >
            <Play className="h-4 w-4 fill-slate-950" />
            <span>Resume</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 cursor-pointer whitespace-nowrap"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-amber-400" />}
            <span>{isMuted ? 'Sound Off' : 'Sound On'}</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Restart Run</span>
          </button>

          <button
            type="button"
            onClick={onQuitToTitle}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-transparent px-4 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 cursor-pointer whitespace-nowrap"
          >
            <Home className="h-4 w-4" />
            <span>Title Screen</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  score: number;
  bestScore: number;
  level: number;
  quizStats: QuizStats;
  onPlayAgain: () => void;
  onQuitToTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  bestScore,
  level,
  quizStats,
  onPlayAgain,
  onQuitToTitle,
}) => {
  const isNewBest = score > 0 && score >= bestScore;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        onPlayAgain();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onPlayAgain]);

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gameover-heading"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-50 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-400">Run Complete</span>
          {isNewBest && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
              <Trophy className="h-3.5 w-3.5" />
              New Best
            </span>
          )}
        </div>

        <h2 id="gameover-heading" className="font-display mt-1 text-3xl font-extrabold text-white">
          Out of Shields
        </h2>

        {/* Clean tabular stats grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-y border-slate-800 py-5">
          <div>
            <p className="text-xs text-slate-400">Final Score</p>
            <p className="font-mono-num mt-1 text-2xl font-bold text-white">
              {score.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Level Reached</p>
            <p className="font-mono-num mt-1 text-2xl font-bold text-amber-400">
              {level}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">IT Quizzes Solved</p>
            <p className="font-mono-num mt-1 text-lg font-semibold text-emerald-400">
              {quizStats.correct} / {quizStats.answered}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Best Score</p>
            <p className="font-mono-num mt-1 text-lg font-semibold text-slate-200">
              {bestScore.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onPlayAgain}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400 cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Play Again</span>
          </button>

          <button
            type="button"
            onClick={onQuitToTitle}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 cursor-pointer whitespace-nowrap"
          >
            <Home className="h-4 w-4" />
            <span>Title</span>
          </button>
        </div>
      </div>
    </div>
  );
};
