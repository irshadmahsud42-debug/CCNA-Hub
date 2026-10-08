import React, { useState, useEffect, useRef } from 'react';
import { CLILab, IOSDeviceState, IOSPromptMode } from '../../types/ccna';
import { CLI_LABS } from '../../data/ccnaData';
import { soundManager } from '../../utils/audio';
import {
  Terminal,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  BookOpen,
  Copy,
  Eye,
} from 'lucide-react';

interface CLILabSimulatorProps {
  onLabComplete?: (labId: string) => void;
}

export const CLILabSimulator: React.FC<CLILabSimulatorProps> = ({ onLabComplete }) => {
  const [selectedLabIndex, setSelectedLabIndex] = useState(0);
  const lab = CLI_LABS[selectedLabIndex];

  // Device configuration state
  const [deviceState, setDeviceState] = useState<IOSDeviceState>(() =>
    JSON.parse(JSON.stringify(lab.initialState))
  );

  // Terminal navigation and mode state
  const [promptMode, setPromptMode] = useState<IOSPromptMode>('user');
  const [activeContextTarget, setActiveContextTarget] = useState<string>('');
  const [commandInput, setCommandInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [terminalOutput, setTerminalOutput] = useState<
    { type: 'input' | 'output' | 'system' | 'error' | 'success'; text: string }[]
  >([]);

  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Reset lab
  useEffect(() => {
    resetLab();
  }, [selectedLabIndex]);

  const resetLab = () => {
    const freshState = JSON.parse(JSON.stringify(lab.initialState));
    setDeviceState(freshState);
    setPromptMode('user');
    setActiveContextTarget('');
    setCommandInput('');
    setHistory([]);
    setHistoryIdx(-1);
    setCompletedTaskIds([]);
    setShowWalkthrough(false);

    setTerminalOutput([
      {
        type: 'system',
        text: `--- Cisco IOS Software (C2900-UNIVERSALK9-M), Version 15.7(3)M2 ---`,
      },
      {
        type: 'system',
        text: `Loaded Lab Scenario: "${lab.title}" on device ${lab.deviceName}`,
      },
      {
        type: 'system',
        text: `Type "?" for help or "enable" to enter Privileged EXEC mode.`,
      },
    ]);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalOutput]);

  // Check tasks against deviceState
  useEffect(() => {
    const newlyCompleted: string[] = [];
    lab.tasks.forEach((t) => {
      if (t.targetCheck(deviceState)) {
        newlyCompleted.push(t.id);
      }
    });

    if (newlyCompleted.length > completedTaskIds.length) {
      soundManager.playSuccess();
    }
    setCompletedTaskIds(newlyCompleted);

    if (newlyCompleted.length === lab.tasks.length && lab.tasks.length > 0) {
      if (onLabComplete) {
        onLabComplete(lab.id);
      }
    }
  }, [deviceState]);

  // Get current prompt string
  const getPromptString = (): string => {
    const h = deviceState.hostname;
    switch (promptMode) {
      case 'user':
        return `${h}>`;
      case 'privileged':
        return `${h}#`;
      case 'global':
        return `${h}(config)#`;
      case 'interface':
      case 'subinterface':
        return `${h}(config-if)#`;
      case 'line':
        return `${h}(config-line)#`;
      case 'router_ospf':
        return `${h}(config-router)#`;
      case 'vlan':
        return `${h}(config-vlan)#`;
      default:
        return `${h}#`;
    }
  };

  // Cisco IOS Command Execution Engine
  const executeCommand = (cmdStr: string) => {
    const raw = cmdStr.trim();
    if (!raw) {
      setTerminalOutput((prev) => [...prev, { type: 'input', text: getPromptString() }]);
      return;
    }

    soundManager.playKeyClick();
    setHistory((prev) => [...prev, raw]);
    setHistoryIdx(-1);

    const fullPrompt = `${getPromptString()} ${raw}`;
    const outputLines: { type: 'input' | 'output' | 'system' | 'error' | 'success'; text: string }[] = [
      { type: 'input', text: fullPrompt },
    ];

    const tokens = raw.toLowerCase().split(/\s+/);
    const primary = tokens[0];
    const nextState: IOSDeviceState = JSON.parse(JSON.stringify(deviceState));

    // Handle Help '?'
    if (raw === '?') {
      outputLines.push({
        type: 'output',
        text: getHelpContext(promptMode),
      });
      setTerminalOutput((prev) => [...prev, ...outputLines]);
      return;
    }

    // --- Mode Transitions: Exit / End ---
    if (primary === 'exit' || primary === 'ex') {
      if (promptMode === 'interface' || promptMode === 'subinterface' || promptMode === 'line' || promptMode === 'router_ospf' || promptMode === 'vlan') {
        setPromptMode('global');
        setActiveContextTarget('');
      } else if (promptMode === 'global') {
        setPromptMode('privileged');
      } else if (promptMode === 'privileged') {
        setPromptMode('user');
      }
      setTerminalOutput((prev) => [...prev, ...outputLines]);
      return;
    }

    if (primary === 'end') {
      setPromptMode('privileged');
      setActiveContextTarget('');
      setTerminalOutput((prev) => [...prev, ...outputLines]);
      return;
    }

    // --- User EXEC Mode ---
    if (promptMode === 'user') {
      if (primary === 'enable' || primary === 'en') {
        setPromptMode('privileged');
      } else if (primary === 'show' || primary === 'sh') {
        outputLines.push({ type: 'output', text: handleShowCommand(raw, deviceState) });
      } else {
        outputLines.push({ type: 'error', text: `% Ambiguous or unrecognized command: "${raw}". Type "enable" to enter Privileged mode.` });
      }
    }

    // --- Privileged EXEC Mode ---
    else if (promptMode === 'privileged') {
      if (primary === 'disable') {
        setPromptMode('user');
      } else if (primary === 'configure' || primary === 'conf') {
        if (tokens[1] === 'terminal' || tokens[1] === 't') {
          setPromptMode('global');
          outputLines.push({ type: 'system', text: `Enter configuration commands, one per line. End with CNTL/Z or "exit".` });
        } else {
          outputLines.push({ type: 'error', text: `% Incomplete command. Syntax: "configure terminal"` });
        }
      } else if (primary === 'show' || primary === 'sh') {
        outputLines.push({ type: 'output', text: handleShowCommand(raw, deviceState) });
      } else if (primary === 'ping') {
        const dest = tokens[1] || '192.168.1.1';
        outputLines.push({
          type: 'output',
          text: `Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to ${dest}, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms`,
        });
      } else if (primary === 'write' || raw === 'copy run start') {
        outputLines.push({ type: 'output', text: `Building configuration...\n[OK]` });
      } else {
        outputLines.push({ type: 'error', text: `% Invalid input detected at '^' marker.` });
      }
    }

    // --- Global Config Mode ---
    else if (promptMode === 'global') {
      if (primary === 'hostname') {
        const newHost = raw.split(/\s+/)[1];
        if (newHost) {
          nextState.hostname = newHost;
          setDeviceState(nextState);
        }
      } else if (primary === 'enable' && tokens[1] === 'secret') {
        const secret = raw.split(/\s+/)[2];
        if (secret) {
          nextState.enableSecret = secret;
          setDeviceState(nextState);
        }
      } else if (raw.startsWith('service password-encryption')) {
        nextState.passwordEncryption = true;
        setDeviceState(nextState);
      } else if (primary === 'banner' && tokens[1] === 'motd') {
        const bannerText = raw.substring(raw.indexOf('motd') + 4).trim();
        nextState.bannerMotd = bannerText;
        setDeviceState(nextState);
      } else if (primary === 'line' && tokens[1] === 'vty') {
        setPromptMode('line');
        setActiveContextTarget('vty');
      } else if (primary === 'line' && tokens[1] === 'console') {
        setPromptMode('line');
        setActiveContextTarget('console');
      } else if (primary === 'interface' || primary === 'int') {
        const ifName = raw.split(/\s+/)[1];
        const normalized = normalizeInterfaceName(ifName);
        if (normalized.includes('.')) {
          setPromptMode('subinterface');
        } else {
          setPromptMode('interface');
        }
        setActiveContextTarget(normalized);
        if (!nextState.interfaces[normalized]) {
          nextState.interfaces[normalized] = {
            name: normalized,
            status: 'up',
            protocol: 'up',
            mode: 'access',
          };
          setDeviceState(nextState);
        }
      } else if (primary === 'vlan') {
        const vlanId = parseInt(tokens[1], 10);
        if (!isNaN(vlanId)) {
          setPromptMode('vlan');
          setActiveContextTarget(String(vlanId));
          if (!nextState.vlans[vlanId]) {
            nextState.vlans[vlanId] = { name: `VLAN00${vlanId}`, status: 'active' };
            setDeviceState(nextState);
          }
        }
      } else if (primary === 'router' && tokens[1] === 'ospf') {
        const procId = parseInt(tokens[2], 10) || 1;
        setPromptMode('router_ospf');
        if (!nextState.ospf) {
          nextState.ospf = { processId: procId, networks: [] };
        }
        setDeviceState(nextState);
      } else if (primary === 'access-list') {
        const aclNum = tokens[1];
        if (!nextState.acls[aclNum]) {
          nextState.acls[aclNum] = {
            type: parseInt(aclNum, 10) >= 100 ? 'extended' : 'standard',
            rules: [],
          };
        }
        nextState.acls[aclNum].rules.push(raw);
        setDeviceState(nextState);
      } else if (primary === 'do') {
        const subCmd = raw.substring(3).trim();
        if (subCmd.startsWith('show') || subCmd.startsWith('sh')) {
          outputLines.push({ type: 'output', text: handleShowCommand(subCmd, nextState) });
        }
      } else {
        outputLines.push({ type: 'error', text: `% Incomplete or invalid global command: "${raw}".` });
      }
    }

    // --- Interface / Subinterface Mode ---
    else if (promptMode === 'interface' || promptMode === 'subinterface') {
      const ifKey = activeContextTarget;
      const currentIf = nextState.interfaces[ifKey] || {
        name: ifKey,
        status: 'up',
        protocol: 'up',
      };

      if (raw === 'no shutdown' || raw === 'no shut') {
        currentIf.status = 'up';
        currentIf.protocol = 'up';
        outputLines.push({
          type: 'system',
          text: `%LINK-3-UPDOWN: Interface ${ifKey}, changed state to up\n%LINEPROTO-5-UPDOWN: Line protocol on Interface ${ifKey}, changed state to up`,
        });
      } else if (raw === 'shutdown' || raw === 'shut') {
        currentIf.status = 'administratively down';
        currentIf.protocol = 'down';
        outputLines.push({
          type: 'system',
          text: `%LINK-5-CHANGED: Interface ${ifKey}, changed state to administratively down`,
        });
      } else if (primary === 'ip' && tokens[1] === 'address') {
        const ip = tokens[2];
        const mask = tokens[3];
        currentIf.ipAddress = ip;
        currentIf.subnetMask = mask;
      } else if (primary === 'encapsulation' && tokens[1]?.startsWith('dot1q')) {
        const vId = parseInt(tokens[2], 10);
        currentIf.vlan = vId;
      } else if (raw.startsWith('switchport mode trunk')) {
        currentIf.mode = 'trunk';
      } else if (raw.startsWith('switchport mode access')) {
        currentIf.mode = 'access';
      } else if (raw.startsWith('switchport access vlan')) {
        const vId = parseInt(tokens[3], 10);
        currentIf.vlan = vId;
      } else if (raw === 'switchport port-security') {
        if (!currentIf.portSecurity) {
          currentIf.portSecurity = { enabled: true, maxMacs: 1, violation: 'shutdown', sticky: false };
        } else {
          currentIf.portSecurity.enabled = true;
        }
      } else if (raw.startsWith('switchport port-security maximum')) {
        const max = parseInt(tokens[3], 10) || 1;
        if (!currentIf.portSecurity) {
          currentIf.portSecurity = { enabled: true, maxMacs: max, violation: 'shutdown', sticky: false };
        } else {
          currentIf.portSecurity.maxMacs = max;
        }
      } else if (raw.startsWith('switchport port-security violation')) {
        const viol = (tokens[3] as 'shutdown' | 'restrict' | 'protect') || 'shutdown';
        if (!currentIf.portSecurity) {
          currentIf.portSecurity = { enabled: true, maxMacs: 1, violation: viol, sticky: false };
        } else {
          currentIf.portSecurity.violation = viol;
        }
      } else if (raw.startsWith('switchport port-security mac-address sticky')) {
        if (!currentIf.portSecurity) {
          currentIf.portSecurity = { enabled: true, maxMacs: 1, violation: 'shutdown', sticky: true };
        } else {
          currentIf.portSecurity.sticky = true;
        }
      } else if (raw.startsWith('ip access-group')) {
        const aclId = tokens[2];
        const dir = tokens[3] || 'in';
        if (!nextState.appliedAcls[ifKey]) nextState.appliedAcls[ifKey] = {};
        if (dir === 'in') nextState.appliedAcls[ifKey].in = aclId;
        else nextState.appliedAcls[ifKey].out = aclId;
      } else if (primary === 'do') {
        const subCmd = raw.substring(3).trim();
        outputLines.push({ type: 'output', text: handleShowCommand(subCmd, nextState) });
      } else {
        outputLines.push({ type: 'error', text: `% Unrecognized interface command.` });
      }

      nextState.interfaces[ifKey] = currentIf;
      setDeviceState(nextState);
    }

    // --- Line Configuration Mode ---
    else if (promptMode === 'line') {
      if (raw.startsWith('transport input')) {
        const inputs = tokens.slice(2);
        nextState.vtyConfig.transportInput = inputs;
        setDeviceState(nextState);
      } else if (raw.startsWith('login local')) {
        nextState.vtyConfig.loginMethod = 'login local';
        setDeviceState(nextState);
      } else if (raw === 'login') {
        nextState.vtyConfig.loginMethod = 'login';
        setDeviceState(nextState);
      } else {
        outputLines.push({ type: 'error', text: `% Unknown line configuration command.` });
      }
    }

    // --- VLAN Mode ---
    else if (promptMode === 'vlan') {
      const vlanNum = parseInt(activeContextTarget, 10);
      if (primary === 'name') {
        const vName = raw.substring(5).trim();
        if (nextState.vlans[vlanNum]) {
          nextState.vlans[vlanNum].name = vName;
          setDeviceState(nextState);
        }
      } else {
        outputLines.push({ type: 'error', text: `% Unrecognized VLAN command.` });
      }
    }

    // --- Router OSPF Mode ---
    else if (promptMode === 'router_ospf') {
      if (primary === 'router-id') {
        const rId = tokens[1];
        if (nextState.ospf) {
          nextState.ospf.routerId = rId;
          setDeviceState(nextState);
        }
      } else if (primary === 'network') {
        // network 192.168.1.0 0.0.0.255 area 0
        const net = tokens[1];
        const wild = tokens[2];
        const areaIdx = tokens.indexOf('area');
        const area = areaIdx !== -1 ? parseInt(tokens[areaIdx + 1], 10) : 0;
        if (nextState.ospf) {
          nextState.ospf.networks.push({ network: net, wildcard: wild, area });
          setDeviceState(nextState);
        }
      } else {
        outputLines.push({ type: 'error', text: `% Unrecognized router OSPF command.` });
      }
    }

    setTerminalOutput((prev) => [...prev, ...outputLines]);
  };

  const normalizeInterfaceName = (str: string): string => {
    if (!str) return 'GigabitEthernet0/0';
    const lower = str.toLowerCase();
    if (lower.startsWith('g0/') || lower.startsWith('gi0/') || lower.startsWith('gigabitethernet0/')) {
      const rest = lower.replace(/^(g0\/|gi0\/|gigabitethernet0\/)/, '');
      return `GigabitEthernet0/${rest}`;
    }
    if (lower.startsWith('f0/') || lower.startsWith('fa0/') || lower.startsWith('fastethernet0/')) {
      const rest = lower.replace(/^(f0\/|fa0\/|fastethernet0\/)/, '');
      return `FastEthernet0/${rest}`;
    }
    return str;
  };

  const handleShowCommand = (cmd: string, state: IOSDeviceState): string => {
    const lower = cmd.toLowerCase();
    if (lower.includes('run') || lower.includes('running-config')) {
      return `Building configuration...
Current configuration : 1420 bytes
!
version 15.7
service timestamps debug datetime msec
service timestamps log datetime msec
${state.passwordEncryption ? 'service password-encryption' : 'no service password-encryption'}
!
hostname ${state.hostname}
!
${state.enableSecret ? `enable secret 5 $1$mERr$${state.enableSecret}` : '! no enable secret'}
!
${state.bannerMotd ? `banner motd ^C${state.bannerMotd}^C` : '!'}
!
${Object.values(state.interfaces)
  .map(
    (intf) => `interface ${intf.name}
 ${intf.ipAddress ? `ip address ${intf.ipAddress} ${intf.subnetMask}` : 'no ip address'}
 ${intf.vlan && intf.name.includes('.') ? `encapsulation dot1Q ${intf.vlan}` : ''}
 ${intf.mode === 'trunk' ? 'switchport mode trunk' : intf.mode === 'access' ? 'switchport mode access' : ''}
 ${intf.vlan && !intf.name.includes('.') ? `switchport access vlan ${intf.vlan}` : ''}
 ${intf.portSecurity?.enabled ? 'switchport port-security' : ''}
 ${intf.portSecurity?.maxMacs ? `switchport port-security maximum ${intf.portSecurity.maxMacs}` : ''}
 ${intf.portSecurity?.violation ? `switchport port-security violation ${intf.portSecurity.violation}` : ''}
 ${intf.portSecurity?.sticky ? 'switchport port-security mac-address sticky' : ''}
 ${intf.status === 'up' ? 'no shutdown' : 'shutdown'}`
  )
  .join('\n!\n')}
!
${
  state.ospf
    ? `router ospf ${state.ospf.processId}
 ${state.ospf.routerId ? `router-id ${state.ospf.routerId}` : ''}
 ${state.ospf.networks.map((n) => `network ${n.network} ${n.wildcard} area ${n.area}`).join('\n ')}`
    : '!'
}
!
${Object.entries(state.acls)
  .map(([, acl]) => acl.rules.join('\n'))
  .join('\n')}
!
line vty 0 4
 transport input ${state.vtyConfig.transportInput.join(' ')}
 ${state.vtyConfig.loginMethod}
!
end`;
    }

    if (lower.includes('ip int br') || lower.includes('ip interface brief')) {
      const rows = Object.values(state.interfaces).map(
        (i) =>
          `${i.name.padEnd(25)} ${(i.ipAddress || 'unassigned').padEnd(16)} YES manual ${(i.status || 'up').padEnd(22)} ${i.protocol || 'up'}`
      );
      return `Interface                  IP-Address      OK? Method Status                 Protocol\n${rows.join('\n')}`;
    }

    if (lower.includes('vlan br') || lower.includes('vlan brief')) {
      const rows = Object.entries(state.vlans).map(
        ([id, v]) => `${id.padEnd(5)} ${v.name.padEnd(20)} ${v.status.padEnd(10)}`
      );
      return `VLAN  Name                 Status     Ports\n----  -------------------- ---------- -------------------------------\n${rows.join(
        '\n'
      )}`;
    }

    if (lower.includes('port-security')) {
      return `Secure Port  MaxSecureAddr  CurrentAddr  SecurityViolation  Security Action
-----------------------------------------------------------------------
FastEthernet0/1       2              1                 0              Shutdown`;
    }

    return `Command processed. No active entries to display.`;
  };

  const getHelpContext = (mode: IOSPromptMode): string => {
    switch (mode) {
      case 'user':
        return `Available commands:
  enable             Turn on privileged commands
  exit               Exit from EXEC mode
  ping               Send echo messages
  show               Show running system information`;
      case 'privileged':
        return `Available commands:
  configure          Enter configuration mode
  disable            Turn off privileged commands
  ping               Send echo messages
  show               Show running system information
  write              Write running configuration to memory`;
      case 'global':
        return `Available commands:
  access-list        Add an access list entry
  banner             Define a login banner
  enable             Modify enable password parameters
  hostname           Set system's network name
  interface          Select an interface to configure
  line               Configure a terminal line
  router             Enable a routing process
  service            Modify system network service
  vlan               Configure VLAN parameters
  exit               Exit from global configuration mode`;
      case 'interface':
      case 'subinterface':
        return `Interface configuration commands:
  encapsulation      Set encapsulation type (802.1Q)
  ip address         Set IP address and subnet mask
  no shutdown        Restart interface
  shutdown           Shutdown interface
  switchport         Set switching characteristics
  exit               Exit interface configuration mode`;
      default:
        return `Type 'exit' to return to previous mode.`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(commandInput);
      setCommandInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(nextIdx);
        setCommandInput(history[nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx !== -1) {
        const nextIdx = historyIdx + 1;
        if (nextIdx >= history.length) {
          setHistoryIdx(-1);
          setCommandInput('');
        } else {
          setHistoryIdx(nextIdx);
          setCommandInput(history[nextIdx] || '');
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Basic auto-complete
      const val = commandInput.trim().toLowerCase();
      if (val === 'conf' || val === 'con') setCommandInput('configure terminal');
      else if (val === 'en') setCommandInput('enable');
      else if (val === 'sh ip') setCommandInput('show ip interface brief');
      else if (val === 'sh run') setCommandInput('show running-config');
      else if (val === 'no shut') setCommandInput('no shutdown');
    }
  };

  const allTasksCompleted = completedTaskIds.length === lab.tasks.length && lab.tasks.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Top Header & Lab Selector */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Cisco IOS Engine</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">CLI Hands-On Sandbox</span>
            <span aria-hidden="true">·</span>
            <span>CCNA 200-301 Certification Lab</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            {lab.title}
          </h1>
          <p className="text-sm text-slate-300 mt-0.5 max-w-2xl">
            {lab.scenario}
          </p>
        </div>

        {/* Lab Switcher Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CLI_LABS.map((l, idx) => {
            const isCurrent = idx === selectedLabIndex;
            return (
              <button
                key={l.id}
                onClick={() => {
                  soundManager.playKeyClick();
                  setSelectedLabIndex(idx);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isCurrent
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                Lab {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Zone Terminal & Goal Checklist Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone: Cisco IOS CLI Interactive Console (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden flex flex-col">
            {/* Terminal Window Header Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-mono">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-white">Console: {deviceState.hostname}</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400 text-[11px]">9600 8-N-1 (VT100)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetLab}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                  title="Reload switch/router config"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reload</span>
                </button>
              </div>
            </div>

            {/* Terminal Output Screen */}
            <div
              onClick={() => inputRef.current?.focus()}
              className="h-[430px] p-4 overflow-y-auto font-mono text-xs leading-relaxed select-text cursor-text bg-slate-950 text-slate-200 space-y-1 scrollbar-thin scrollbar-thumb-slate-800"
            >
              {terminalOutput.map((item, idx) => (
                <div
                  key={idx}
                  className={`whitespace-pre-wrap ${
                    item.type === 'input'
                      ? 'text-white font-bold'
                      : item.type === 'system'
                      ? 'text-emerald-400/90'
                      : item.type === 'error'
                      ? 'text-rose-400'
                      : 'text-slate-300'
                  }`}
                >
                  {item.text}
                </div>
              ))}

              {/* Current Active Input Line */}
              <div className="flex items-center gap-1 text-white pt-1">
                <span className="text-emerald-400 font-bold select-none">{getPromptString()}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                  className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-white p-0 focus:ring-0"
                />
              </div>
              <div ref={terminalEndRef} />
            </div>

            {/* Mobile Quick-Command Bar */}
            <div className="px-3 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-mono">
              <span className="text-[10px] text-slate-500 font-sans uppercase font-bold shrink-0">Fast Keys:</span>
              {[
                { label: 'en', cmd: 'enable' },
                { label: 'conf t', cmd: 'configure terminal' },
                { label: 'sh run', cmd: 'show running-config' },
                { label: 'sh ip int br', cmd: 'show ip interface brief' },
                { label: 'no shut', cmd: 'no shutdown' },
                { label: 'exit', cmd: 'exit' },
                { label: '?', cmd: '?' },
              ].map((macro) => (
                <button
                  key={macro.label}
                  type="button"
                  onClick={() => executeCommand(macro.cmd)}
                  className="rounded px-2 py-0.5 bg-slate-800 text-emerald-400 hover:bg-slate-700 hover:text-white border border-slate-700 shrink-0 transition-colors"
                >
                  {macro.label}
                </button>
              ))}
            </div>

            {/* Terminal Helper Footer */}
            <div className="px-4 py-2 bg-slate-900/70 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="hidden sm:inline">Shortcuts: [Tab] Autocomplete · [?] Commands · [↑/↓] History</span>
              <span className="sm:hidden text-[10px]">Tap fast keys above or use soft keyboard</span>
              <button
                onClick={() => executeCommand('show running-config')}
                className="text-emerald-400 hover:text-emerald-300 font-mono transition-colors"
              >
                sh run
              </button>
            </div>
          </div>
        </div>

        {/* Right Zone: Objective Checklist & Guided Solutions (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Lab Verification Criteria
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-white">
                    {completedTaskIds.length} / {lab.tasks.length} Objectives Completed
                  </span>
                </div>
              </div>

              {allTasksCompleted && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Lab Passed!</span>
                </div>
              )}
            </div>

            {/* Task Item List */}
            <div className="space-y-3 mb-5">
              {lab.tasks.map((task, idx) => {
                const isDone = completedTaskIds.includes(task.id);
                return (
                  <div
                    key={task.id}
                    className={`rounded-xl border p-3.5 transition-all ${
                      isDone
                        ? 'border-emerald-500/40 bg-emerald-950/20'
                        : 'border-slate-800 bg-slate-950/60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px] font-bold text-slate-400">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-medium leading-relaxed ${isDone ? 'text-white' : 'text-slate-300'}`}>
                          {task.description}
                        </p>
                        <p className="text-[11px] font-mono text-slate-500 mt-1">
                          Hint: {task.hint}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Walkthrough & Solution Accordion */}
            <div className="border-t border-slate-800 pt-4">
              <button
                onClick={() => setShowWalkthrough(!showWalkthrough)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-sky-400" />
                  <span>{showWalkthrough ? 'Hide Solution Script' : 'Reveal Solution Script'}</span>
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform ${showWalkthrough ? 'rotate-90' : ''}`} />
              </button>

              {showWalkthrough && (
                <div className="mt-3 rounded-xl border border-sky-500/20 bg-sky-950/30 p-3.5 text-xs text-sky-200 animate-in fade-in">
                  <span className="block text-[11px] text-slate-400 uppercase font-bold mb-2">
                    Exact Commands for this Lab:
                  </span>
                  <div className="font-mono text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-emerald-400 space-y-1">
                    {lab.solutionCommands.map((cmd, i) => (
                      <div key={i}>{cmd}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
