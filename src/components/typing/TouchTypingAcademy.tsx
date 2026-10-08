import React, { useState, useEffect, useRef } from 'react';
import { TypingLesson, TypingCategory } from '../../types';
import { TYPING_LESSONS, KEY_FINGER_MAP, ASTEROID_WORDS } from '../../data/typingData';
import { soundManager } from '../../utils/audio';
import {
  Keyboard,
  RotateCcw,
  Sparkles,
  Trophy,
  Zap,
  CheckCircle2,
  AlertCircle,
  Gamepad2,
  Shield,
} from 'lucide-react';

interface TouchTypingAcademyProps {
  onLessonComplete: (wpm: number, accuracy: number, earnedXp: number) => void;
  bestWpm: number;
}

interface Asteroid {
  id: number;
  word: string;
  x: number; // percentage 10% to 80%
  y: number; // percentage 0% to 90%
  speed: number;
}

export const TouchTypingAcademy: React.FC<TouchTypingAcademyProps> = ({
  onLessonComplete,
  bestWpm,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TypingCategory>('home_row');
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);

  // Filter lessons for selected category (or asteroid game)
  const categoryLessons = TYPING_LESSONS.filter((l) => l.category === selectedCategory);
  const currentLesson = categoryLessons[activeLessonIndex] || TYPING_LESSONS[0];

  // Typing practice state
  const [inputBuffer, setInputBuffer] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errorCount, setErrorCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [activePressedKey, setActivePressedKey] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Asteroid Typer Game State
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [shieldHealth, setShieldHealth] = useState(100);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [gameInput, setGameInput] = useState('');
  const [gameOver, setGameOver] = useState(false);

  const asteroidTimerRef = useRef<NodeJS.Timeout | null>(null);
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset drill when lesson changes
  useEffect(() => {
    resetDrill();
  }, [currentLesson.id, selectedCategory]);

  const resetDrill = () => {
    setInputBuffer('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setErrorCount(0);
    setIsFinished(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Target text characters
  const targetText = currentLesson.text;
  const currentTargetChar = targetText[inputBuffer.length] || '';

  // Get finger info for the next expected character
  const fingerGuide = KEY_FINGER_MAP[currentTargetChar.toLowerCase()] || {
    hand: 'right',
    finger: 'index',
    color: 'bg-slate-700 text-slate-300',
  };

  // Keyboard layout rows for visual QWERTY keyboard
  const keyboardRows = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\''],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  ];

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;

    const val = e.target.value;
    soundManager.playKeyClick();

    if (!startTime) {
      setStartTime(Date.now());
    }

    const lastChar = val[val.length - 1];
    setActivePressedKey(lastChar ? lastChar.toLowerCase() : null);
    setTimeout(() => setActivePressedKey(null), 150);

    // Validate keystroke against target
    if (val.length > inputBuffer.length) {
      const typedChar = val[val.length - 1];
      const expectedChar = targetText[inputBuffer.length];

      if (typedChar !== expectedChar) {
        setErrorCount((prev) => prev + 1);
        soundManager.playError();
      }
    }

    setInputBuffer(val);

    // Calculate real-time stats
    const now = Date.now();
    const elapsedMinutes = startTime ? (now - startTime) / 60000 : 0.01;
    const wordsTyped = val.length / 5;
    const currentWpm = Math.round(wordsTyped / Math.max(elapsedMinutes, 0.05));
    setWpm(currentWpm);

    const totalTyped = val.length + errorCount;
    const currentAccuracy = totalTyped > 0 ? Math.max(0, Math.round((val.length / totalTyped) * 100)) : 100;
    setAccuracy(currentAccuracy);

    // Check completion
    if (val.length >= targetText.length) {
      setIsFinished(true);
      soundManager.playFanfare();
      onLessonComplete(currentWpm, currentAccuracy, 40);
    }
  };

  // --- Asteroid Mini-Game Mechanics ---
  const startAsteroidGame = () => {
    setIsGameActive(true);
    setGameOver(false);
    setGameScore(0);
    setShieldHealth(100);
    setGameInput('');
    setAsteroids([]);

    if (asteroidTimerRef.current) clearInterval(asteroidTimerRef.current);
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);

    // Spawn loop
    spawnTimerRef.current = setInterval(() => {
      const randomWord = ASTEROID_WORDS[Math.floor(Math.random() * ASTEROID_WORDS.length)];
      const newAsteroid: Asteroid = {
        id: Date.now() + Math.random(),
        word: randomWord,
        x: Math.floor(Math.random() * 65) + 15, // between 15% and 80%
        y: 0,
        speed: 1.5 + Math.random() * 1.5,
      };
      setAsteroids((prev) => [...prev, newAsteroid]);
    }, 2400);

    // Motion loop
    asteroidTimerRef.current = setInterval(() => {
      setAsteroids((prev) => {
        const nextList: Asteroid[] = [];
        let damage = 0;

        for (const ast of prev) {
          const newY = ast.y + ast.speed;
          if (newY >= 82) {
            // Impact with base shield!
            damage += 15;
            soundManager.playError();
          } else {
            nextList.push({ ...ast, y: newY });
          }
        }

        if (damage > 0) {
          setShieldHealth((hp) => {
            const newHp = Math.max(0, hp - damage);
            if (newHp <= 0) {
              setGameOver(true);
              setIsGameActive(false);
              soundManager.playError();
            }
            return newHp;
          });
        }

        return nextList;
      });
    }, 200);
  };

  const stopAsteroidGame = () => {
    if (asteroidTimerRef.current) clearInterval(asteroidTimerRef.current);
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    setIsGameActive(false);
  };

  const handleGameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim().toLowerCase();
    setGameInput(val);
    soundManager.playKeyClick();

    // Check if typed text matches any falling asteroid
    const matchedIdx = asteroids.findIndex((a) => a.word.toLowerCase() === val);
    if (matchedIdx !== -1) {
      soundManager.playZap();
      setGameScore((s) => s + 20);
      setAsteroids((prev) => prev.filter((_, idx) => idx !== matchedIdx));
      setGameInput('');
    }
  };

  useEffect(() => {
    return () => {
      if (asteroidTimerRef.current) clearInterval(asteroidTimerRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header & Category Tabs */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Module 02</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">Kinesthetic Muscle Memory</span>
            <span aria-hidden="true">·</span>
            <span>Personal Best: {bestWpm} WPM</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Touch Typing Academy
          </h1>
          <p className="text-sm text-slate-300 mt-0.5 max-w-2xl">
            Train your fingers to strike without looking at the keyboard. Master home row anchors, code syntax brackets, and defensive typing!
          </p>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'home_row', label: 'Home Row (asdf jkl;)' },
            { id: 'top_bottom', label: 'Top & Bottom Rows' },
            { id: 'sentences', label: 'Cyber Wisdom' },
            { id: 'code_syntax', label: 'Coder Syntax { ; }' },
            { id: 'asteroid_game', label: 'Asteroid Arcade 🚀' },
          ].map((cat) => {
            const isCurrent = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  soundManager.playKeyClick();
                  setSelectedCategory(cat.id as TypingCategory);
                  if (cat.id !== 'asteroid_game') {
                    stopAsteroidGame();
                  }
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isCurrent
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {selectedCategory === 'asteroid_game' ? (
        /* Asteroid Typer Arcade Game Mode */
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <Gamepad2 className="h-5 w-5 text-emerald-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Asteroid Typer: Planetary Defense</h2>
                <p className="text-xs text-slate-400">Type the falling words before they strike the energy shield!</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold text-slate-300">Shield:</span>
                <span className={`font-mono font-bold ${shieldHealth > 30 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {shieldHealth}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                <span className="font-semibold text-slate-300">Score:</span>
                <span className="font-mono font-bold text-amber-400 tabular-nums">{gameScore} PTS</span>
              </div>
            </div>
          </div>

          {/* Arcade Sky Canvas */}
          <div className="relative h-80 w-full rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col justify-between p-4">
            {/* Stars background */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

            {!isGameActive && !gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 z-20">
                <Zap className="h-12 w-12 text-emerald-400 mb-2 animate-bounce" />
                <h3 className="text-lg font-bold text-white mb-1">Defend the Base with Fast Typing!</h3>
                <p className="text-xs text-slate-400 mb-4 max-w-sm text-center">
                  Words will descend from orbit. Type them accurately into the laser cannon to vaporize them!
                </p>
                <button
                  onClick={startAsteroidGame}
                  className="rounded-lg bg-emerald-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg"
                >
                  Start Mission
                </button>
              </div>
            )}

            {gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-20">
                <AlertCircle className="h-12 w-12 text-rose-400 mb-2" />
                <h3 className="text-xl font-bold text-white mb-1">Defense Shield Depleted!</h3>
                <p className="text-xs text-slate-400 mb-4">Final Score: {gameScore} Points</p>
                <button
                  onClick={startAsteroidGame}
                  className="rounded-lg bg-emerald-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
                >
                  Play Again
                </button>
              </div>
            )}

            {/* Falling Asteroid Words */}
            {asteroids.map((ast) => (
              <div
                key={ast.id}
                className="absolute transition-all duration-200"
                style={{ left: `${ast.x}%`, top: `${ast.y}%` }}
              >
                <div className="flex items-center gap-1.5 rounded-lg border border-rose-500/50 bg-slate-900/90 px-2.5 py-1 text-xs font-mono font-bold text-rose-300 shadow-md">
                  <span>☄️</span>
                  <span>{ast.word}</span>
                </div>
              </div>
            ))}

            {/* Bottom Shield Line */}
            <div className="mt-auto border-t-2 border-emerald-500/40 pt-2 flex items-center justify-center z-10">
              <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>Base Defense Line</span>
              </div>
            </div>
          </div>

          {/* Typing Laser Input */}
          {isGameActive && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <input
                type="text"
                value={gameInput}
                onChange={handleGameInputChange}
                autoFocus
                placeholder="Type falling words here..."
                className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
              <button
                onClick={stopAsteroidGame}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Quit
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Standard Touch Typing Practice Mode */
        <div className="grid grid-cols-1 gap-6">
          {/* Main Practice Container */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            {/* Top Metrics Row */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 mb-5 gap-3">
              <div className="flex items-center gap-6 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Speed</span>
                  <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                    {wpm} <span className="text-xs font-normal text-slate-400">WPM</span>
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Accuracy</span>
                  <span className="text-xl font-bold font-mono text-sky-400 tabular-nums">
                    {accuracy}%
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Errors</span>
                  <span className="text-xl font-bold font-mono text-rose-400 tabular-nums">
                    {errorCount}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Finger Guide Indicator */}
                {!isFinished && currentTargetChar && (
                  <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs">
                    <span className="text-slate-400">Next Finger:</span>
                    <span className="font-semibold capitalize text-emerald-400">
                      {fingerGuide.hand} {fingerGuide.finger}
                    </span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-white">
                      {currentTargetChar === ' ' ? 'SPACE' : currentTargetChar}
                    </span>
                  </div>
                )}

                <button
                  onClick={resetDrill}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restart Drill</span>
                </button>
              </div>
            </div>

            {/* Target Drill Text Box */}
            <div
              onClick={() => inputRef.current?.focus()}
              className="relative min-h-[110px] cursor-text rounded-xl border border-slate-800 bg-slate-950/80 p-5 font-mono text-lg leading-relaxed tracking-wide select-none"
            >
              <div className="flex flex-wrap">
                {targetText.split('').map((char, idx) => {
                  const isTyped = idx < inputBuffer.length;
                  const isCurrent = idx === inputBuffer.length;
                  const isCorrect = isTyped && inputBuffer[idx] === char;
                  const isIncorrect = isTyped && inputBuffer[idx] !== char;

                  return (
                    <span
                      key={idx}
                      className={`relative transition-colors ${
                        isCurrent
                          ? 'bg-emerald-500/30 text-emerald-200 underline underline-offset-4 decoration-emerald-400 decoration-2'
                          : isCorrect
                          ? 'text-emerald-400 font-semibold'
                          : isIncorrect
                          ? 'bg-rose-500/30 text-rose-300'
                          : 'text-slate-500'
                      }`}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  );
                })}
              </div>

              {/* Hidden real input capturing key events */}
              <input
                ref={inputRef}
                type="text"
                value={inputBuffer}
                onChange={handleInputChange}
                autoFocus
                className="absolute inset-0 opacity-0 cursor-default"
                aria-label="Touch typing input"
              />
            </div>

            {/* Drill Completion Summary */}
            {isFinished && (
              <div className="mt-5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-5 text-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-base">Lesson Mastered! (+40 XP)</h4>
                    <p className="text-xs text-emerald-300/80">
                      Great accuracy! Your muscle memory is growing stronger every day.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={resetDrill}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                  >
                    Repeat Drill
                  </button>
                  {activeLessonIndex < categoryLessons.length - 1 && (
                    <button
                      onClick={() => {
                        soundManager.playKeyClick();
                        setActiveLessonIndex((prev) => prev + 1);
                      }}
                      className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
                    >
                      Next Lesson →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Visual Interactive Keyboard Layout */}
            <div className="mt-8 border-t border-slate-800 pt-6">
              <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Keyboard className="h-3.5 w-3.5 text-emerald-400" />
                  Home-Row QWERTY Finger Map
                </span>
                <span className="text-[11px] text-slate-500">
                  Color bands match specific fingers (Pinky, Ring, Middle, Index)
                </span>
              </div>

              {/* Keyboard Grid */}
              <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-slate-950 p-4 border border-slate-800/80 shadow-inner">
                {keyboardRows.map((row, rIdx) => (
                  <div key={rIdx} className="flex gap-1.5 justify-center w-full">
                    {row.map((k) => {
                      const fingerData = KEY_FINGER_MAP[k.toLowerCase()];
                      const isNextKey = currentTargetChar.toLowerCase() === k.toLowerCase();
                      const isPressed = activePressedKey === k.toLowerCase();

                      return (
                        <div
                          key={k}
                          className={`flex h-10 w-9 sm:w-11 items-center justify-center rounded-lg border text-xs font-mono font-semibold transition-all ${
                            isNextKey
                              ? 'ring-2 ring-emerald-400 bg-emerald-500 text-slate-950 font-bold scale-105 shadow-md'
                              : isPressed
                              ? 'bg-white text-slate-950 scale-95'
                              : fingerData
                              ? fingerData.color
                              : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                          }`}
                        >
                          <span className="uppercase">{k}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* Spacebar Row */}
                <div className="flex gap-1.5 justify-center w-full mt-1">
                  <div
                    className={`flex h-9 w-64 items-center justify-center rounded-lg border text-xs font-mono font-semibold transition-all ${
                      currentTargetChar === ' '
                        ? 'ring-2 ring-purple-400 bg-purple-500 text-slate-950 font-bold scale-102'
                        : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                    }`}
                  >
                    SPACEBAR (Thumbs)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
