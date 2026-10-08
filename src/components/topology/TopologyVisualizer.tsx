import React, { useState } from 'react';
import { soundManager } from '../../utils/audio';
import {
  Server,
  Laptop,
  Network,
  Cpu,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  Shield,
  Layers,
} from 'lucide-react';

interface DeviceNode {
  id: string;
  name: string;
  type: 'router' | 'switch' | 'pc' | 'server';
  ip: string;
  mac: string;
  vlan?: number;
  x: number; // percentage
  y: number; // percentage
  status: 'up' | 'down';
  description: string;
}

const TOPOLOGY_DEVICES: DeviceNode[] = [
  {
    id: 'pc1',
    name: 'PC-1 (Sales)',
    type: 'pc',
    ip: '192.168.10.10 /24',
    mac: '0050.7966.6801',
    vlan: 10,
    x: 15,
    y: 75,
    status: 'up',
    description: 'Workstation assigned to Sales Access VLAN 10. Default Gateway: 192.168.10.1',
  },
  {
    id: 'pc2',
    name: 'PC-2 (Engineering)',
    type: 'pc',
    ip: '192.168.20.20 /24',
    mac: '0050.7966.6802',
    vlan: 20,
    x: 40,
    y: 75,
    status: 'up',
    description: 'Workstation assigned to Engineering Access VLAN 20. Default Gateway: 192.168.20.1',
  },
  {
    id: 'sw1',
    name: 'SW-1 (Access Catalyst)',
    type: 'switch',
    ip: '192.168.1.2 /24 (SVI)',
    mac: '0001.9654.1201',
    x: 28,
    y: 45,
    status: 'up',
    description: 'Layer 2 Switch with access ports Gi0/1 (VLAN 10), Gi0/2 (VLAN 20), and 802.1Q trunk Gi0/24.',
  },
  {
    id: 'r1',
    name: 'R1 (Core Gateway)',
    type: 'router',
    ip: 'Subinterfaces g0/0.10 & g0/0.20',
    mac: '0001.6422.3301',
    x: 55,
    y: 20,
    status: 'up',
    description: 'Cisco 2911 Router-on-a-Stick gateway performing inter-VLAN routing and NAT.',
  },
  {
    id: 'server1',
    name: 'Server-1 (Data Center)',
    type: 'server',
    ip: '10.0.0.50 /24',
    mac: '0060.4788.9901',
    vlan: 99,
    x: 85,
    y: 45,
    status: 'up',
    description: 'Corporate Web & DNS Server hosting internal enterprise applications.',
  },
];

interface PacketStep {
  step: number;
  from: string;
  to: string;
  layer: 'Layer 2' | 'Layer 3' | 'Layer 7';
  protocol: string;
  details: string;
}

