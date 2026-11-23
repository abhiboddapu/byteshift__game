import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, ShieldAlert, ArrowRight, RotateCcw } from 'lucide-react';
import { QuizQuestion } from '../types/game';

interface QuizGateModalProps {
  level: number;
  question: QuizQuestion;
  shields: number;
  maxShields: number;
  onSelectAnswer: (isCorrect: boolean) => void;
  onAdvanceLevel: () => void;
  onRetryQuestion: () => void;
  onFinishGameOver: () => void;
}

export const QuizGateModal: React.FC<QuizGateModalProps> = ({
  level,
  question,
  shields,
  maxShields,
  onSelectAnswer,
  onAdvanceLevel,
  onRetryQuestion,
  onFinishGameOver,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [shake, setShake] = useState(false);

  // Reset local state whenever a new question arrives
  useEffect(() => {
    setSelectedIdx(null);
    setShake(false);
  }, [question.id]);

  const isAnswered = selectedIdx !== null;
  const isCorrect = isAnswered && selectedIdx === question.correctIndex;

  const handleChoose = (idx: number) => {
    if (isAnswered) return;
    setSelectedIdx(idx);
    const correct = idx === question.correctIndex;
    if (!correct) {
      setShake(true);
    }
    onSelectAnswer(correct);
  };

  // Keyboard shortcuts: 1-4 to pick answer, Enter/Space to advance once answered
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isAnswered) {
        if (e.key === '1' || e.key === '2' || e.key === '3' || e.key === '4') {
          e.preventDefault();
          handleChoose(Number(e.key) - 1);
        }
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        if (isCorrect) {
          onAdvanceLevel();
        } else if (shields > 0) {
          onRetryQuestion();
        } else {
          onFinishGameOver();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/75 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-gate-heading"
    >
      <div
        className={`w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-50 shadow-2xl sm:p-8 ${
          shake ? 'animate-quiz-shake' : ''
        }`}
      >
        {/* Clean unboxed header metadata */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-400">Checkpoint {level}</span>
            <span aria-hidden="true">·</span>
            <span>{question.topic}</span>
          </div>
          <span className="font-mono-num text-slate-300">
            Shields: {shields}/{maxShields}
          </span>
        </div>

        <h2
          id="quiz-gate-heading"
          className="font-display mb-6 text-xl font-bold leading-snug text-white sm:text-2xl"
        >
          {question.question}
        </h2>

        {/* 4 Answer Options */}
        <div className="space-y-3">
          {question.options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            const isRightOption = idx === question.correctIndex;

            let btnStyle =
              'border-slate-700 bg-slate-800/80 text-slate-100 hover:border-amber-400/70 hover:bg-slate-800';
            if (isAnswered) {
              if (isRightOption) {
                btnStyle = 'border-emerald-500 bg-emerald-950/70 text-emerald-100';
              } else if (isSelected && !isRightOption) {
                btnStyle = 'border-rose-500 bg-rose-950/70 text-rose-100';
              } else {
                btnStyle = 'border-slate-800 bg-slate-900/60 text-slate-500 opacity-75';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleChoose(idx)}
                className={`flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-amber-400 sm:text-base ${
                  !isAnswered ? 'cursor-pointer' : 'cursor-default'
                } ${btnStyle}`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="font-mono-num flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-950/70 text-xs font-bold text-slate-300">
                    {idx + 1}
                  </span>
                  <span>{opt}</span>
                </div>

                {isAnswered && isRightOption && (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                )}
                {isAnswered && isSelected && !isRightOption && (
                  <XCircle className="h-5 w-5 shrink-0 text-rose-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback & Gate Unlock Footer */}
        {isAnswered && (
          <div className="mt-6 border-t border-slate-800 pt-5">
            <div className="mb-4 flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              ) : (
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
              )}
              <div>
                <p className="text-sm font-bold text-white">
                  {isCorrect
                    ? 'Gate Unlocked · +250 Bonus Points'
                    : shields > 0
                    ? 'Incorrect · Lost 1 Shield — Solve next question to pass'
                    : 'Incorrect · No Shields Remaining'}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-300">
                  {question.explanation}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              {isCorrect ? (
                <button
                  type="button"
                  onClick={onAdvanceLevel}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-500 px-5 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-emerald-300 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Enter Level {level + 1}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : shields > 0 ? (
                <button
                  type="button"
                  onClick={onRetryQuestion}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-amber-500 px-5 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-amber-300 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Try Next Question</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onFinishGameOver}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-rose-500 px-5 text-sm font-bold text-white transition-colors hover:bg-rose-400 focus-visible:outline-2 focus-visible:outline-rose-300 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>View Results</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
