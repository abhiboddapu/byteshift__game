import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Shield, Volume2, VolumeX, Zap } from 'lucide-react';
import { soundEngine } from './audio/soundEngine';
import { GameCanvas } from './components/GameCanvas';
import { GameOverModal, PauseModal } from './components/GameModals';
import { QuizGateModal } from './components/QuizGateModal';
import { TitleScreen } from './components/TitleScreen';
import { pickQuizQuestion } from './data/quizBank';
import { getBiomeForLevel, getLevelTargetDistance } from './game/biomes';
import { GameState, HudSnapshot, QuizQuestion, QuizStats } from './types/game';

const BEST_SCORE_KEY = 'byteshift_rally_best_score';
const BEST_LEVEL_KEY = 'byteshift_rally_best_level';

function readStoredInt(key: string): number {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

function writeStoredInt(key: string, val: number) {
  try {
    window.localStorage.setItem(key, String(val));
  } catch {
    // ignore storage errors
  }
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [level, setLevel] = useState(1);
  const [runId, setRunId] = useState(1);
  const [levelAdvanceId, setLevelAdvanceId] = useState(0);
  const [shields, setShields] = useState(3);
  const [isMuted, setIsMuted] = useState(false);

  const [bestScore, setBestScore] = useState(() => readStoredInt(BEST_SCORE_KEY));
  const [bestLevel, setBestLevel] = useState(() => readStoredInt(BEST_LEVEL_KEY));

  const [hud, setHud] = useState<HudSnapshot>(() => ({
    level: 1,
    score: 0,
    shields: 3,
    maxShields: 3,
    distance: 0,
    targetDistance: getLevelTargetDistance(1),
    nitro: 65,
    speedKmh: 110,
    biomeName: getBiomeForLevel(1).name,
  }));

  const [activeQuestion, setActiveQuestion] = useState<QuizQuestion | null>(null);
  const [quizStats, setQuizStats] = useState<QuizStats>({ answered: 0, correct: 0 });

  const usedQuizIdsRef = useRef<Set<string>>(new Set());
  const externalBoostRef = useRef<boolean>(false);

  const updateBestRecords = useCallback((finalScore: number, reachedLevel: number) => {
    setBestScore((prev) => {
      if (finalScore > prev) {
        writeStoredInt(BEST_SCORE_KEY, finalScore);
        return finalScore;
      }
      return prev;
    });
    setBestLevel((prev) => {
      if (reachedLevel > prev) {
        writeStoredInt(BEST_LEVEL_KEY, reachedLevel);
        return reachedLevel;
      }
      return prev;
    });
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      if (!next) soundEngine.playClick();
      return next;
    });
  }, []);

  const handleStartGame = useCallback(() => {
    soundEngine.playClick();
    usedQuizIdsRef.current.clear();
    externalBoostRef.current = false;
    setLevel(1);
    setShields(3);
    setQuizStats({ answered: 0, correct: 0 });
    setActiveQuestion(null);
    setRunId((id) => id + 1);
    setGameState('PLAYING');
  }, []);

  const handleReachGate = useCallback(
    (gateScore: number, currentShields: number) => {
      externalBoostRef.current = false;
      setHud((prev) => ({ ...prev, score: gateScore, shields: currentShields }));
      setShields(currentShields);
      const q = pickQuizQuestion(level, usedQuizIdsRef.current);
      usedQuizIdsRef.current.add(q.id);
      setActiveQuestion(q);
      setGameState('LEVEL_QUIZ');
    },
    [level]
  );

  const handleSelectQuizAnswer = useCallback(
    (isCorrect: boolean) => {
      setQuizStats((prev) => ({
        answered: prev.answered + 1,
        correct: prev.correct + (isCorrect ? 1 : 0),
      }));

      if (isCorrect) {
        soundEngine.playQuizCorrect();
        setHud((prev) => ({ ...prev, score: prev.score + 250 }));
      } else {
        soundEngine.playQuizWrong();
        setShields((prev) => {
          const next = Math.max(0, prev - 1);
          setHud((h) => ({ ...h, shields: next }));
          return next;
        });
      }
    },
    []
  );

  const handleRetryQuestion = useCallback(() => {
    soundEngine.playClick();
    const q = pickQuizQuestion(level, usedQuizIdsRef.current);
    usedQuizIdsRef.current.add(q.id);
    setActiveQuestion(q);
  }, [level]);

  const handleAdvanceLevel = useCallback(() => {
    soundEngine.playClick();
    const nextLevel = level + 1;
    setLevel(nextLevel);
    setLevelAdvanceId((id) => id + 1);
    setActiveQuestion(null);
    setGameState('PLAYING');
  }, [level]);

  const handleGameOver = useCallback(
    (finalScore: number) => {
      externalBoostRef.current = false;
      setHud((prev) => ({ ...prev, score: finalScore }));
      updateBestRecords(finalScore, level);
      setGameState('GAME_OVER');
    },
    [level, updateBestRecords]
  );

  const handleFinishQuizGameOver = useCallback(() => {
    handleGameOver(hud.score);
  }, [handleGameOver, hud.score]);

  const handleQuitToTitle = useCallback(() => {
    soundEngine.playClick();
    externalBoostRef.current = false;
    setLevel(1);
    setShields(3);
    setRunId((id) => id + 1);
    setGameState('TITLE_MENU');
  }, []);

  // Escape key toggles pause during active driving
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (gameState === 'PLAYING') {
          externalBoostRef.current = false;
          setGameState('PAUSED');
        } else if (gameState === 'PAUSED') {
          setGameState('PLAYING');
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState]);

  const progressPct = Math.min(
    100,
    Math.round((hud.distance / Math.max(1, hud.targetDistance)) * 100)
  );

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-950">
      {/* Isolated 60fps Canvas Layer */}
      <GameCanvas
        gameState={gameState}
        level={level}
        runId={runId}
        levelAdvanceId={levelAdvanceId}
        syncedShields={shields}
        externalBoostRef={externalBoostRef}
        onHudUpdate={setHud}
        onReachGate={handleReachGate}
        onGameOver={handleGameOver}
        onShieldChange={setShields}
      />

      {/* World-matched Low-Occlusion HUD (only during active driving / paused / quiz) */}
      {gameState !== 'TITLE_MENU' && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3 sm:p-5">
          {/* Top Perimeter Bar */}
          <div className="flex items-start justify-between gap-3">
            {/* Top-Left: Level & Checkpoint Progress */}
            <div className="rounded-xl border border-slate-700/80 bg-slate-950/88 px-3.5 py-2.5 text-slate-50 shadow-md">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="text-amber-400">Level {hud.level}</span>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span className="text-slate-200">{hud.biomeName}</span>
              </div>

              <div className="mt-1.5 flex items-center gap-2.5">
                <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-800 sm:w-36">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-[width] duration-100"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="font-mono-num text-xs text-slate-300">
                  {hud.distance}/{hud.targetDistance}m
                </span>
              </div>
            </div>

            {/* Top-Right: Score, Shields, Audio & Pause */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-3.5 rounded-xl border border-slate-700/80 bg-slate-950/88 px-3.5 py-2.5 text-slate-50 shadow-md">
                <div>
                  <div className="text-[11px] font-medium text-slate-400">Score</div>
                  <div className="font-mono-num text-sm font-bold text-white sm:text-base">
                    {hud.score.toLocaleString()}
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-800" aria-hidden="true" />

                <div>
                  <div className="text-[11px] font-medium text-slate-400">Shields</div>
                  <div className="mt-0.5 flex items-center gap-1" aria-label={`Shields ${shields} of ${hud.maxShields}`}>
                    {Array.from({ length: hud.maxShields }).map((_, idx) => (
                      <Shield
                        key={idx}
                        className={`h-4 w-4 ${
                          idx < shields
                            ? 'fill-emerald-400 text-emerald-300'
                            : 'fill-slate-800 text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pointer-events-auto flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-950/88 text-slate-200 shadow-md transition-colors hover:bg-slate-800 hover:text-white cursor-pointer"
                  aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-amber-400" />
                  )}
                </button>

                {gameState === 'PLAYING' && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      externalBoostRef.current = false;
                      setGameState('PAUSED');
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-950/88 text-slate-200 shadow-md transition-colors hover:bg-slate-800 hover:text-white cursor-pointer"
                    aria-label="Pause game"
                  >
                    <Pause className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bottom-Right: Nitro Boost Touch / Mouse Button & Speed Readout */}
          {gameState === 'PLAYING' && (
            <div className="flex items-end justify-between">
              <div className="rounded-xl border border-slate-700/80 bg-slate-950/85 px-3 py-2 text-xs text-slate-300">
                <span className="font-mono-num font-bold text-white">{hud.speedKmh}</span>{' '}
                <span className="text-slate-400">km/h</span>
              </div>

              <button
                type="button"
                onPointerDown={() => {
                  externalBoostRef.current = true;
                  soundEngine.playBoost();
                }}
                onPointerUp={() => {
                  externalBoostRef.current = false;
                }}
                onPointerLeave={() => {
                  externalBoostRef.current = false;
                }}
                onPointerCancel={() => {
                  externalBoostRef.current = false;
                }}
                className="pointer-events-auto flex h-12 items-center gap-2 rounded-xl border border-amber-500/70 bg-slate-950/90 px-4 text-sm font-bold text-amber-400 shadow-lg transition-transform active:scale-95 cursor-pointer"
                aria-label="Hold to use Nitro Boost"
              >
                <Zap className="h-4 w-4 fill-amber-400" />
                <span>Boost</span>
                <span className="font-mono-num text-xs text-slate-300">{hud.nitro}%</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Title Screen */}
      {gameState === 'TITLE_MENU' && (
        <TitleScreen
          bestScore={bestScore}
          bestLevel={bestLevel}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onStart={handleStartGame}
        />
      )}

      {/* Checkpoint IT Quiz Gate Modal */}
      {gameState === 'LEVEL_QUIZ' && activeQuestion && (
        <QuizGateModal
          level={level}
          question={activeQuestion}
          shields={shields}
          maxShields={3}
          onSelectAnswer={handleSelectQuizAnswer}
          onAdvanceLevel={handleAdvanceLevel}
          onRetryQuestion={handleRetryQuestion}
          onFinishGameOver={handleFinishQuizGameOver}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          level={level}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onResume={() => {
            soundEngine.playClick();
            setGameState('PLAYING');
          }}
          onRestart={handleStartGame}
          onQuitToTitle={handleQuitToTitle}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          score={hud.score}
          bestScore={bestScore}
          level={level}
          quizStats={quizStats}
          onPlayAgain={handleStartGame}
          onQuitToTitle={handleQuitToTitle}
        />
      )}
    </main>
  );
}
