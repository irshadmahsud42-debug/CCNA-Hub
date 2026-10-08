export type CCNADomain =
  | 'network_fundamentals'
  | 'network_access'
  | 'ip_connectivity'
  | 'ip_services'
  | 'security_fundamentals'
  | 'automation_programmability';

export interface DomainMeta {
  id: CCNADomain;
  code: string;
  name: string;
  weight: number; // percentage
  color: string;
}

export type CCNATab = 'cli_labs' | 'subnetting' | 'topology' | 'exam' | 'cheatsheet';

// Cisco IOS CLI Types
export type IOSPromptMode =
  | 'user' // Router>
  | 'privileged' // Router#
  | 'global' // Router(config)#
  | 'interface' // Router(config-if)#
  | 'subinterface' // Router(config-subif)#
  | 'line' // Router(config-line)#
  | 'router_ospf' // Router(config-router)#
  | 'vlan'; // Router(config-vlan)#

export interface IOSInterfaceState {
  name: string;
  ipAddress?: string;
  subnetMask?: string;
  status: 'up' | 'down' | 'administratively down';
  protocol: 'up' | 'down';
  vlan?: number;
  mode?: 'access' | 'trunk';
  portSecurity?: {
    enabled: boolean;
    maxMacs: number;
    violation: 'shutdown' | 'restrict' | 'protect';
    sticky: boolean;
  };
}

export interface IOSDeviceState {
  hostname: string;
  enableSecret?: string;
  bannerMotd?: string;
  passwordEncryption: boolean;
  interfaces: Record<string, IOSInterfaceState>;
  vlans: Record<number, { name: string; status: 'active' | 'suspended' }>;
  ospf?: {
    processId: number;
    routerId?: string;
    networks: { network: string; wildcard: string; area: number }[];
  };
  acls: Record<string, { type: 'standard' | 'extended'; rules: string[] }>;
  appliedAcls: Record<string, { in?: string; out?: string }>;
  routes: { prefix: string; mask: string; nextHopOrInterface: string }[];
  vtyConfig: {
    transportInput: string[];
    loginMethod: 'login' | 'login local';
  };
}

export interface CLILab {
  id: string;
  title: string;
  domain: CCNADomain;
  difficulty: 'Associate' | 'Intermediate' | 'Advanced';
  deviceType: 'router' | 'switch';
  deviceName: string;
  scenario: string;
  tasks: {
    id: string;
    description: string;
    targetCheck: (state: IOSDeviceState) => boolean;
    hint: string;
  }[];
  initialState: IOSDeviceState;
  solutionCommands: string[];
}

// Subnetting Trainer Types
export interface SubnetQuestion {
  id: string;
  ip: string;
  cidr: number;
  networkAddress: string;
  firstUsable: string;
  lastUsable: string;
  broadcastAddress: string;
  subnetMask: string;
  wildcardMask: string;
  usableHosts: number;
}

// Topology Visualizer Types
export interface TopologyNode {
  id: string;
  label: string;
  type: 'router' | 'switch' | 'pc' | 'server';
  ip: string;
  mac: string;
  vlan?: number;
  x: number;
  y: number;
  status: 'online' | 'offline';
}

export interface TopologyLink {
  id: string;
  source: string;
  target: string;
  sourceInterface: string;
  targetInterface: string;
  type: 'ethernet' | 'trunk' | 'serial';
  status: 'active' | 'down';
}

// CCNA Practice Exam Question
export interface ExamQuestion {
  id: string;
  domain: CCNADomain;
  question: string;
  codeSnippet?: string;
  options: { id: string; text: string }[];
  correctOptionIds: string[];
  isMultiSelect?: boolean;
  explanation: string;
  ciscoReference: string;
}

export interface UserExamResult {
  score: number; // 0 to 1000
  passed: boolean;
  totalQuestions: number;
  correctCount: number;
  domainScores: Record<CCNADomain, { total: number; correct: number; percent: number }>;
  userAnswers: Record<string, string[]>;
  timestamp: string;
}
