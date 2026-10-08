import React from 'react';
import { NavTab, StudentProfile } from '../types';
import { Volume2, VolumeX, User, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  profile: StudentProfile;
  onOpenProfile: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  profile,
  onOpenProfile,
  isMuted,
  onToggleMute,
}) => {
  const navItems: { id: NavTab; label: string }[] = [
    { id: 'coding', label: 'Coding Lab' },
    { id: 'typing', label: 'Touch Typing' },
    { id: 'citizenship', label: 'Digital Citizen' },
    { id: 'hardware', label: 'Hardware Lab' },
    { id: 'certificate', label: 'Certificate' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => {
            soundManager.playKeyClick();
            onTabChange('coding');
          }}
          className="flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-sm"
        >
          <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            ByteQuest
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

        {/* Zone 3: 1-2 primary actions & student status */}
        <div className="flex items-center gap-4">
          {/* Audio Mute/Unmute Toggle */}
          <button
            onClick={() => {
              onToggleMute();
            }}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            aria-label="Toggle sound"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
          </button>

          {/* Student Status Profile Button */}
          <button
            onClick={() => {
              soundManager.playKeyClick();
              onOpenProfile();
            }}
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
          >
            <div className="flex items-center justify-center h-6 w-6 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold">
              {profile.avatar}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-semibold text-slate-100 leading-tight truncate max-w-[100px]">
                {profile.name}
              </span>
              <span className="text-[10px] text-slate-400">
                {profile.grade === 'grade3-5' ? 'Grades 3-5' : 'Grades 6-8'} · {profile.xp} XP
              </span>
            </div>
            <Sparkles className="h-3 w-3 text-amber-400 hidden sm:block" />
          </button>
        </div>
      </div>

      {/* Mobile secondary navigation strip */}
      <div className="flex md:hidden overflow-x-auto border-t border-slate-900 px-4 py-2 gap-4 text-xs scrollbar-none">
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
