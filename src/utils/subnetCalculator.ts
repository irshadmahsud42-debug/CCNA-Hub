export interface SubnetResult {
  ip: string;
  cidr: number;
  subnetMask: string;
  wildcardMask: string;
  networkAddress: string;
  firstUsable: string;
  lastUsable: string;
  broadcastAddress: string;
  totalAddresses: number;
  usableHosts: number;
  ipClass: 'A' | 'B' | 'C' | 'D' | 'E';
  isPrivate: boolean;
  binaryIp: string[];
  binaryMask: string[];
}

function ipToLong(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function longToIp(long: number): string {
  return [
    (long >>> 24) & 255,
    (long >>> 16) & 255,
    (long >>> 8) & 255,
    long & 255,
  ].join('.');
}

function cidrToMask(cidr: number): number {
  return cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
}

function toBinaryOctets(long: number): string[] {
  const binary32 = (long >>> 0).toString(2).padStart(32, '0');
  return [
    binary32.slice(0, 8),
    binary32.slice(8, 16),
    binary32.slice(16, 24),
    binary32.slice(24, 32),
  ];
}

export function calculateSubnet(ipStr: string, cidr: number): SubnetResult | null {
  const parts = ipStr.trim().split('.');
  if (parts.length !== 4) return null;
  for (const p of parts) {
    const num = parseInt(p, 10);
    if (isNaN(num) || num < 0 || num > 255) return null;
  }
  if (cidr < 0 || cidr > 32) return null;

  const ipLong = ipToLong(ipStr);
  const maskLong = cidrToMask(cidr);
  const wildcardLong = ~maskLong >>> 0;

  const networkLong = (ipLong & maskLong) >>> 0;
  const broadcastLong = (networkLong | wildcardLong) >>> 0;

  const totalAddresses = Math.pow(2, 32 - cidr);
  let usableHosts = 0;
  let firstUsableLong = networkLong;
  let lastUsableLong = broadcastLong;

  if (cidr === 32) {
    usableHosts = 1;
    firstUsableLong = networkLong;
    lastUsableLong = networkLong;
  } else if (cidr === 31) {
    usableHosts = 2; // RFC 3021 Point-to-Point
    firstUsableLong = networkLong;
    lastUsableLong = broadcastLong;
  } else {
    usableHosts = Math.max(0, totalAddresses - 2);
    firstUsableLong = (networkLong + 1) >>> 0;
    lastUsableLong = (broadcastLong - 1) >>> 0;
  }

  // Class & Private determination
  const firstOctet = parseInt(parts[0], 10);
  let ipClass: 'A' | 'B' | 'C' | 'D' | 'E' = 'C';
  if (firstOctet >= 1 && firstOctet <= 126) ipClass = 'A';
  else if (firstOctet >= 128 && firstOctet <= 191) ipClass = 'B';
  else if (firstOctet >= 192 && firstOctet <= 223) ipClass = 'C';
  else if (firstOctet >= 224 && firstOctet <= 239) ipClass = 'D';
  else ipClass = 'E';

  let isPrivate = false;
  if (firstOctet === 10) isPrivate = true;
  else if (firstOctet === 172 && parseInt(parts[1], 10) >= 16 && parseInt(parts[1], 10) <= 31) isPrivate = true;
  else if (firstOctet === 192 && parseInt(parts[1], 10) === 168) isPrivate = true;

  return {
    ip: ipStr,
    cidr,
    subnetMask: longToIp(maskLong),
    wildcardMask: longToIp(wildcardLong),
    networkAddress: longToIp(networkLong),
    firstUsable: longToIp(firstUsableLong),
    lastUsable: longToIp(lastUsableLong),
    broadcastAddress: longToIp(broadcastLong),
    totalAddresses,
    usableHosts,
    ipClass,
    isPrivate,
    binaryIp: toBinaryOctets(ipLong),
    binaryMask: toBinaryOctets(maskLong),
  };
}
