import React, { useState } from 'react';
import { PHISHING_EMAILS, PRIVACY_ITEMS, UPSTANDER_DILEMMAS } from '../../data/citizenshipData';
import { soundManager } from '../../utils/audio';
import {
  ShieldAlert,
  ShieldCheck,
  Mail,
  AlertTriangle,
  Lock,
  Users,
  Eye,
  KeyRound,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Search,
} from 'lucide-react';

import shieldImg from '../../assets/images/digital_citizenship_shield_1791443590034.jpg';

interface DigitalCitizenshipLabProps {
  onModuleComplete: (moduleId: string, earnedXp: number) => void;
}

export const DigitalCitizenshipLab: React.FC<DigitalCitizenshipLabProps> = ({
  onModuleComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'phishing' | 'privacy' | 'upstander' | 'password'>('phishing');

  // --- Sub-module A: Phishing State ---
  const [selectedEmailIdx, setSelectedEmailIdx] = useState(0);
  const [emailVerdicts, setEmailVerdicts] = useState<Record<string, { userGuessedPhishing: boolean; isCorrect: boolean }>>({});
  const currentEmail = PHISHING_EMAILS[selectedEmailIdx];

  const handleEmailVerdict = (guessedPhishing: boolean) => {
    const isCorrect = guessedPhishing === currentEmail.isPhishing;
    if (isCorrect) {
      soundManager.playSuccess();
      onModuleComplete(`phish-${currentEmail.id}`, 25);
    } else {
      soundManager.playError();
    }
    setEmailVerdicts((prev) => ({
      ...prev,
      [currentEmail.id]: { userGuessedPhishing: guessedPhishing, isCorrect },
    }));
  };

  // --- Sub-module B: Privacy Items State ---
  const [userPrivacyAnswers, setUserPrivacyAnswers] = useState<Record<string, boolean>>({});
  const handlePrivacyAnswer = (itemId: string, userSaidSafe: boolean) => {
    const item = PRIVACY_ITEMS.find((p) => p.id === itemId);
    if (!item) return;
    const isCorrect = userSaidSafe === item.isSafeToSharePublicly;
    if (isCorrect) {
      soundManager.playSuccess();
      onModuleComplete(`privacy-${itemId}`, 15);
    } else {
      soundManager.playError();
    }
    setUserPrivacyAnswers((prev) => ({ ...prev, [itemId]: userSaidSafe }));
  };

  // --- Sub-module C: Upstander State ---
  const [dilemmaIndex, setDilemmaIndex] = useState(0);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, number>>({});
  const currentDilemma = UPSTANDER_DILEMMAS[dilemmaIndex];

  const handleChoiceSelect = (choiceIdx: number) => {
    const choice = currentDilemma.choices[choiceIdx];
    if (choice.isBestPractice) {
      soundManager.playSuccess();
      onModuleComplete(`dilemma-${currentDilemma.id}`, 30);
    } else {
      soundManager.playKeyClick();
    }
    setSelectedChoices((prev) => ({ ...prev, [currentDilemma.id]: choiceIdx }));
  };

  // --- Sub-module D: Password Simulator State ---
  const [testPassword, setTestPassword] = useState('MyPetSparky');
  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score += 20;
    if (pwd.length >= 12) score += 25;
    if (pwd.length >= 16) score += 20;
    if (/[A-Z]/.test(pwd)) score += 10;
    if (/[a-z]/.test(pwd)) score += 10;
    if (/[0-9]/.test(pwd)) score += 10;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 15;

    let crackTime = 'Instant (< 1 second)';
    let level: 'weak' | 'moderate' | 'strong' | 'ironclad' = 'weak';

    if (score < 40) {
      crackTime = 'Instant (< 2 seconds on a smartphone)';
      level = 'weak';
    } else if (score < 65) {
      crackTime = 'About 3 hours on a standard computer';
      level = 'moderate';
    } else if (score < 85) {
      crackTime = 'Approx. 400 years for modern hackers';
      level = 'strong';
    } else {
      crackTime = '12 million years (Ironclad Passphrase!)';
      level = 'ironclad';
    }

    return { score: Math.min(100, score), crackTime, level };
  };

  const pwdStats = calculatePasswordStrength(testPassword);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header and Sub-module Tabs */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block h-14 w-14 rounded-xl overflow-hidden border border-emerald-500/30 shrink-0 bg-slate-900 shadow-md">
            <img
              src={shieldImg}
              alt="Digital citizenship cyber shield"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Module 03</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-medium">Cyber Safety & Ethics</span>
              <span aria-hidden="true">·</span>
              <span>Grade 8 Standard</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">
              Digital Citizenship Lab
            </h1>
            <p className="text-sm text-slate-300 mt-0.5 max-w-2xl">
              Protect your digital identity, spot deceptive cyber attacks, practice ethical AI usage, and stand up against online negativity.
            </p>
          </div>
        </div>

        {/* Sub-module Nav buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'phishing', label: 'Phishing Radar 🛡️' },
            { id: 'privacy', label: 'Privacy Shield 🔒' },
            { id: 'upstander', label: 'Upstander Stories 🤝' },
            { id: 'password', label: 'Password Vault 🔑' },
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

      {/* --- Tab 1: Phishing Radar --- */}
      {activeTab === 'phishing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Email Inbox Sidebar */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-emerald-400" />
                Simulated Student Inbox
              </span>
              <span className="text-[11px] text-slate-500">{PHISHING_EMAILS.length} messages</span>
            </div>

            <div className="space-y-2">
              {PHISHING_EMAILS.map((email, idx) => {
                const verdict = emailVerdicts[email.id];
                const isSelected = selectedEmailIdx === idx;

                return (
                  <button
                    key={email.id}
                    onClick={() => {
                      soundManager.playKeyClick();
                      setSelectedEmailIdx(idx);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-emerald-500/50 bg-emerald-950/20 shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-white truncate max-w-[170px]">
                        {email.senderName}
                      </span>
                      {verdict && (
                        <span className={`text-[10px] font-bold ${verdict.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {verdict.isCorrect ? '✓ Solved' : '✕ Try Again'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 font-medium truncate mb-1">{email.subject}</p>
                    <span className="text-[10px] text-slate-500">{email.date}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email Inspector Detail Canvas */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            {/* Email Header */}
            <div className="border-b border-slate-800 pb-4 mb-5">
              <h2 className="text-lg font-bold text-white mb-2">{currentEmail.subject}</h2>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{currentEmail.senderName}</span>
                  <span className="font-mono text-slate-400 text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    &lt;{currentEmail.senderEmail}&gt;
                  </span>
                </div>
                <span className="text-slate-500">{currentEmail.date}</span>
              </div>
            </div>

            {/* Email Content Body */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line mb-6 select-text">
              {currentEmail.content}
            </div>

            {/* Verdict Action Buttons */}
            <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4">
              <span className="block text-xs font-semibold text-slate-300 mb-3">
                Cyber Inspector Decision: Is this message legitimate or a phishing scam?
              </span>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleEmailVerdict(true)}
                  className="flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-950/30 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-900/40 hover:border-rose-500/60 transition-colors"
                >
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  <span>Flag as Phishing Scam!</span>
                </button>

                <button
                  onClick={() => handleEmailVerdict(false)}
                  className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-900/40 hover:border-emerald-500/60 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Mark as Safe & Verified</span>
                </button>
              </div>

              {/* Feedback Breakdown */}
              {emailVerdicts[currentEmail.id] && (
                <div className={`mt-4 rounded-lg p-4 border text-xs ${
                  emailVerdicts[currentEmail.id].isCorrect
                    ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                    : 'border-rose-500/40 bg-rose-950/30 text-rose-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm text-white mb-2">
                    {emailVerdicts[currentEmail.id].isCorrect ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>Correct Analysis! (+25 XP)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-rose-400" />
                        <span>Incorrect Evaluation. Review the red flags below:</span>
                      </>
                    )}
                  </div>

                  <p className="mb-3 leading-relaxed text-slate-200">{currentEmail.educationalTakeaway}</p>

                  {currentEmail.redFlags.length > 0 && (
                    <div className="mt-2 border-t border-slate-800/80 pt-2">
                      <span className="font-semibold text-amber-300 block mb-1">Key Red Flags to Spot:</span>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {currentEmail.redFlags.map((flag, i) => (
                          <li key={i}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Tab 2: Privacy Shield --- */}
      {activeTab === 'privacy' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4 mb-6">
            <h2 className="text-lg font-bold text-white mb-1">Digital Footprint & Privacy Shield</h2>
            <p className="text-xs text-slate-300">
              Everything you post online leaves a permanent footprint. Determine what information is safe for public forums vs what must remain private.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRIVACY_ITEMS.map((item) => {
              const userAnswer = userPrivacyAnswers[item.id];
              const isAnswered = userAnswer !== undefined;
              const isCorrect = isAnswered && userAnswer === item.isSafeToSharePublicly;

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-4 transition-all ${
                    isAnswered
                      ? isCorrect
                        ? 'border-emerald-500/40 bg-emerald-950/20'
                        : 'border-rose-500/40 bg-rose-950/20'
                      : 'border-slate-800 bg-slate-950/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-sm text-white">{item.title}</h3>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">Example: {item.example}</p>
                    </div>
                    {isAnswered && (
                      <span className={`text-xs font-bold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isCorrect ? '✓ Correct' : '✕ Try Again'}
                      </span>
                    )}
                  </div>

                  {/* Choice Buttons */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => handlePrivacyAnswer(item.id, true)}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                        userAnswer === true
                          ? 'border-emerald-500 bg-emerald-500 text-slate-950 font-bold'
                          : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      Safe to Share Publicly
                    </button>
                    <button
                      onClick={() => handlePrivacyAnswer(item.id, false)}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                        userAnswer === false
                          ? 'border-rose-500 bg-rose-500 text-white font-bold'
                          : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      Keep Private / Secret
                    </button>
                  </div>

                  {/* Explanation feedback */}
                  {isAnswered && (
                    <div className="mt-3 border-t border-slate-800/80 pt-2 text-xs text-slate-300 leading-relaxed">
                      <strong className="text-white">Why: </strong>
                      {item.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- Tab 3: Upstander Stories --- */}
      {activeTab === 'upstander' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-5 gap-3">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">
                Dilemma {dilemmaIndex + 1} of {UPSTANDER_DILEMMAS.length}
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">{currentDilemma.title}</h2>
            </div>

            <div className="flex items-center gap-2">
              {UPSTANDER_DILEMMAS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    soundManager.playKeyClick();
                    setDilemmaIndex(idx);
                  }}
                  className={`h-7 w-7 rounded-lg text-xs font-bold transition-colors ${
                    dilemmaIndex === idx
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Context Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 mb-6">
            <span className="text-xs font-semibold text-emerald-400 block mb-1">
              Context: {currentDilemma.context}
            </span>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {currentDilemma.scenario}
            </p>
          </div>

          {/* Decision Choices */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              What do you do? Choose your action:
            </span>

            {currentDilemma.choices.map((choice, cIdx) => {
              const isSelected = selectedChoices[currentDilemma.id] === cIdx;

              return (
                <div key={cIdx} className="space-y-2">
                  <button
                    onClick={() => handleChoiceSelect(cIdx)}
                    className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                      isSelected
                        ? choice.isBestPractice
                          ? 'border-emerald-500 bg-emerald-950/40 text-white ring-1 ring-emerald-500'
                          : 'border-amber-500 bg-amber-950/30 text-white'
                        : 'border-slate-800 bg-slate-950/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-slate-300">
                        {String.fromCharCode(65 + cIdx)}
                      </span>
                      <span>{choice.text}</span>
                    </div>
                  </button>

                  {/* Feedback on this choice */}
                  {isSelected && (
                    <div
                      className={`p-3 rounded-lg text-xs leading-relaxed border ${
                        choice.isBestPractice
                          ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                          : 'border-amber-500/40 bg-amber-950/30 text-amber-200'
                      }`}
                    >
                      <strong className="text-white">Analysis: </strong>
                      {choice.feedback}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- Tab 4: Password Vault Simulator --- */}
      {activeTab === 'password' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4 mb-6">
            <h2 className="text-lg font-bold text-white mb-1">Password Strength & Supercomputer Cracker</h2>
            <p className="text-xs text-slate-300">
              Test different passwords to see how fast automated supercomputers can brute force them. Learn why long multi-word passphrases beat complex short passwords.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Input & Tester Deck */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Test Any Passphrase (Simulated in browser, never transmitted):
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-3 text-sm font-mono text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                    placeholder="Enter test password..."
                  />
                </div>
              </div>

              {/* Quick Sample Presets to Try */}
              <div>
                <span className="block text-xs text-slate-400 mb-2 font-medium">Click to test real-world examples:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '123456 (Top Hack Target)', val: '123456' },
                    { label: 'monkey123 (Simple word)', val: 'monkey123' },
                    { label: 'P@$$w0rd (Obvious leetspeak)', val: 'P@$$w0rd' },
                    { label: 'BluePineappleJump!2026 (4-Word Passphrase)', val: 'BluePineappleJump!2026' },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      onClick={() => setTestPassword(preset.val)}
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Password Quality Checklist */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2 text-xs">
                <span className="font-semibold text-white block mb-1">Passphrase Checklist:</span>
                <div className="flex items-center gap-2">
                  <span className={testPassword.length >= 12 ? 'text-emerald-400' : 'text-slate-600'}>
                    {testPassword.length >= 12 ? '✓' : '○'}
                  </span>
                  <span className={testPassword.length >= 12 ? 'text-slate-200' : 'text-slate-500'}>
                    At least 12 characters long ({testPassword.length}/12)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={/[A-Z]/.test(testPassword) && /[a-z]/.test(testPassword) ? 'text-emerald-400' : 'text-slate-600'}>
                    {/[A-Z]/.test(testPassword) && /[a-z]/.test(testPassword) ? '✓' : '○'}
                  </span>
                  <span className={/[A-Z]/.test(testPassword) && /[a-z]/.test(testPassword) ? 'text-slate-200' : 'text-slate-500'}>
                    Mix of uppercase & lowercase letters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={/[0-9]/.test(testPassword) ? 'text-emerald-400' : 'text-slate-600'}>
                    {/[0-9]/.test(testPassword) ? '✓' : '○'}
                  </span>
                  <span className={/[0-9]/.test(testPassword) ? 'text-slate-200' : 'text-slate-500'}>
                    Contains numbers
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={/[^A-Za-z0-9]/.test(testPassword) ? 'text-emerald-400' : 'text-slate-600'}>
                    {/[^A-Za-z0-9]/.test(testPassword) ? '✓' : '○'}
                  </span>
                  <span className={/[^A-Za-z0-9]/.test(testPassword) ? 'text-slate-200' : 'text-slate-500'}>
                    Contains symbols (!, @, #, $, %)
                  </span>
                </div>
              </div>
            </div>

            {/* Results & Cracking Metrics Deck */}
            <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4">
              <div>
                <span className="text-xs text-slate-400 font-semibold block uppercase">Security Level</span>
                <span className={`text-xl font-bold uppercase tracking-wider ${
                  pwdStats.level === 'ironclad'
                    ? 'text-emerald-400'
                    : pwdStats.level === 'strong'
                    ? 'text-sky-400'
                    : pwdStats.level === 'moderate'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}>
                  {pwdStats.level} ({pwdStats.score}/100)
                </span>
                {/* Progress bar */}
                <div className="mt-2 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      pwdStats.level === 'ironclad'
                        ? 'bg-emerald-400'
                        : pwdStats.level === 'strong'
                        ? 'bg-sky-400'
                        : pwdStats.level === 'moderate'
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                    }`}
                    style={{ width: `${pwdStats.score}%` }}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-slate-900 p-3.5 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold block uppercase mb-1">
                  Brute-Force Hack Time
                </span>
                <span className="font-mono text-sm font-bold text-white block">
                  {pwdStats.crackTime}
                </span>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
                <strong className="text-emerald-400">Pro Tip: </strong>
                The human brain remembers stories, not random strings! Stringing 4 random words together (e.g. <em>Cobalt-Falcon-Rocket-Dances</em>) is easy for you to remember, but impossible for computers to guess.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
