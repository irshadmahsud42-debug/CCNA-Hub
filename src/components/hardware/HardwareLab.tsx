import React, { useState } from 'react';
import { HARDWARE_COMPONENTS, DEVICE_SORTING_ITEMS } from '../../data/hardwareData';
import { soundManager } from '../../utils/audio';
import {
  Cpu,
  Layers,
  HardDrive,
  Monitor,
  Zap,
  CheckCircle2,
  Binary,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface HardwareLabProps {
  onLabComplete: (earnedXp: number) => void;
}

export const HardwareLab: React.FC<HardwareLabProps> = ({ onLabComplete }) => {
  const [activeTab, setActiveTab] = useState<'inside_pc' | 'sorting_game' | 'binary_toy'>('inside_pc');

  // Inside PC State
  const [selectedComponentId, setSelectedComponentId] = useState('cpu');
  const activeComponent = HARDWARE_COMPONENTS.find((c) => c.id === selectedComponentId) || HARDWARE_COMPONENTS[0];

  // Sorting Challenge State
  const [sortingAnswers, setSortingAnswers] = useState<Record<string, 'input' | 'output' | 'storage'>>({});
  const [sortingScore, setSortingScore] = useState<number | null>(null);

  const handleDeviceClassify = (deviceId: string, category: 'input' | 'output' | 'storage') => {
    soundManager.playKeyClick();
    setSortingAnswers((prev) => ({ ...prev, [deviceId]: category }));
  };

  const evaluateSorting = () => {
    let correct = 0;
    DEVICE_SORTING_ITEMS.forEach((item) => {
      if (sortingAnswers[item.id] === item.category) {
        correct++;
      }
    });
    setSortingScore(correct);
    if (correct >= 8) {
      soundManager.playFanfare();
      onLabComplete(40);
    } else {
      soundManager.playError();
    }
  };

  const resetSorting = () => {
    soundManager.playKeyClick();
    setSortingAnswers({});
    setSortingScore(null);
  };

  // Binary Switcher Toy State (8 bits: 128, 64, 32, 16, 8, 4, 2, 1)
  const [bits, setBits] = useState<number[]>([0, 1, 0, 0, 0, 0, 0, 1]); // Default 65 = 'A'

  const toggleBit = (index: number) => {
    soundManager.playKeyClick();
    setBits((prev) => {
      const copy = [...prev];
      copy[index] = copy[index] === 1 ? 0 : 1;
      return copy;
    });
  };

  const bitWeights = [128, 64, 32, 16, 8, 4, 2, 1];
  const decimalValue = bits.reduce((acc, bit, idx) => acc + bit * bitWeights[idx], 0);
  const asciiChar = decimalValue >= 32 && decimalValue <= 126 ? String.fromCharCode(decimalValue) : 'Special / Control';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header and Lab Tabs */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Module 04</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">Computer Architecture & Bits</span>
            <span aria-hidden="true">·</span>
            <span>Hands-on Systems</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Hardware & Systems Lab
          </h1>
          <p className="text-sm text-slate-300 mt-0.5 max-w-2xl">
            Explore what happens inside a computer case, categorize input and output peripherals, and discover how 8 binary switches represent letters and numbers.
          </p>
        </div>

        {/* Lab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'inside_pc', label: 'Inside the Box 🖥️' },
            { id: 'sorting_game', label: 'Input / Output Sorter ⚡' },
            { id: 'binary_toy', label: '8-Bit Binary Toy 0️⃣1️⃣' },
          ].map((tab) => {
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playKeyClick();
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isCurrent
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- Tab 1: Inside the Box (Hardware Anatomy) --- */}
      {activeTab === 'inside_pc' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Component Selection Grid */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Select a Component to Inspect:
            </span>

            <div className="space-y-2">
              {HARDWARE_COMPONENTS.map((comp) => {
                const isSelected = comp.id === selectedComponentId;
                return (
                  <button
                    key={comp.id}
                    onClick={() => {
                      soundManager.playKeyClick();
                      setSelectedComponentId(comp.id);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500 shadow-sm'
                        : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-emerald-400">
                        {comp.id === 'cpu' && <Cpu className="h-4 w-4" />}
                        {comp.id === 'ram' && <Layers className="h-4 w-4" />}
                        {comp.id === 'storage' && <HardDrive className="h-4 w-4" />}
                        {comp.id === 'gpu' && <Monitor className="h-4 w-4" />}
                        {comp.id === 'motherboard' && <Binary className="h-4 w-4" />}
                        {comp.id === 'psu' && <Zap className="h-4 w-4" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm text-white">{comp.name}</h3>
                        <span className="text-[10px] text-slate-400 capitalize">{comp.category} Tier</span>
                      </div>
                    </div>
                    <ArrowRight className={`h-4 w-4 ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Component Detail Visual Card */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                Component Breakdown
              </span>
              <h2 className="text-xl font-bold text-white mt-1">{activeComponent.name}</h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">{activeComponent.role}</p>
            </div>

            {/* Real World Analogy Box */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                Real-World Analogy:
              </span>
              <p className="text-xs text-amber-100 leading-relaxed">{activeComponent.realWorldAnalogy}</p>
            </div>

            {/* What Happens Without It */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-1">
                What happens if this part is missing?
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{activeComponent.whatHappensWithoutIt}</p>
            </div>

            {/* Fun Fact */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                Cool Engineering Fact:
              </span>
              <p className="text-xs text-emerald-200 leading-relaxed">{activeComponent.funFact}</p>
            </div>
          </div>
        </div>
      )}

      {/* --- Tab 2: Input / Output / Storage Sorter --- */}
      {activeTab === 'sorting_game' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-3">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Hardware Classification Challenge</h2>
              <p className="text-xs text-slate-300">
                Classify each peripheral device as an <strong>Input</strong> (data going into PC), <strong>Output</strong> (data coming out to human), or <strong>Storage</strong> (data kept safe).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={resetSorting}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
              <button
                onClick={evaluateSorting}
                className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm"
              >
                Check My Answers
              </button>
            </div>
          </div>

          {/* Results banner if evaluated */}
          {sortingScore !== null && (
            <div className={`mb-6 rounded-xl p-4 border flex items-center justify-between ${
              sortingScore >= 8
                ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                : 'border-amber-500/40 bg-amber-950/30 text-amber-200'
            }`}>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                <div>
                  <h4 className="font-bold text-white text-sm">
                    Score: {sortingScore} / {DEVICE_SORTING_ITEMS.length} Correct!
                  </h4>
                  <p className="text-xs opacity-90">
                    {sortingScore >= 8 ? 'Mastery Unlocked! (+40 XP awarded)' : 'Check the items marked below and give it another shot!'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Device Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEVICE_SORTING_ITEMS.map((dev) => {
              const currentChoice = sortingAnswers[dev.id];
              const isEvaluated = sortingScore !== null;
              const isCorrect = isEvaluated && currentChoice === dev.category;

              return (
                <div
                  key={dev.id}
                  className={`rounded-xl border p-4 transition-all ${
                    isEvaluated
                      ? isCorrect
                        ? 'border-emerald-500/40 bg-emerald-950/20'
                        : 'border-rose-500/40 bg-rose-950/20'
                      : 'border-slate-800 bg-slate-950/70'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-sm text-white">{dev.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{dev.description}</p>
                    </div>
                    {isEvaluated && (
                      <span className={`text-xs font-bold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isCorrect ? '✓ Correct' : `✕ Correct: ${dev.category}`}
                      </span>
                    )}
                  </div>

                  {/* Classification Button Strip */}
                  <div className="flex items-center gap-2 mt-3">
                    {(['input', 'output', 'storage'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleDeviceClassify(dev.id, cat)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border capitalize transition-colors ${
                          currentChoice === cat
                            ? 'border-emerald-400 bg-emerald-500 text-slate-950 font-bold'
                            : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- Tab 3: 8-Bit Binary Switcher Toy --- */}
      {activeTab === 'binary_toy' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4 mb-6">
            <h2 className="text-lg font-bold text-white mb-1">Interactive 8-Bit Binary Switcher</h2>
            <p className="text-xs text-slate-300">
              Inside computers, billions of transistors act as simple on/off switches (1 = ON, 0 = OFF). By grouping 8 bits together into a <strong>Byte</strong>, computers represent numbers, letters, and instructions!
            </p>
          </div>

          {/* Interactive Bit Switches Deck */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 mb-6">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 text-center">
              Click any switch to toggle between 1 (ON) and 0 (OFF):
            </span>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 max-w-3xl mx-auto">
              {bits.map((bit, idx) => {
                const weight = bitWeights[idx];
                return (
                  <button
                    key={idx}
                    onClick={() => toggleBit(idx)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      bit === 1
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 shadow-md ring-1 ring-emerald-400 scale-102'
                        : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-slate-400 mb-1">+{weight}</span>
                    <span className="text-2xl font-mono font-bold">{bit}</span>
                    <span className={`text-[10px] font-bold mt-1 uppercase ${bit === 1 ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {bit === 1 ? 'ON' : 'OFF'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Translation Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center">
              <span className="text-xs uppercase text-slate-400 font-semibold block mb-1">
                Binary Byte String
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-400 tracking-wider">
                {bits.join('')}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center">
              <span className="text-xs uppercase text-slate-400 font-semibold block mb-1">
                Decimal Number Value
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-sky-400 tabular-nums">
                {decimalValue}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center">
              <span className="text-xs uppercase text-slate-400 font-semibold block mb-1">
                ASCII Text Character
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-amber-300">
                '{asciiChar}'
              </span>
            </div>
          </div>

          {/* Educational Callout */}
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-300 flex items-start gap-3">
            <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Did you know? </strong>
              The letter 'A' is stored in computer memory as <strong>01000001</strong> (64 + 1 = 65). When you type on your keyboard, the computer processor is translating electrical pulses into these 8-bit bytes!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