export const TopologyVisualizer: React.FC = () => {
  const [devices, setDevices] = useState<DeviceNode[]>(TOPOLOGY_DEVICES);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('pc1');

  // Ping simulation state
  const [sourceId, setSourceId] = useState('pc1');
  const [destId, setDestId] = useState('server1');
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [simulationLog, setSimulationLog] = useState<PacketStep[]>([]);
  const [simulationOutcome, setSimulationOutcome] = useState<'success' | 'failure' | null>(null);

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId) || devices[0];

  const toggleDeviceStatus = (id: string) => {
    soundManager.playKeyClick();
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: d.status === 'up' ? 'down' : 'up' } : d))
    );
  };

  const runPingSimulation = () => {
    soundManager.playKeyClick();
    setIsSimulating(true);
    setActiveStepIndex(0);
    setSimulationOutcome(null);

    // Build packet trace sequence
    const trace: PacketStep[] = [];
    const src = devices.find((d) => d.id === sourceId)!;
    const dst = devices.find((d) => d.id === destId)!;

    if (src.status === 'down') {
      trace.push({
        step: 1,
        from: src.name,
        to: src.name,
        layer: 'Layer 2',
        protocol: 'ICMP',
        details: `Transmission failed: ${src.name} interface is down (cable disconnected or shutdown).`,
      });
      setSimulationLog(trace);
      setSimulationOutcome('failure');
      setIsSimulating(false);
      soundManager.playError();
      return;
    }

    // Step 1: PC encapsulation & ARP check
    trace.push({
      step: 1,
      from: src.name,
      to: 'SW-1',
      layer: 'Layer 3',
      protocol: 'ARP / ICMP',
      details: `${src.name} checks routing table: destination is outside local subnet. Forwarding frame to default gateway via SW-1.`,
    });

    // Step 2: Switch 802.1Q tagging
    trace.push({
      step: 2,
      from: 'SW-1',
      to: 'R1',
      layer: 'Layer 2',
      protocol: '802.1Q Trunk',
      details: `SW-1 receives untagged frame on access port. Encapsulates 4-byte 802.1Q tag (VLAN ${src.vlan}) and transmits over trunk link to R1.`,
    });

    // Step 3: Router inter-VLAN routing
    trace.push({
      step: 3,
      from: 'R1',
      to: dst.name,
      layer: 'Layer 3',
      protocol: 'IPv4 Routing',
      details: `R1 strips 802.1Q header on subinterface g0/0.${src.vlan}, inspects destination IP, performs route lookup, and forwards toward ${dst.name}.`,
    });

    // Step 4: Echo Reply
    trace.push({
      step: 4,
      from: dst.name,
      to: src.name,
      layer: 'Layer 3',
      protocol: 'ICMP Echo Reply',
      details: `${dst.name} processes ICMP Echo Request and generates Echo Reply back to ${src.ip}. Success rate is 100%!`,
    });

    setSimulationLog(trace);

    // Playback steps
    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current >= trace.length) {
        clearInterval(interval);
        setIsSimulating(false);
        setActiveStepIndex(trace.length - 1);
        setSimulationOutcome('success');
        soundManager.playSuccess();
      } else {
        setActiveStepIndex(current);
        soundManager.playKeyClick();
      }
    }, 900);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Domain 2.0 & 3.0</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">Network Architecture</span>
            <span aria-hidden="true">·</span>
            <span>Packet Flow & Inter-VLAN Tracer</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Enterprise Topology & Packet Tracer
          </h1>
          <p className="text-sm text-slate-300 mt-0.5 max-w-2xl">
            Simulate packet flow across Layer 2 access switches, 802.1Q trunk encapsulation, and Router-on-a-Stick core routing.
          </p>
        </div>

        {/* Source & Destination Ping Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs">
          <span className="text-slate-400 font-semibold pl-1">Ping Source:</span>
          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            disabled={isSimulating}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-white text-xs font-mono"
          >
            <option value="pc1">PC-1 (VLAN 10)</option>
            <option value="pc2">PC-2 (VLAN 20)</option>
          </select>

          <span className="text-slate-400 font-semibold">Dest:</span>
          <select
            value={destId}
            onChange={(e) => setDestId(e.target.value)}
            disabled={isSimulating}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-white text-xs font-mono"
          >
            <option value="server1">Server-1 (10.0.0.50)</option>
            <option value="pc2">PC-2 (192.168.20.20)</option>
            <option value="r1">R1 Gateway</option>
          </select>

          <button
            onClick={runPingSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm disabled:opacity-50"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Trace Ping</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas & Packet Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Topology Diagram Interactive Canvas (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl relative overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-xs text-slate-400">
            <span>Click any node to inspect L2/L3 properties or toggle link status</span>
            <span className="font-mono text-emerald-400">802.1Q Dot1Q Native VLAN: 1</span>
          </div>

          {/* Interactive Topology Stage */}
          <div className="relative h-[380px] w-full rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
            {/* Grid dot texture */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />

            {/* Connecting Links SVG */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none">
              {/* PC1 to SW1 */}
              <line
                x1="20%"
                y1="75%"
                x2="32%"
                y2="50%"
                stroke="#0284c7"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              {/* PC2 to SW1 */}
              <line
                x1="45%"
                y1="75%"
                x2="34%"
                y2="50%"
                stroke="#6366f1"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              {/* SW1 to R1 (Trunk link) */}
              <line
                x1="34%"
                y1="45%"
                x2="55%"
                y2="25%"
                stroke="#10b981"
                strokeWidth="3"
              />
              {/* R1 to Server1 (WAN / Core link) */}
              <line
                x1="60%"
                y1="25%"
                x2="85%"
                y2="45%"
                stroke="#f59e0b"
                strokeWidth="2"
              />
            </svg>

            {/* Device Nodes */}
            {devices.map((dev) => {
              const isSelected = selectedDeviceId === dev.id;
              const isSource = sourceId === dev.id;
              const isDest = destId === dev.id;

              return (
                <div
                  key={dev.id}
                  onClick={() => {
                    soundManager.playKeyClick();
                    setSelectedDeviceId(dev.id);
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                    isSelected ? 'scale-110 z-20' : 'hover:scale-105 z-10'
                  }`}
                  style={{ left: `${dev.x}%`, top: `${dev.y}%` }}
                >
                  <div
                    className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-emerald-400 bg-slate-900 shadow-xl ring-2 ring-emerald-500/50'
                        : dev.status === 'down'
                        ? 'border-rose-500/50 bg-slate-950/80 opacity-70'
                        : 'border-slate-800 bg-slate-900/90 shadow-md'
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl mb-1.5 ${
                        dev.type === 'router'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : dev.type === 'switch'
                          ? 'bg-sky-500/20 text-sky-400'
                          : dev.type === 'server'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-indigo-500/20 text-indigo-400'
                      }`}
                    >
                      {dev.type === 'router' && <Cpu className="h-5 w-5" />}
                      {dev.type === 'switch' && <Network className="h-5 w-5" />}
                      {dev.type === 'server' && <Server className="h-5 w-5" />}
                      {dev.type === 'pc' && <Laptop className="h-5 w-5" />}
                    </div>

                    <span className="font-bold text-xs text-white whitespace-nowrap">{dev.name}</span>
                    <span className="font-mono text-[10px] text-slate-400 mt-0.5">{dev.ip.split(' ')[0]}</span>

                    {/* Role tags */}
                    {isSource && (
                      <span className="mt-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500 text-slate-950">
                        SRC
                      </span>
                    )}
                    {isDest && (
                      <span className="mt-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-slate-950">
                        DST
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Topology Legend Strip */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 border-t border-slate-800 pt-3">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                <span>VLAN 10 Access</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                <span>VLAN 20 Access</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>802.1Q Trunk</span>
              </span>
            </div>

            <span className="text-slate-500 font-mono">CCNA Certified Reference Model</span>
          </div>
        </div>

        {/* Selected Device & Packet Step Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Device Profile Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Device Properties
              </span>
              <button
                onClick={() => toggleDeviceStatus(selectedDevice.id)}
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                  selectedDevice.status === 'up'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {selectedDevice.status === 'up' ? 'Port UP' : 'Port DOWN'}
              </button>
            </div>

            <h3 className="text-base font-bold text-white mb-1">{selectedDevice.name}</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">{selectedDevice.description}</p>

            <div className="space-y-2 text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">IP Address:</span>
                <span className="text-white font-bold">{selectedDevice.ip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">MAC Hardware:</span>
                <span className="text-emerald-400">{selectedDevice.mac}</span>
              </div>
              {selectedDevice.vlan && (
                <div className="flex justify-between">
                  <span className="text-slate-500">VLAN ID:</span>
                  <span className="text-sky-400">VLAN {selectedDevice.vlan}</span>
                </div>
              )}
            </div>
          </div>

          {/* Packet Hop Trace Log */}
          {simulationLog.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-xs">
                <span className="font-bold text-slate-300">Packet Flow Trace</span>
                {simulationOutcome === 'success' && (
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Ping 100% OK</span>
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                {simulationLog.map((step, idx) => {
                  const isCurrent = activeStepIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={`rounded-lg border p-2.5 text-xs transition-all ${
                        isCurrent
                          ? 'border-emerald-500 bg-emerald-950/30 shadow-md ring-1 ring-emerald-400'
                          : 'border-slate-800/80 bg-slate-950/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-emerald-400 font-mono">
                          Hop {step.step}: {step.protocol}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase">{step.layer}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{step.details}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
