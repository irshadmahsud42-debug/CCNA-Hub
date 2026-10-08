import React, { useState, useEffect } from 'react';
import { calculateSubnet, SubnetResult } from '../../utils/subnetCalculator';
import { SUBNETTING_SPEED_BANK } from '../../data/ccnaData';
import { soundManager } from '../../utils/audio';
import {
  Calculator,
  Zap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Binary,
  ArrowRight,
} from 'lucide-react';

export const SubnettingMastery: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'drill' | 'calculator'>('drill');

  // Calculator State
  const [calcIp, setCalcIp] = useState('192.168.10.67');
  const [calcCidr, setCalcCidr] = useState(26);
  const [calcResult, setCalcResult] = useState<SubnetResult | null>(null);

  useEffect(() => {
    const res = calculateSubnet(calcIp, calcCidr);
    setCalcResult(res);
  }, [calcIp, calcCidr]);

  // Speed Drill State
  const [drillIndex, setDrillIndex] = useState(0);
  const currentPrompt = SUBNETTING_SPEED_BANK[drillIndex] || SUBNETTING_SPEED_BANK[0];
  const drillTarget = calculateSubnet(currentPrompt.ip, currentPrompt.cidr)!;

  const [inputNetwork, setInputNetwork] = useState('');
  const [inputFirst, setInputFirst] = useState('');
  const [inputLast, setInputLast] = useState('');
  const [inputBroadcast, setInputBroadcast] = useState('');
  const [inputMask, setInputMask] = useState('');

  const [isEvaluated, setIsEvaluated] = useState(false);
  const [drillScore, setDrillScore] = useState<{
    networkCorrect: boolean;
    firstCorrect: boolean;
    lastCorrect: boolean;
    broadcastCorrect: boolean;
    maskCorrect: boolean;
    allCorrect: boolean;
  } | null>(null);

  const [streak, setStreak] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [drillIndex]);

  const resetInputs = () => {
    setInputNetwork('');
    setInputFirst('');
    setInputLast('');
    setInputBroadcast('');
    setInputMask('');
    setIsEvaluated(false);
    setDrillScore(null);
    setTimerSeconds(0);
  };

  const nextQuestion = () => {
    soundManager.playKeyClick();
    setDrillIndex((prev) => (prev + 1) % SUBNETTING_SPEED_BANK.length);
    resetInputs();
  };

  const evaluateDrill = () => {
    if (!drillTarget) return;

    const networkCorrect = inputNetwork.trim() === drillTarget.networkAddress;
    const firstCorrect = inputFirst.trim() === drillTarget.firstUsable;
    const lastCorrect = inputLast.trim() === drillTarget.lastUsable;
    const broadcastCorrect = inputBroadcast.trim() === drillTarget.broadcastAddress;
    const maskCorrect = inputMask.trim() === drillTarget.subnetMask;

    const allCorrect = networkCorrect && firstCorrect && lastCorrect && broadcastCorrect && maskCorrect;

    if (allCorrect) {
      soundManager.playSuccess();
      setStreak((s) => s + 1);
    } else {
      soundManager.playError();
      setStreak(0);
    }

    setDrillScore({
      networkCorrect,
      firstCorrect,
      lastCorrect,
      broadcastCorrect,
      maskCorrect,
      allCorrect,
    });
    setIsEvaluated(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Top Header & View Modes */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Domain 1.0</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">Subnetting Mastery</span>
            <span aria-hidden="true">·</span>
            <span>CIDR & VLSM Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            IPv4 Subnetting Drill & Visualizer
          </h1>
          <p className="text-sm text-slate-300 mt-0.5 max-w-2xl">
            Pass the CCNA by solving subnet ranges in under 30 seconds. Calculate Network IDs, First/Last Usable hosts, Broadcast addresses, and binary bit masks.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              soundManager.playKeyClick();
              setActiveTab('drill');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'drill'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Speed Drill (Exam Mode)</span>
          </button>
          <button
            onClick={() => {
              soundManager.playKeyClick();
              setActiveTab('calculator');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>CIDR Binary Calculator</span>
          </button>
        </div>
      </div>

      {/* --- View 1: Speed Drill Mode --- */}
      {activeTab === 'drill' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Prompt Card */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-6">
            {/* Top Prompt Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
              <div>
                <span className="text-xs uppercase text-slate-400 font-semibold block">Target IP & Prefix</span>
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-wide mt-1 block">
                  {currentPrompt.ip} /{currentPrompt.cidr}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="text-slate-400">
                  <span>Timer: </span>
                  <span className="font-bold text-white tabular-nums">{timerSeconds}s</span>
                </div>
                <div className="text-slate-400">
                  <span>Streak: </span>
                  <span className="font-bold text-amber-400 tabular-nums">🔥 {streak}</span>
                </div>
              </div>
            </div>

            {/* User Input Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  1. Network Address (Subnet ID):
                </label>
                <input
                  type="text"
                  value={inputNetwork}
                  onChange={(e) => setInputNetwork(e.target.value)}
                  placeholder="e.g. 192.168.10.64"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-white placeholder-slate-600 focus:border-emerald-400 focus:outline-none"
                />
                {isEvaluated && (
                  <span className={`block mt-1 font-mono text-[11px] ${drillScore?.networkCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {drillScore?.networkCorrect ? '✓ Correct' : `✕ Expected: ${drillTarget.networkAddress}`}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  2. Subnet Mask (Dotted Decimal):
                </label>
                <input
                  type="text"
                  value={inputMask}
                  onChange={(e) => setInputMask(e.target.value)}
                  placeholder="e.g. 255.255.255.192"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-white placeholder-slate-600 focus:border-emerald-400 focus:outline-none"
                />
                {isEvaluated && (
                  <span className={`block mt-1 font-mono text-[11px] ${drillScore?.maskCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {drillScore?.maskCorrect ? '✓ Correct' : `✕ Expected: ${drillTarget.subnetMask}`}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  3. First Usable Host IP:
                </label>
                <input
                  type="text"
                  value={inputFirst}
                  onChange={(e) => setInputFirst(e.target.value)}
                  placeholder="e.g. 192.168.10.65"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-white placeholder-slate-600 focus:border-emerald-400 focus:outline-none"
                />
                {isEvaluated && (
                  <span className={`block mt-1 font-mono text-[11px] ${drillScore?.firstCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {drillScore?.firstCorrect ? '✓ Correct' : `✕ Expected: ${drillTarget.firstUsable}`}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  4. Last Usable Host IP:
                </label>
                <input
                  type="text"
                  value={inputLast}
                  onChange={(e) => setInputLast(e.target.value)}
                  placeholder="e.g. 192.168.10.126"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-white placeholder-slate-600 focus:border-emerald-400 focus:outline-none"
                />
                {isEvaluated && (
                  <span className={`block mt-1 font-mono text-[11px] ${drillScore?.lastCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {drillScore?.lastCorrect ? '✓ Correct' : `✕ Expected: ${drillTarget.lastUsable}`}
                  </span>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1.5">
                  5. Broadcast Address:
                </label>
                <input
                  type="text"
                  value={inputBroadcast}
                  onChange={(e) => setInputBroadcast(e.target.value)}
                  placeholder="e.g. 192.168.10.127"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-white placeholder-slate-600 focus:border-emerald-400 focus:outline-none"
                />
                {isEvaluated && (
                  <span className={`block mt-1 font-mono text-[11px] ${drillScore?.broadcastCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {drillScore?.broadcastCorrect ? '✓ Correct' : `✕ Expected: ${drillTarget.broadcastAddress}`}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <button
                onClick={resetInputs}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Clear Fields</span>
              </button>

              <div className="flex items-center gap-3">
                {!isEvaluated ? (
                  <button
                    onClick={evaluateDrill}
                    className="rounded-lg bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm"
                  >
                    Submit Answers
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm"
                  >
                    <span>Next Subnet Challenge</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Subnetting Cheat Matrix Card */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
            <span className="block text-xs uppercase font-bold text-slate-400 tracking-wider">
              CCNA "Magic Number" Method
            </span>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs text-slate-300 space-y-2">
              <p className="font-medium text-white">How to calculate in your head:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-400">
                <li>Identify the interesting octet where prefix falls.</li>
                <li>Subtract the mask value from 256 to find block size (e.g. 256 - 192 = <strong>64</strong>).</li>
                <li>Count in multiples of 64: 0, 64, 128...</li>
                <li>Find the multiple below target IP to get the Network ID.</li>
              </ol>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
              <span className="block text-[11px] uppercase font-bold text-slate-400 mb-2">
                CIDR / Slash Reference (4th Octet)
              </span>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                <div className="text-slate-300">/25 = .128 (126 hosts)</div>
                <div className="text-slate-300">/26 = .192 (62 hosts)</div>
                <div className="text-slate-300">/27 = .224 (30 hosts)</div>
                <div className="text-slate-300">/28 = .240 (14 hosts)</div>
                <div className="text-slate-300">/29 = .248 (6 hosts)</div>
                <div className="text-slate-300">/30 = .252 (2 hosts)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- View 2: Interactive CIDR Binary Calculator --- */}
      {activeTab === 'calculator' && calcResult && (
        <div className="space-y-6">
          {/* Input Controls */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target IPv4 Address:
                </label>
                <input
                  type="text"
                  value={calcIp}
                  onChange={(e) => setCalcIp(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 font-mono text-sm text-white focus:border-emerald-400 focus:outline-none"
                  placeholder="e.g. 10.50.128.45"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    CIDR Prefix:
                  </label>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    /{calcCidr} ({calcResult.subnetMask})
                  </span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="32"
                  value={calcCidr}
                  onChange={(e) => setCalcCidr(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 32-Bit Binary Visualizer Strip */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            <span className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-4 flex items-center gap-2">
              <Binary className="h-4 w-4 text-emerald-400" />
              <span>32-Bit Binary Mask Representation</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center font-mono">
              {calcResult.binaryMask.map((octet, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">Octet {idx + 1}</span>
                  <div className="flex justify-center gap-1 text-sm font-bold tracking-widest">
                    {octet.split('').map((bit, bIdx) => (
                      <span
                        key={bIdx}
                        className={bit === '1' ? 'text-emerald-400' : 'text-rose-400'}
                      >
                        {bit}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-center gap-6 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-slate-300">Network / Subnet Bits (1s: {calcCidr})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                <span className="text-slate-300">Host Bits (0s: {32 - calcCidr})</span>
              </div>
            </div>
          </div>

          {/* Computed Output Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Network Address
              </span>
              <span className="font-mono text-sm sm:text-base font-bold text-white block truncate">
                {calcResult.networkAddress}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Broadcast Address
              </span>
              <span className="font-mono text-sm sm:text-base font-bold text-white block truncate">
                {calcResult.broadcastAddress}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                First Usable Host
              </span>
              <span className="font-mono text-sm sm:text-base font-bold text-emerald-400 block truncate">
                {calcResult.firstUsable}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Last Usable Host
              </span>
              <span className="font-mono text-sm sm:text-base font-bold text-emerald-400 block truncate">
                {calcResult.lastUsable}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Subnet Mask
              </span>
              <span className="font-mono text-sm sm:text-base font-bold text-white block truncate">
                {calcResult.subnetMask}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Wildcard Mask
              </span>
              <span className="font-mono text-sm sm:text-base font-bold text-amber-400 block truncate">
                {calcResult.wildcardMask}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Usable Hosts
              </span>
              <span className="font-mono text-sm sm:text-base font-bold text-sky-400 block tabular-nums">
                {calcResult.usableHosts.toLocaleString()}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                Address Class & Scope
              </span>
              <span className="font-mono text-sm sm:text-base font-bold text-white block">
                Class {calcResult.ipClass} · {calcResult.isPrivate ? 'RFC 1918 Private' : 'Public'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
