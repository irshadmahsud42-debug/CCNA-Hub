import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { soundManager } from '../../utils/audio';
import { Download, Smartphone, X, CheckCircle2, Share } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={() => {
          soundManager.playKeyClick();
          install();
        }}
        className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm whitespace-nowrap"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => {
            soundManager.playKeyClick();
            setShowIOSGuide(true);
          }}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap"
        >
          <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
          <span>Install on iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Install on iPhone / iPad</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                iOS requires two quick taps in Safari to install this application to your home screen:
              </p>

              <div className="space-y-2.5 rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs text-slate-200">
                <div className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-emerald-400">
                    1
                  </span>
                  <span>
                    Tap the <strong>Share</strong> button (box with upward arrow) at the bottom of Safari.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-emerald-400">
                    2
                  </span>
                  <span>
                    Scroll down and tap <strong>"Add to Home Screen"</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-emerald-400">
                    3
                  </span>
                  <span>
                    Tap <strong>Add</strong> in the top right. It will appear on your phone alongside your native apps!
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-slate-800 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
