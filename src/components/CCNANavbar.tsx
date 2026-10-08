import React from 'react';
import { CCNATab } from '../types/ccna';
import { soundManager } from '../utils/audio';
import { Volume2, VolumeX, Terminal, Smartphone } from 'lucide-react';
import { PWAInstallButton } from './pwa/PWAInstallButton';

interface CCNANavbarProps {
  currentTab: CCNATab;
  onTabChange: (tab: CCNATab) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  completedLabsCount: number;
  onOpenMobileGuide: () => void;
}

export const CCNANavbar: React.FC<CCNANavbarProps> = ({
  currentTab,
  onTabChange,
  isMuted,
  onToggleMute,
  completedLabsCount,
  onOpenMobileGuide,
}) => {
  const navItems: { id: CCNATab; label: string }[] = [
    { id: 'cli_labs', label: 'Cisco IOS Labs' },
    { id: 'subnetting', label: 'Subnetting Drill' },
    { id: 'topology', label: 'Topology Tracer' },
    { id: 'exam', label: 'Exam Simulator' },
    { id: 'cheatsheet', label: 'Cram Sheets' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => {
            soundManager.playKeyClick();
            onTabChange('cli_labs');
          }}
          className="flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-sm"
        >
          <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            CCNA Studio
          </span>
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundManager.playKeyClick();
                  onTabChange(item.id);
                }}
                className={`relative py-2 transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 ${
                  isActive
                    ? 'text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions & progress */}
        <div className="flex items-center gap-3">
          {/* PWA In-App Install Button */}
          <PWAInstallButton />

          {/* Google Play / Mobile Guide Button */}
          <button
            onClick={() => {
              soundManager.playKeyClick();
              onOpenMobileGuide();
            }}
            title="Mobile & Google Play Console Guide"
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors whitespace-nowrap"
          >
            <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Play Console Guide</span>
          </button>

          {/* Audio Mute/Unmute Toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Terminal SFX' : 'Mute Terminal SFX'}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            aria-label="Toggle terminal audio"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Mobile strip */}
      <div className="flex md:hidden overflow-x-auto border-t border-slate-900 px-4 py-2 gap-3 text-xs scrollbar-none">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                soundManager.playKeyClick();
                onTabChange(item.id);
              }}
              className={`whitespace-nowrap px-2.5 py-1 rounded transition-colors ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
