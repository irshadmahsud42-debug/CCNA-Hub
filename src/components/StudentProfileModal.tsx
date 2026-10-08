import React, { useState } from 'react';
import { StudentProfile, GradeLevel } from '../types';
import { soundManager } from '../utils/audio';
import { X, Sparkles, Trophy, Flame, Zap, Award, RotateCcw } from 'lucide-react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onUpdateProfile: (updated: Partial<StudentProfile>) => void;
  onResetProgress: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onResetProgress,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(profile.name);
  const [grade, setGrade] = useState<GradeLevel>(profile.grade);
  const [avatar, setAvatar] = useState(profile.avatar);

  const avatarOptions = ['🤖', '🛡️', '🚀', '⚡', '💻', '👾', '🌟', '🦊', '🧭'];

  const handleSave = () => {
    soundManager.playSuccess();
    onUpdateProfile({
      name: name.trim() || 'Student Explorer',
      grade,
      avatar,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playKeyClick();
            onClose();
          }}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Student Explorer Profile</h2>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Customize your explorer card and grade level.
        </p>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-center">
            <Trophy className="h-4 w-4 text-amber-400 mx-auto mb-1" />
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">Total XP</span>
            <span className="font-mono text-sm font-bold text-white tabular-nums">{profile.xp}</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-center">
            <Flame className="h-4 w-4 text-rose-400 mx-auto mb-1" />
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">Day Streak</span>
            <span className="font-mono text-sm font-bold text-white tabular-nums">{profile.streak} Days</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-center">
            <Zap className="h-4 w-4 text-sky-400 mx-auto mb-1" />
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">Best WPM</span>
            <span className="font-mono text-sm font-bold text-white tabular-nums">{profile.typingBestWpm}</span>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Explorer Name / Codename:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              placeholder="e.g. Alex M. or CosmicCoder"
            />
          </div>

          {/* Grade Level Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Grade Level Track:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  soundManager.playKeyClick();
                  setGrade('grade3-5');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                  grade === 'grade3-5'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                Grades 3-5 (Elementary)
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playKeyClick();
                  setGrade('grade6-8');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                  grade === 'grade6-8'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                Grades 6-8 (Middle School)
              </button>
            </div>
          </div>

          {/* Avatar Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Pick Your Avatar Sticker:
            </label>
            <div className="flex flex-wrap gap-2">
              {avatarOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    soundManager.playKeyClick();
                    setAvatar(opt);
                  }}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition-transform ${
                    avatar === opt
                      ? 'border-emerald-400 bg-emerald-500/20 scale-110 shadow-sm'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all progress and scores?')) {
                onResetProgress();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Progress</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm"
            >
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
