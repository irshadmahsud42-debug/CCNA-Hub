import React, { useState, useEffect, useRef } from 'react';
import { CodingChallenge, CodeBlock, CommandType } from '../../types';
import { CODING_CHALLENGES } from '../../data/codingData';
import { soundManager } from '../../utils/audio';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Plus,
  Trash2,
  HelpCircle,
  Code2,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import roverImg from '../../assets/images/interactive_coding_rover_1791443604746.jpg';

interface CodingLabProps {
  onChallengeComplete: (challengeId: string, earnedXp: number) => void;
  completedChallenges: string[];
}

export const CodingLab: React.FC<CodingLabProps> = ({
  onChallengeComplete,
  completedChallenges,
}) => {
  const [selectedChallengeIndex, setSelectedChallengeIndex] = useState(0);
  const challenge = CODING_CHALLENGES[selectedChallengeIndex];

  // Code editor state
  const [program, setProgram] = useState<CodeBlock[]>([]);
  const [activeTab, setActiveTab] = useState<'blocks' | 'syntax'>('blocks');

  // Simulation execution state
  const [roverPos, setRoverPos] = useState({ x: 0, y: 0, dir: 'right' as 'up' | 'down' | 'left' | 'right' });
  const [collectedCrystals, setCollectedCrystals] = useState<{ x: number; y: number }[]>([]);
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2>(1);

  // Repeat count state for loops
  const [repeatCount, setRepeatCount] = useState(4);

  const executionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or reset challenge
  useEffect(() => {
    resetSimulation();
    if (challenge.starterBlocks && challenge.starterBlocks.length > 0) {
      setProgram([...challenge.starterBlocks]);
    } else {
      setProgram([]);
    }
    setShowHint(false);
    setIsSuccess(false);
    setErrorMessage(null);
  }, [selectedChallengeIndex]);

  const resetSimulation = () => {
    if (executionTimerRef.current) {
      clearInterval(executionTimerRef.current);
      executionTimerRef.current = null;
    }
    setIsRunning(false);
    setActiveBlockIndex(null);
    setRoverPos({ ...challenge.startPos });
    setCollectedCrystals([]);
    setErrorMessage(null);
    setIsSuccess(false);
  };

  // Add block to program
  const addBlock = (type: CommandType) => {
    soundManager.playKeyClick();
    let label = 'Move Forward';
    let color = 'bg-emerald-600';

    if (type === 'move_forward') {
      label = 'Move Forward 1 Step';
      color = 'bg-emerald-600';
    } else if (type === 'turn_left') {
      label = 'Turn Left 90°';
      color = 'bg-blue-600';
    } else if (type === 'turn_right') {
      label = 'Turn Right 90°';
      color = 'bg-indigo-600';
    } else if (type === 'collect_crystal') {
      label = 'Collect Energy Crystal';
      color = 'bg-amber-600';
    } else if (type === 'repeat_start') {
      label = `Repeat [${repeatCount} Times]`;
      color = 'bg-purple-600';
    } else if (type === 'repeat_end') {
      label = 'End Repeat';
      color = 'bg-purple-700';
    } else if (type === 'if_obstacle') {
      label = 'If Front Blocked: Turn Left';
      color = 'bg-rose-600';
    }

    const newBlock: CodeBlock = {
      id: `block-${Date.now()}-${Math.random()}`,
      type,
      label,
      color,
      repeatCount: type === 'repeat_start' ? repeatCount : undefined,
    };

    setProgram((prev) => [...prev, newBlock]);
  };

  const removeBlock = (index: number) => {
    soundManager.playKeyClick();
    setProgram((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllBlocks = () => {
    soundManager.playKeyClick();
    setProgram([]);
    resetSimulation();
  };

  // Expand program loops into sequential runtime instructions
  const unrollProgram = (): { blockIndex: number; action: CommandType; repeatCount?: number }[] => {
    const sequence: { blockIndex: number; action: CommandType; repeatCount?: number }[] = [];
    let i = 0;
    while (i < program.length) {
      const block = program[i];
      if (block.type === 'repeat_start') {
        const count = block.repeatCount || 4;
        // Find matching repeat_end
        const innerBlocks: { blockIndex: number; action: CommandType }[] = [];
        let j = i + 1;
        while (j < program.length && program[j].type !== 'repeat_end') {
          innerBlocks.push({ blockIndex: j, action: program[j].type });
          j++;
        }
        for (let r = 0; r < count; r++) {
          innerBlocks.forEach((inner) => sequence.push(inner));
        }
        i = j + 1; // Skip past repeat_end
      } else if (block.type !== 'repeat_end') {
        sequence.push({ blockIndex: i, action: block.type });
        i++;
      } else {
        i++;
      }
    }
    return sequence;
  };

  // Step execution
  const executeStep = (
    currentPos: { x: number; y: number; dir: 'up' | 'down' | 'left' | 'right' },
    currentCollected: { x: number; y: number }[],
    action: CommandType
  ): {
    nextPos: { x: number; y: number; dir: 'up' | 'down' | 'left' | 'right' };
    nextCollected: { x: number; y: number }[];
    error: string | null;
  } => {
    let nextPos = { ...currentPos };
    let nextCollected = [...currentCollected];
    let error: string | null = null;

    if (action === 'turn_left') {
      const rotMap = { up: 'left', left: 'down', down: 'right', right: 'up' } as const;
      nextPos.dir = rotMap[currentPos.dir];
      soundManager.playKeyClick();
    } else if (action === 'turn_right') {
      const rotMap = { up: 'right', right: 'down', down: 'left', left: 'up' } as const;
      nextPos.dir = rotMap[currentPos.dir];
      soundManager.playKeyClick();
    } else if (action === 'move_forward') {
      const delta = {
        up: { dx: 0, dy: -1 },
        down: { dx: 0, dy: 1 },
        left: { dx: -1, dy: 0 },
        right: { dx: 1, dy: 0 },
      }[currentPos.dir];

      const targetX = currentPos.x + delta.dx;
      const targetY = currentPos.y + delta.dy;

      // Bounds check
      if (
        targetX < 0 ||
        targetX >= challenge.gridSize.width ||
        targetY < 0 ||
        targetY >= challenge.gridSize.height
      ) {
        error = `Out of bounds! Rover hit the grid boundary at (${targetX}, ${targetY}).`;
        soundManager.playError();
        return { nextPos, nextCollected, error };
      }

      // Wall check
      const hitWall = challenge.items.find(
        (item) => item.type === 'wall' && item.x === targetX && item.y === targetY
      );
      if (hitWall) {
        error = `Collision! Rover crashed into space debris at (${targetX}, ${targetY}).`;
        soundManager.playError();
        return { nextPos, nextCollected, error };
      }

      nextPos.x = targetX;
      nextPos.y = targetY;
      soundManager.playKeyClick();
    } else if (action === 'collect_crystal') {
      const crystal = challenge.items.find(
        (item) => item.type === 'crystal' && item.x === currentPos.x && item.y === currentPos.y
      );
      if (crystal) {
        const alreadyCollected = currentCollected.some(
          (c) => c.x === currentPos.x && c.y === currentPos.y
        );
        if (!alreadyCollected) {
          nextCollected.push({ x: currentPos.x, y: currentPos.y });
          soundManager.playSuccess();
        }
      } else {
        // Warning no crystal here
      }
    } else if (action === 'if_obstacle') {
      // Check if tile ahead is wall
      const delta = {
        up: { dx: 0, dy: -1 },
        down: { dx: 0, dy: 1 },
        left: { dx: -1, dy: 0 },
        right: { dx: 1, dy: 0 },
      }[currentPos.dir];
      const checkX = currentPos.x + delta.dx;
      const checkY = currentPos.y + delta.dy;
      const isBlocked =
        checkX < 0 ||
        checkX >= challenge.gridSize.width ||
        checkY < 0 ||
        checkY >= challenge.gridSize.height ||
        challenge.items.some((item) => item.type === 'wall' && item.x === checkX && item.y === checkY);

      if (isBlocked) {
        const rotMap = { up: 'left', left: 'down', down: 'right', right: 'up' } as const;
        nextPos.dir = rotMap[currentPos.dir];
      }
    }

    return { nextPos, nextCollected, error };
  };

  // Run whole program
  const runProgram = () => {
    if (program.length === 0) {
      setErrorMessage('Please add at least one command block before running!');
      soundManager.playError();
      return;
    }

    resetSimulation();
    setIsRunning(true);

    const steps = unrollProgram();
    let stepIndex = 0;
    let currPos = { ...challenge.startPos };
    let currCollected: { x: number; y: number }[] = [];

    const intervalTime = playbackSpeed === 1 ? 550 : 280;

    executionTimerRef.current = setInterval(() => {
      if (stepIndex >= steps.length) {
        clearInterval(executionTimerRef.current!);
        executionTimerRef.current = null;
        setIsRunning(false);
        setActiveBlockIndex(null);

        // Check victory conditions
        const portal = challenge.items.find((i) => i.type === 'portal');
        const totalCrystalsInChallenge = challenge.items.filter((i) => i.type === 'crystal').length;

        const atPortal = portal ? currPos.x === portal.x && currPos.y === portal.y : true;
        const gotAllCrystals = currCollected.length >= totalCrystalsInChallenge;

        if (atPortal && gotAllCrystals) {
          setIsSuccess(true);
          soundManager.playFanfare();
          onChallengeComplete(challenge.id, 50);
        } else if (!atPortal) {
          setErrorMessage('Mission incomplete: Rover did not finish at the green recharge portal.');
          soundManager.playError();
        } else if (!gotAllCrystals) {
          setErrorMessage(`Mission incomplete: You collected ${currCollected.length}/${totalCrystalsInChallenge} crystals!`);
          soundManager.playError();
        }
        return;
      }

      const currentStep = steps[stepIndex];
      setActiveBlockIndex(currentStep.blockIndex);

      const result = executeStep(currPos, currCollected, currentStep.action);

      if (result.error) {
        clearInterval(executionTimerRef.current!);
        executionTimerRef.current = null;
        setIsRunning(false);
        setErrorMessage(result.error);
        return;
      }

      currPos = result.nextPos;
      currCollected = result.nextCollected;
      setRoverPos(result.nextPos);
      setCollectedCrystals(result.nextCollected);

      stepIndex++;
    }, intervalTime);
  };

  const stopProgram = () => {
    if (executionTimerRef.current) {
      clearInterval(executionTimerRef.current);
      executionTimerRef.current = null;
    }
    setIsRunning(false);
  };

  const totalCrystals = challenge.items.filter((i) => i.type === 'crystal').length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header and Challenge Selector Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block h-14 w-14 rounded-xl overflow-hidden border border-emerald-500/30 shrink-0 bg-slate-900 shadow-md">
            <img
              src={roverImg}
              alt="Interactive rover bot navigation"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Module 01</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-medium">Algorithmic Logic</span>
              <span aria-hidden="true">·</span>
              <span>{challenge.grade === 'grade3-5' ? 'Grades 3-5 Elementary' : 'Grades 6-8 Middle School'}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">
              {challenge.title}
            </h1>
            <p className="text-sm text-slate-300 mt-0.5 max-w-2xl">
              {challenge.description}
            </p>
          </div>
        </div>

        {/* Challenge selector buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CODING_CHALLENGES.map((ch, idx) => {
            const isCompleted = completedChallenges.includes(ch.id);
            const isCurrent = idx === selectedChallengeIndex;
            return (
              <button
                key={ch.id}
                onClick={() => {
                  soundManager.playKeyClick();
                  setSelectedChallengeIndex(idx);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isCurrent
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : isCompleted
                    ? 'bg-slate-800/90 text-emerald-400 hover:bg-slate-700'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {isCompleted && <CheckCircle2 className="h-3 w-3" />}
                <span>Lvl {idx + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Zone Sandbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone: Interactive 2D Grid Canvas (approx 60% = 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl relative overflow-hidden">
            {/* Top Stats Bar inside simulator */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-xs">
              <div className="flex items-center gap-3 text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-emerald-400" />
                  <span>Rover: ({roverPos.x}, {roverPos.y}) Facing {roverPos.dir.toUpperCase()}</span>
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-amber-300 font-medium">
                  Crystals: {collectedCrystals.length} / {totalCrystals}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <HelpCircle className="h-3.5 w-3.5 text-sky-400" />
                  <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
                </button>
              </div>
            </div>

            {/* Hint Box if toggled */}
            {showHint && (
              <div className="mb-4 rounded-lg border border-sky-500/30 bg-sky-950/40 p-3 text-xs text-sky-200 flex items-start gap-2 animate-in fade-in">
                <Sparkles className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-white">Concept Hint: </strong>
                  {challenge.hint}
                </div>
              </div>
            )}

            {/* 2D Interactive Grid Visualizer */}
            <div className="flex justify-center p-2 bg-slate-950/80 rounded-xl border border-slate-800/80">
              <div
                className="grid gap-1.5 p-3 rounded-lg bg-slate-900/60"
                style={{
                  gridTemplateColumns: `repeat(${challenge.gridSize.width}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: challenge.gridSize.height }).map((_, row) =>
                  Array.from({ length: challenge.gridSize.width }).map((_, col) => {
                    const isRoverHere = roverPos.x === col && roverPos.y === row;
                    const isCrystalHere = challenge.items.some(
                      (it) => it.type === 'crystal' && it.x === col && it.y === row
                    );
                    const isCrystalCollected = collectedCrystals.some(
                      (c) => c.x === col && c.y === row
                    );
                    const isWall = challenge.items.some(
                      (it) => it.type === 'wall' && it.x === col && it.y === row
                    );
                    const isPortal = challenge.items.some(
                      (it) => it.type === 'portal' && it.x === col && it.y === row
                    );

                    return (
                      <div
                        key={`${col}-${row}`}
                        className={`relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-lg border transition-all ${
                          isWall
                            ? 'border-slate-700 bg-slate-800 text-slate-500 shadow-inner'
                            : isPortal
                            ? 'border-emerald-500/50 bg-emerald-950/30 ring-1 ring-emerald-500/30'
                            : 'border-slate-800/60 bg-slate-900/40'
                        }`}
                      >
                        {/* Coordinate subtle tag */}
                        <span className="absolute top-1 left-1.5 text-[9px] text-slate-600 font-mono">
                          {col},{row}
                        </span>

                        {/* Space Debris Wall */}
                        {isWall && (
                          <div className="flex flex-col items-center">
                            <span className="text-xl">🪨</span>
                          </div>
                        )}

                        {/* Power Portal */}
                        {isPortal && !isRoverHere && (
                          <div className="flex flex-col items-center animate-pulse">
                            <span className="text-xl">⚡</span>
                            <span className="text-[9px] font-bold text-emerald-400 uppercase">Goal</span>
                          </div>
                        )}

                        {/* Energy Crystal */}
                        {isCrystalHere && !isCrystalCollected && !isRoverHere && (
                          <div className="flex flex-col items-center transition-transform hover:scale-110">
                            <span className="text-xl animate-bounce">💎</span>
                          </div>
                        )}

                        {/* Rover Bot Presence */}
                        {isRoverHere && (
                          <div
                            className={`flex flex-col items-center justify-center transition-transform duration-300 ${
                              roverPos.dir === 'up'
                                ? 'rotate-0'
                                : roverPos.dir === 'right'
                                ? 'rotate-90'
                                : roverPos.dir === 'down'
                                ? 'rotate-180'
                                : '-rotate-90'
                            }`}
                          >
                            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/30">
                              🤖
                              {/* Direction Pointer */}
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Playback & Execution Deck */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
              <div className="flex items-center gap-2">
                {!isRunning ? (
                  <button
                    onClick={runProgram}
                    className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Run Program</span>
                  </button>
                ) : (
                  <button
                    onClick={stopProgram}
                    className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors"
                  >
                    <Pause className="h-3.5 w-3.5 fill-current" />
                    <span>Pause</span>
                  </button>
                )}

                <button
                  onClick={resetSimulation}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Speed Controller */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Speed:</span>
                <button
                  onClick={() => setPlaybackSpeed(1)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    playbackSpeed === 1 ? 'bg-slate-800 text-white font-semibold' : 'hover:text-slate-200'
                  }`}
                >
                  1x Normal
                </button>
                <button
                  onClick={() => setPlaybackSpeed(2)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    playbackSpeed === 2 ? 'bg-slate-800 text-white font-semibold' : 'hover:text-slate-200'
                  }`}
                >
                  2x Turbo
                </button>
              </div>
            </div>

            {/* Status Feedback Messages */}
            {errorMessage && (
              <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-200 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {isSuccess && (
              <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-4 text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Mission Accomplished! (+50 XP)</h4>
                    <p className="text-xs text-emerald-300/80">Rover collected all power crystals and docked safely!</p>
                  </div>
                </div>
                {selectedChallengeIndex < CODING_CHALLENGES.length - 1 && (
                  <button
                    onClick={() => {
                      soundManager.playKeyClick();
                      setSelectedChallengeIndex((prev) => prev + 1);
                    }}
                    className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors whitespace-nowrap self-end sm:self-auto"
                  >
                    Next Mission →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Zone: Control Deck & Block Builder (approx 40% = 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
            {/* View Mode Switcher: Blocks vs Real Syntax */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Instruction Program ({program.length} blocks)
              </span>

              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setActiveTab('blocks')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeTab === 'blocks'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="h-3 w-3" />
                  <span>Blocks</span>
                </button>
                <button
                  onClick={() => setActiveTab('syntax')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeTab === 'syntax'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code2 className="h-3 w-3" />
                  <span>Python View</span>
                </button>
              </div>
            </div>

            {/* Block Tray: Available Commands to Click/Add */}
            <div className="mb-4">
              <span className="block text-xs font-medium text-slate-400 mb-2">
                Click to Add Command:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {challenge.availableBlocks.includes('move_forward') && (
                  <button
                    onClick={() => addBlock('move_forward')}
                    className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/40 hover:border-emerald-500/50 transition-colors text-left"
                  >
                    <Plus className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Move Forward</span>
                  </button>
                )}

                {challenge.availableBlocks.includes('turn_left') && (
                  <button
                    onClick={() => addBlock('turn_left')}
                    className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-950/30 px-3 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-900/40 hover:border-blue-500/50 transition-colors text-left"
                  >
                    <Plus className="h-3.5 w-3.5 text-blue-400" />
                    <span>Turn Left 90°</span>
                  </button>
                )}

                {challenge.availableBlocks.includes('turn_right') && (
                  <button
                    onClick={() => addBlock('turn_right')}
                    className="flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-950/30 px-3 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-900/40 hover:border-indigo-500/50 transition-colors text-left"
                  >
                    <Plus className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Turn Right 90°</span>
                  </button>
                )}

                {challenge.availableBlocks.includes('collect_crystal') && (
                  <button
                    onClick={() => addBlock('collect_crystal')}
                    className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-950/30 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-900/40 hover:border-amber-500/50 transition-colors text-left"
                  >
                    <Plus className="h-3.5 w-3.5 text-amber-400" />
                    <span>Collect 💎</span>
                  </button>
                )}

                {challenge.availableBlocks.includes('repeat_start') && (
                  <div className="col-span-2 flex items-center gap-2 bg-purple-950/30 p-2 rounded-lg border border-purple-500/30">
                    <button
                      onClick={() => addBlock('repeat_start')}
                      className="flex-1 flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-purple-300 hover:text-white"
                    >
                      <Plus className="h-3 w-3 text-purple-400" />
                      <span>Start Repeat Loop</span>
                    </button>
                    <div className="flex items-center gap-1 text-xs text-purple-300">
                      <span>Count:</span>
                      <select
                        value={repeatCount}
                        onChange={(e) => setRepeatCount(Number(e.target.value))}
                        className="bg-slate-900 border border-purple-500/40 text-white rounded px-2 py-0.5 text-xs font-mono"
                      >
                        {[2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num}>
                            {num}x
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {challenge.availableBlocks.includes('repeat_end') && (
                  <button
                    onClick={() => addBlock('repeat_end')}
                    className="col-span-2 flex items-center justify-center gap-2 rounded-lg border border-purple-600/30 bg-purple-950/40 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-900/40 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5 text-purple-400" />
                    <span>End Repeat Loop ↺</span>
                  </button>
                )}

                {challenge.availableBlocks.includes('if_obstacle') && (
                  <button
                    onClick={() => addBlock('if_obstacle')}
                    className="col-span-2 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-950/30 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900/40 transition-colors text-left"
                  >
                    <Plus className="h-3.5 w-3.5 text-rose-400" />
                    <span>If Front Blocked → Turn Left</span>
                  </button>
                )}
              </div>
            </div>

            {/* Active Code Sequence */}
            {activeTab === 'blocks' ? (
              <div className="border border-slate-800 rounded-xl bg-slate-950/60 p-3 min-h-[260px] max-h-[360px] overflow-y-auto">
                {program.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500">
                    <Layers className="h-8 w-8 mb-2 stroke-1 text-slate-600" />
                    <p className="text-xs">No command blocks added yet.</p>
                    <p className="text-[11px] text-slate-600 mt-1">Click any command above to construct Rover's algorithm.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {program.map((block, idx) => {
                      const isExecuting = activeBlockIndex === idx;
                      return (
                        <div
                          key={block.id}
                          className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                            isExecuting
                              ? 'ring-2 ring-emerald-400 bg-emerald-950 text-white shadow-md'
                              : 'bg-slate-900 text-slate-200 border border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-500 text-[10px] w-4">{idx + 1}.</span>
                            <span className={`inline-block h-2 w-2 rounded-full ${
                              block.type === 'move_forward'
                                ? 'bg-emerald-400'
                                : block.type.startsWith('turn')
                                ? 'bg-blue-400'
                                : block.type === 'collect_crystal'
                                ? 'bg-amber-400'
                                : block.type.startsWith('repeat')
                                ? 'bg-purple-400'
                                : 'bg-rose-400'
                            }`} />
                            <span>{block.label}</span>
                          </div>

                          <button
                            onClick={() => removeBlock(idx)}
                            disabled={isRunning}
                            className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                            title="Remove step"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Real Python Preview */
              <div className="border border-slate-800 rounded-xl bg-slate-950/90 p-4 font-mono text-xs text-slate-300 min-h-[260px] max-h-[360px] overflow-y-auto">
                <div className="text-slate-500 text-[11px] mb-2 border-b border-slate-800/80 pb-1">
                  # Python equivalent representation for this challenge:
                </div>
                <pre className="text-emerald-400 leading-relaxed overflow-x-auto">
                  {challenge.pythonSyntaxPreview}
                </pre>
              </div>
            )}

            {/* Clear All Button */}
            {program.length > 0 && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={clearAllBlocks}
                  disabled={isRunning}
                  className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear Program</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
