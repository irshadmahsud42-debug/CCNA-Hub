import React, { useState } from 'react';
import { CHEAT_SHEET_DATA } from '../../data/ccnaData';
import { soundManager } from '../../utils/audio';
import {
  BookOpen,
  Layers,
  Shield,
  Binary,
  Radio,
  Search,
} from 'lucide-react';

export const CheatSheets: React.FC = () => {
  const [filter, setFilter] = useState('');

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Quick Reference</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-400 font-medium">Protocol Standards</span>
          <span aria-hidden="true">·</span>
          <span>CCNA 200-301 Cram Sheet</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
          CCNA Protocol & Architecture Reference
        </h1>
        <p className="text-sm text-slate-300 mt-0.5 max-w-2xl">
          High-yield summary charts for Cisco IOS Syslog severity levels, Administrative Distances, well-known port numbers, and IPv6 multicast scopes.
        </p>
      </div>

      {/* 1. Cisco Syslog Severity Levels (0 - 7) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Cisco IOS Syslog Severity Levels (0 - 7)</h2>
          </div>
          <span className="text-xs font-mono text-amber-300">
            Mnemonic: "Every Almond Tree Blossoms Clearly With Seeds"
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                <th className="py-2.5 px-3">Level</th>
                <th className="py-2.5 px-3">Severity Name</th>
                <th className="py-2.5 px-3">IOS Keyword</th>
                <th className="py-2.5 px-3">Description & Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {CHEAT_SHEET_DATA.syslog.map((s) => (
                <tr key={s.level} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 font-bold text-emerald-400">{s.level}</td>
                  <td className="py-2 px-3 text-white font-semibold">{s.name}</td>
                  <td className="py-2 px-3 text-slate-400">{s.keyword}</td>
                  <td className="py-2 px-3 font-sans text-slate-300">{s.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Administrative Distance (AD) Ranking */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Layers className="h-4 w-4 text-sky-400" />
          <h2 className="text-base font-bold text-white">Administrative Distance (AD) Priority</h2>
        </div>

        <p className="text-xs text-slate-300">
          The routing engine installs the route with the <strong>lowest AD</strong> into the routing table when identical prefixes are learned from multiple sources.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
          {CHEAT_SHEET_DATA.adminDistance.map((ad) => (
            <div key={ad.source} className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
              <span className="text-xl font-bold text-sky-400 block mb-1">{ad.distance}</span>
              <span className="font-sans text-slate-300 text-[11px] font-semibold leading-tight block">
                {ad.source}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Well-Known Ports & Protocols */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Shield className="h-4 w-4 text-amber-400" />
          <h2 className="text-base font-bold text-white">Common Well-Known Transport Ports</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {CHEAT_SHEET_DATA.wellKnownPorts.map((p) => (
            <div key={p.port} className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs font-mono">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-amber-300 text-sm">Port {p.port}</span>
                <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                  {p.protocol}
                </span>
              </div>
              <span className="font-sans text-slate-300 text-xs block">{p.service}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. IPv6 Multicast Scopes */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Binary className="h-4 w-4 text-purple-400" />
          <h2 className="text-base font-bold text-white">IPv6 Reserved Multicast Addresses</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          {CHEAT_SHEET_DATA.multicastIpv6.map((m) => (
            <div key={m.address} className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex justify-between items-center">
              <span className="font-bold text-purple-300">{m.address}</span>
              <span className="font-sans text-slate-400 text-xs">{m.scope}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
