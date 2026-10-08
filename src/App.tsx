/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CCNATab } from './types/ccna';
import { CCNANavbar } from './components/CCNANavbar';
import { CLILabSimulator } from './components/cli/CLILabSimulator';
import { SubnettingMastery } from './components/subnetting/SubnettingMastery';
import { TopologyVisualizer } from './components/topology/TopologyVisualizer';
import { ExamSimulator } from './components/exam/ExamSimulator';
import { CheatSheets } from './components/cheatsheet/CheatSheets';
import { GooglePlayExportModal } from './components/pwa/GooglePlayExportModal';
import { CCNA_DOMAINS } from './data/ccnaData';
import { soundManager } from './utils/audio';

import topologyImg from './assets/images/ccna_enterprise_topology_1791453525668.jpg';
import badgeImg from './assets/images/cisco_ios_console_badge_1791453541476.jpg';

import {
  Terminal,
  Calculator,
  Network,
  Award,
  BookOpen,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Cpu,
  Smartphone,
} from 'lucide-react';

const STORAGE_LABS_KEY = 'ccna_completed_labs_v1';

export default function App() {
  const [currentTab, setCurrentTab] = useState<CCNATab>('cli_labs');
  const [completedLabs, setCompletedLabs] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayModalOpen, setIsPlayModalOpen] = useState(false);

  useEffect(() => {
    soundManager.initFromStorage();
    setIsMuted(soundManager.getMuted());

    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_LABS_KEY);
      if (saved) {
        try {
          setCompletedLabs(JSON.parse(saved));
        } catch {
          // ignore parse error
        }
      }
    }
  }, []);

  const handleLabComplete = (labId: string) => {
    if (!completedLabs.includes(labId)) {
      const updated = [...completedLabs, labId];
      setCompletedLabs(updated);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_LABS_KEY, JSON.stringify(updated));
      }
    }
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    soundManager.setMuted(next);
    setIsMuted(next);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Bar Contract Compliant Navigation */}
      <CCNANavbar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        completedLabsCount={completedLabs.length}
        onOpenMobileGuide={() => setIsPlayModalOpen(true)}
      />

      {/* Hero Overview on CLI Labs view */}
      {currentTab === 'cli_labs' && (
        <section className="border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 px-4 py-8 sm:px-6">
          <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-emerald-400">Cisco CCNA 200-301</span>
                <span aria-hidden="true">·</span>
                <span>Interactive Certification Lab Studio</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Master Cisco IOS CLI & CCNA Network Engineering
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Configure routers and Catalyst switches in a live simulated IOS terminal, solve subnetting in under 30 seconds, trace packet flows across 802.1Q trunks, and pass the CCNA 200-301 exam.
              </p>

              {/* Module Navigation Buttons */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                {[
                  { id: 'cli_labs', label: '1. IOS CLI Labs', icon: Terminal },
                  { id: 'subnetting', label: '2. Subnetting Drill', icon: Calculator },
                  { id: 'topology', label: '3. Topology Tracer', icon: Network },
                  { id: 'exam', label: '4. Exam Simulator', icon: Award },
                  { id: 'cheatsheet', label: '5. Cram Sheets', icon: BookOpen },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        soundManager.playKeyClick();
                        setCurrentTab(item.id as CCNATab);
                      }}
                      className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all shadow-sm ${
                        isActive
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                          : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Hero Image with Resilient Fallback Container */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl aspect-video bg-slate-900">
                <img
                  src={topologyImg}
                  alt="Enterprise Network Topology Architecture with routers and switches"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Cisco 200-301 Curriculum</span>
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    6 Official Exam Domains
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 6 Official Domains Bar */}
          <div className="mx-auto max-w-7xl mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CCNA_DOMAINS.map((domain) => (
              <div
                key={domain.id}
                className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-2.5 text-center"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                  <span>{domain.code}</span>
                  <span className="font-bold text-emerald-400">{domain.weight}%</span>
                </div>
                <span className="text-xs font-semibold text-slate-200 line-clamp-1 block">
                  {domain.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'cli_labs' && (
          <CLILabSimulator onLabComplete={handleLabComplete} />
        )}

        {currentTab === 'subnetting' && <SubnettingMastery />}

        {currentTab === 'topology' && <TopologyVisualizer />}

        {currentTab === 'exam' && <ExamSimulator />}

        {currentTab === 'cheatsheet' && <CheatSheets />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300 font-mono">CCNA 200-301 Lab Studio</span>
            <span aria-hidden="true">·</span>
            <span>Cisco Certified Network Associate Interactive Curriculum</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                soundManager.playKeyClick();
                setCurrentTab('exam');
              }}
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Take Practice Exam
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => {
                soundManager.playKeyClick();
                setCurrentTab('cheatsheet');
              }}
              className="hover:text-slate-300 transition-colors"
            >
              Protocol Reference
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => {
                soundManager.playKeyClick();
                setIsPlayModalOpen(true);
              }}
              className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
            >
              <Smartphone className="h-3 w-3" />
              <span>Mobile & Play Store Guide</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Google Play & Mobile Setup Guide Modal */}
      <GooglePlayExportModal
        isOpen={isPlayModalOpen}
        onClose={() => setIsPlayModalOpen(false)}
      />
    </div>
  );
}
