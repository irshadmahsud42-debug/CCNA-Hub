import React, { useState } from 'react';
import { soundManager } from '../../utils/audio';
import {
  X,
  Play,
  Smartphone,
  Package,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Download,
  Terminal,
  HelpCircle,
} from 'lucide-react';

interface GooglePlayExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GooglePlayExportModal: React.FC<GooglePlayExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    soundManager.playSuccess();
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const sampleAssetLinks = JSON.stringify(
    [
      {
        relation: [
          'delegate_permission/common.handle_all_urls',
        ],
        target: {
          namespace: 'android_app',
          package_name: 'com.ccna.labstudio',
          sha256_cert_fingerprints: [
            '14:6D:E9:7D:0F:52:CE:EB:2B:EE:EC:12:4A:E2:55:82:2B:...',
          ],
        },
      },
    ],
    null,
    2
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
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

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-1">
          <Smartphone className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">
            Mobile Setup & Google Play Console Guide
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          How to open on mobile phones, package as an Android App Bundle (.aab), and publish to Google Play.
        </p>

        {/* Step Tabs */}
        <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3 mb-6 overflow-x-auto text-xs font-semibold">
          {[
            { id: 1, label: '1. Open on Mobile (PWA)' },
            { id: 2, label: '2. Generate .AAB (PWABuilder)' },
            { id: 3, label: '3. Digital Asset Links' },
            { id: 4, label: '4. Google Play Console' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playKeyClick();
                setActiveStep(tab.id as typeof activeStep);
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeStep === tab.id
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Step 1: Mobile Testing */}
        {activeStep === 1 && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <h3 className="text-sm font-bold text-white">How to run as an App on your phone right now</h3>
            <p>
              Your application is already configured as a Progressive Web App (PWA) with responsive design, service worker caching, and an app manifest.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <span className="font-bold text-emerald-400 block text-xs">On Android (Google Chrome):</span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px]">
                  <li>Open this web URL in Chrome on your phone.</li>
                  <li>Tap the <strong>"Install App"</strong> button in the navigation bar (or tap Chrome Menu <code>⋮</code> &gt; <strong>"Install app"</strong>).</li>
                  <li>An official app icon will be added to your home screen and app drawer.</li>
                  <li>When launched, it opens full-screen with no browser address bar!</li>
                </ol>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <span className="font-bold text-sky-400 block text-xs">On iPhone / iPad (Safari):</span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px]">
                  <li>Open the URL in Safari on your iPhone.</li>
                  <li>Tap the <strong>Share</strong> button (the square with an arrow pointing up).</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                  <li>Tap <strong>Add</strong> in the top-right corner.</li>
                  <li>It runs independently with its own splash screen.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Packaging for Google Play Store */}
        {activeStep === 2 && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <h3 className="text-sm font-bold text-white">Generate Android App Bundle (.aab) with PWABuilder</h3>
            <p>
              Google Play accepts Web applications packaged as a <strong>Trusted Web Activity (TWA)</strong>. The official, zero-code way recommended by Google and Microsoft is <a href="https://pwabuilder.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">PWABuilder</a>:
            </p>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-emerald-400">1</span>
                <div>
                  <span className="font-bold text-white">Go to PWABuilder:</span> Visit{' '}
                  <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">
                    pwabuilder.com
                  </a>{' '}
                  and enter your deployed app URL.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-emerald-400">2</span>
                <div>
                  <span className="font-bold text-white">Check PWA Health:</span> PWABuilder will automatically verify your Web App Manifest, Service Worker, and icons (all pre-configured!).
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-emerald-400">3</span>
                <div>
                  <span className="font-bold text-white">Package for Google Play:</span> Click <strong>"Package for Stores"</strong> &gt; Select <strong>"Google Play"</strong>.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-emerald-400">4</span>
                <div>
                  <span className="font-bold text-white">Configure Package Info:</span>
                  <ul className="list-disc list-inside mt-1 text-[11px] text-slate-400 space-y-0.5">
                    <li>Package ID: <code>com.ccna.labstudio</code> (or your custom domain)</li>
                    <li>App Name: <code>CCNA 200-301 Lab Studio</code></li>
                    <li>Signing Key: Choose "Create new key" or use existing keystore.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-emerald-400">5</span>
                <div>
                  <span className="font-bold text-white">Download Output:</span> Download the resulting zip containing your <strong>.aab (Android App Bundle)</strong> and digital asset links file!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Digital Asset Links */}
        {activeStep === 3 && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Digital Asset Links Verification</h3>
              <button
                onClick={() => copyToClipboard(sampleAssetLinks, 'assetlinks')}
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono"
              >
                <Copy className="h-3 w-3" />
                <span>{copiedText === 'assetlinks' ? 'Copied!' : 'Copy Template'}</span>
              </button>
            </div>
            <p>
              To prove to Google Play that you own the web domain (so Android removes the browser URL bar completely), place an <code>assetlinks.json</code> file at:
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-emerald-400 text-[11px]">
              https://your-domain.com/.well-known/assetlinks.json
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-slate-300 text-[11px] overflow-x-auto max-h-40">
              <pre>{sampleAssetLinks}</pre>
            </div>

            <p className="text-[11px] text-slate-400">
              PWABuilder or Google Play App Signing will give you the exact SHA256 fingerprint after you generate your signing key.
            </p>
          </div>
        )}

        {/* Step 4: Google Play Console Submission */}
        {activeStep === 4 && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <h3 className="text-sm font-bold text-white">Uploading to Google Play Console</h3>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
              <div className="space-y-1">
                <span className="font-bold text-emerald-400">Step A: Google Play Developer Account</span>
                <p className="text-[11px] text-slate-400">
                  Register at <a href="https://play.google.com/console" target="_blank" rel="noreferrer" className="text-emerald-400 underline">play.google.com/console</a> (one-time $25 Google registration fee).
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-emerald-400">Step B: Create Application</span>
                <p className="text-[11px] text-slate-400">
                  Click <strong>"Create app"</strong> &gt; Name: "CCNA 200-301 Lab Studio" &gt; Default language: English &gt; App type: Free.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-emerald-400">Step C: Store Presence & Details</span>
                <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-0.5">
                  <li>Short Description (up to 80 chars)</li>
                  <li>Full Description: Highlight the Cisco IOS CLI labs, Subnetting speed trainer, and CCNA 200-301 questions.</li>
                  <li>Upload App Icon (512x512 PNG, generated in public folder)</li>
                  <li>Feature Graphic (1024x500 PNG)</li>
                  <li>Screenshots (Phone screenshots of the CLI terminal and subnetting calculator)</li>
                </ul>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-emerald-400">Step D: Upload the .AAB File</span>
                <p className="text-[11px] text-slate-400">
                  Navigate to <strong>Release &gt; Production</strong> (or <strong>Closed Testing</strong>), create a new release, upload the <code>.aab</code> bundle file generated by PWABuilder, and submit for Google Review!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            onClick={() => {
              if (activeStep > 1) setActiveStep((prev) => (prev - 1) as typeof activeStep);
            }}
            disabled={activeStep === 1}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-30"
          >
            ← Previous
          </button>

          <div className="flex items-center gap-2">
            {activeStep < 4 ? (
              <button
                onClick={() => setActiveStep((prev) => (prev + 1) as typeof activeStep)}
                className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm"
              >
                Next Step →
              </button>
            ) : (
              <button
                onClick={onClose}
                className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
