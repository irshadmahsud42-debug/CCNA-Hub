import { DomainMeta, CLILab, ExamQuestion } from '../types/ccna';

export const CCNA_DOMAINS: DomainMeta[] = [
  {
    id: 'network_fundamentals',
    code: '1.0',
    name: 'Network Fundamentals',
    weight: 20,
    color: 'emerald',
  },
  {
    id: 'network_access',
    code: '2.0',
    name: 'Network Access',
    weight: 20,
    color: 'sky',
  },
  {
    id: 'ip_connectivity',
    code: '3.0',
    name: 'IP Connectivity',
    weight: 25,
    color: 'indigo',
  },
  {
    id: 'ip_services',
    code: '4.0',
    name: 'IP Services',
    weight: 10,
    color: 'amber',
  },
  {
    id: 'security_fundamentals',
    code: '5.0',
    name: 'Security Fundamentals',
    weight: 15,
    color: 'rose',
  },
  {
    id: 'automation_programmability',
    code: '6.0',
    name: 'Automation & Programmability',
    weight: 10,
    color: 'purple',
  },
];

export const CLI_LABS: CLILab[] = [
  {
    id: 'lab-1',
    title: 'Lab 1: Initial Router Hardening & SSH Config',
    domain: 'security_fundamentals',
    difficulty: 'Associate',
    deviceType: 'router',
    deviceName: 'R1',
    scenario:
      'A new Cisco 2911 router was racked in Branch Office Chicago. Configure initial device hardening: hostname, encrypted privileged secret, service password encryption, legal MOTD banner, and restrict VTY lines to SSH only.',
    initialState: {
      hostname: 'Router',
      passwordEncryption: false,
      interfaces: {
        'GigabitEthernet0/0': {
          name: 'GigabitEthernet0/0',
          status: 'administratively down',
          protocol: 'down',
        },
      },
      vlans: { 1: { name: 'default', status: 'active' } },
      acls: {},
      appliedAcls: {},
      routes: [],
      vtyConfig: {
        transportInput: ['all'],
        loginMethod: 'login',
      },
    },
    tasks: [
      {
        id: 'task-1-1',
        description: 'Set hostname to "R1" in global configuration mode.',
        targetCheck: (state) => state.hostname.toUpperCase() === 'R1',
        hint: 'Enter global config with "configure terminal", then type "hostname R1"',
      },
      {
        id: 'task-1-2',
        description: 'Configure encrypted enable secret password to "cisco123".',
        targetCheck: (state) => state.enableSecret === 'cisco123',
        hint: 'Use command: "enable secret cisco123"',
      },
      {
        id: 'task-1-3',
        description: 'Enable global service password-encryption for plaintext passwords.',
        targetCheck: (state) => state.passwordEncryption === true,
        hint: 'Use command: "service password-encryption"',
      },
      {
        id: 'task-1-4',
        description: 'Configure a legal login banner ("banner motd #Authorized Access Only#").',
        targetCheck: (state) => !!state.bannerMotd && state.bannerMotd.length > 5,
        hint: 'Use command: "banner motd #Authorized Access Only#"',
      },
      {
        id: 'task-1-5',
        description: 'Restrict VTY lines 0 4 to only permit SSH transport input.',
        targetCheck: (state) =>
          state.vtyConfig.transportInput.includes('ssh') &&
          !state.vtyConfig.transportInput.includes('telnet') &&
          !state.vtyConfig.transportInput.includes('all'),
        hint: 'Enter "line vty 0 4", then execute "transport input ssh"',
      },
    ],
    solutionCommands: [
      'enable',
      'configure terminal',
      'hostname R1',
      'enable secret cisco123',
      'service password-encryption',
      'banner motd #Authorized Access Only#',
      'line vty 0 4',
      'transport input ssh',
      'exit',
      'exit',
    ],
  },
  {
    id: 'lab-2',
    title: 'Lab 2: Enterprise VLANs & 802.1Q Trunking',
    domain: 'network_access',
    difficulty: 'Associate',
    deviceType: 'switch',
    deviceName: 'SW1',
    scenario:
      'Segment departmental broadcast domains on Catalyst switch SW1. Create VLAN 10 (SALES) and VLAN 20 (ENG). Set port Gi0/1 as an 802.1Q trunk link to the distribution switch, and assign Gi0/2 to access VLAN 10.',
    initialState: {
      hostname: 'SW1',
      passwordEncryption: false,
      interfaces: {
        'GigabitEthernet0/1': {
          name: 'GigabitEthernet0/1',
          status: 'up',
          protocol: 'up',
          mode: 'access',
          vlan: 1,
        },
        'GigabitEthernet0/2': {
          name: 'GigabitEthernet0/2',
          status: 'up',
          protocol: 'up',
          mode: 'access',
          vlan: 1,
        },
      },
      vlans: { 1: { name: 'default', status: 'active' } },
      acls: {},
      appliedAcls: {},
      routes: [],
      vtyConfig: { transportInput: ['all'], loginMethod: 'login' },
    },
    tasks: [
      {
        id: 'task-2-1',
        description: 'Create VLAN 10 with name "SALES".',
        targetCheck: (state) => !!state.vlans[10] && state.vlans[10].name.toUpperCase() === 'SALES',
        hint: 'Type "vlan 10", then "name SALES", then "exit"',
      },
      {
        id: 'task-2-2',
        description: 'Create VLAN 20 with name "ENG".',
        targetCheck: (state) => !!state.vlans[20] && state.vlans[20].name.toUpperCase() === 'ENG',
        hint: 'Type "vlan 20", then "name ENG", then "exit"',
      },
      {
        id: 'task-2-3',
        description: 'Configure interface GigabitEthernet0/1 as a trunk port ("switchport mode trunk").',
        targetCheck: (state) => state.interfaces['GigabitEthernet0/1']?.mode === 'trunk',
        hint: 'Enter "interface g0/1", then "switchport mode trunk"',
      },
      {
        id: 'task-2-4',
        description: 'Assign interface GigabitEthernet0/2 to access VLAN 10.',
        targetCheck: (state) =>
          state.interfaces['GigabitEthernet0/2']?.mode === 'access' &&
          state.interfaces['GigabitEthernet0/2']?.vlan === 10,
        hint: 'Enter "interface g0/2", "switchport mode access", then "switchport access vlan 10"',
      },
    ],
    solutionCommands: [
      'enable',
      'configure terminal',
      'vlan 10',
      'name SALES',
      'vlan 20',
      'name ENG',
      'interface g0/1',
      'switchport mode trunk',
      'interface g0/2',
      'switchport mode access',
      'switchport access vlan 10',
      'exit',
      'exit',
    ],
  },
  {
    id: 'lab-3',
    title: 'Lab 3: Router-on-a-Stick Inter-VLAN Routing',
    domain: 'network_access',
    difficulty: 'Intermediate',
    deviceType: 'router',
    deviceName: 'R1',
    scenario:
      'Configure subinterfaces on router R1 interface GigabitEthernet0/0 to route traffic between VLAN 10 (192.168.10.0/24) and VLAN 20 (192.168.20.0/24) using 802.1Q encapsulation.',
    initialState: {
      hostname: 'R1',
      passwordEncryption: false,
      interfaces: {
        'GigabitEthernet0/0': {
          name: 'GigabitEthernet0/0',
          status: 'administratively down',
          protocol: 'down',
        },
      },
      vlans: { 1: { name: 'default', status: 'active' } },
      acls: {},
      appliedAcls: {},
      routes: [],
      vtyConfig: { transportInput: ['all'], loginMethod: 'login' },
    },
    tasks: [
      {
        id: 'task-3-1',
        description: 'Bring physical interface GigabitEthernet0/0 UP ("no shutdown").',
        targetCheck: (state) => state.interfaces['GigabitEthernet0/0']?.status === 'up',
        hint: 'Enter "interface g0/0", then type "no shutdown"',
      },
      {
        id: 'task-3-2',
        description:
          'Create subinterface g0/0.10, set 802.1Q encapsulation for VLAN 10, and assign IP 192.168.10.1 255.255.255.0.',
        targetCheck: (state) => {
          const sub = state.interfaces['GigabitEthernet0/0.10'];
          return sub?.vlan === 10 && sub?.ipAddress === '192.168.10.1' && sub?.subnetMask === '255.255.255.0';
        },
        hint: 'interface g0/0.10 -> encapsulation dot1q 10 -> ip address 192.168.10.1 255.255.255.0',
      },
      {
        id: 'task-3-3',
        description:
          'Create subinterface g0/0.20, set 802.1Q encapsulation for VLAN 20, and assign IP 192.168.20.1 255.255.255.0.',
        targetCheck: (state) => {
          const sub = state.interfaces['GigabitEthernet0/0.20'];
          return sub?.vlan === 20 && sub?.ipAddress === '192.168.20.1' && sub?.subnetMask === '255.255.255.0';
        },
        hint: 'interface g0/0.20 -> encapsulation dot1q 20 -> ip address 192.168.20.1 255.255.255.0',
      },
    ],
    solutionCommands: [
      'enable',
      'configure terminal',
      'interface g0/0',
      'no shutdown',
      'interface g0/0.10',
      'encapsulation dot1q 10',
      'ip address 192.168.10.1 255.255.255.0',
      'interface g0/0.20',
      'encapsulation dot1q 20',
      'ip address 192.168.20.1 255.255.255.0',
      'exit',
      'exit',
    ],
  },
  {
    id: 'lab-4',
    title: 'Lab 4: Single-Area OSPFv2 Routing',
    domain: 'ip_connectivity',
    difficulty: 'Intermediate',
    deviceType: 'router',
    deviceName: 'R1',
    scenario:
      'Activate OSPF Process ID 1 on R1. Set the router-id to 1.1.1.1, and advertise LAN network 192.168.1.0/24 and WAN link 10.0.0.0/30 into backbone Area 0.',
    initialState: {
      hostname: 'R1',
      passwordEncryption: false,
      interfaces: {
        'GigabitEthernet0/0': {
          name: 'GigabitEthernet0/0',
          status: 'up',
          protocol: 'up',
          ipAddress: '192.168.1.1',
          subnetMask: '255.255.255.0',
        },
        'GigabitEthernet0/1': {
          name: 'GigabitEthernet0/1',
          status: 'up',
          protocol: 'up',
          ipAddress: '10.0.0.1',
          subnetMask: '255.255.255.252',
        },
      },
      vlans: { 1: { name: 'default', status: 'active' } },
      acls: {},
      appliedAcls: {},
      routes: [],
      vtyConfig: { transportInput: ['all'], loginMethod: 'login' },
    },
    tasks: [
      {
        id: 'task-4-1',
        description: 'Enable OSPF process ID 1 ("router ospf 1").',
        targetCheck: (state) => state.ospf?.processId === 1,
        hint: 'Use command: "router ospf 1"',
      },
      {
        id: 'task-4-2',
        description: 'Manually configure OSPF Router ID to 1.1.1.1.',
        targetCheck: (state) => state.ospf?.routerId === '1.1.1.1',
        hint: 'Inside router ospf configuration mode, type "router-id 1.1.1.1"',
      },
      {
        id: 'task-4-3',
        description:
          'Advertise subnet 192.168.1.0/24 into Area 0 using wildcard mask 0.0.0.255.',
        targetCheck: (state) =>
          state.ospf?.networks.some(
            (n) => n.network === '192.168.1.0' && n.wildcard === '0.0.0.255' && n.area === 0
          ) || false,
        hint: 'Type "network 192.168.1.0 0.0.0.255 area 0"',
      },
      {
        id: 'task-4-4',
        description:
          'Advertise WAN point-to-point subnet 10.0.0.0/30 into Area 0 using wildcard mask 0.0.0.3.',
        targetCheck: (state) =>
          state.ospf?.networks.some(
            (n) => n.network === '10.0.0.0' && n.wildcard === '0.0.0.3' && n.area === 0
          ) || false,
        hint: 'Type "network 10.0.0.0 0.0.0.3 area 0"',
      },
    ],
    solutionCommands: [
      'enable',
      'configure terminal',
      'router ospf 1',
      'router-id 1.1.1.1',
      'network 192.168.1.0 0.0.0.255 area 0',
      'network 10.0.0.0 0.0.0.3 area 0',
      'exit',
      'exit',
    ],
  },
  {
    id: 'lab-5',
    title: 'Lab 5: Extended IPv4 Access Control List (ACL)',
    domain: 'security_fundamentals',
    difficulty: 'Advanced',
    deviceType: 'router',
    deviceName: 'R1',
    scenario:
      'Security compliance requires filtering inbound traffic on GigabitEthernet0/1. Configure Extended ACL 101 to permit HTTP (port 80) and HTTPS (port 443) from subnet 192.168.10.0/24 to any host, deny all other traffic from that subnet, and apply it inbound on interface g0/1.',
    initialState: {
      hostname: 'R1',
      passwordEncryption: false,
      interfaces: {
        'GigabitEthernet0/1': {
          name: 'GigabitEthernet0/1',
          status: 'up',
          protocol: 'up',
          ipAddress: '192.168.10.1',
          subnetMask: '255.255.255.0',
        },
      },
      vlans: { 1: { name: 'default', status: 'active' } },
      acls: {},
      appliedAcls: {},
      routes: [],
      vtyConfig: { transportInput: ['all'], loginMethod: 'login' },
    },
    tasks: [
      {
        id: 'task-5-1',
        description: 'Create ACL 101 rule permitting TCP traffic on port 80 (HTTP).',
        targetCheck: (state) =>
          state.acls['101']?.rules.some((r) => r.includes('permit tcp') && r.includes('80')) || false,
        hint: 'access-list 101 permit tcp 192.168.10.0 0.0.0.255 any eq 80',
      },
      {
        id: 'task-5-2',
        description: 'Create ACL 101 rule permitting TCP traffic on port 443 (HTTPS).',
        targetCheck: (state) =>
          state.acls['101']?.rules.some((r) => r.includes('permit tcp') && r.includes('443')) || false,
        hint: 'access-list 101 permit tcp 192.168.10.0 0.0.0.255 any eq 443',
      },
      {
        id: 'task-5-3',
        description: 'Explicitly deny all remaining IP traffic from 192.168.10.0/24 to any destination.',
        targetCheck: (state) =>
          state.acls['101']?.rules.some((r) => r.includes('deny ip 192.168.10.0')) || false,
        hint: 'access-list 101 deny ip 192.168.10.0 0.0.0.255 any',
      },
      {
        id: 'task-5-4',
        description: 'Apply ACL 101 inbound on interface GigabitEthernet0/1 ("ip access-group 101 in").',
        targetCheck: (state) => state.appliedAcls['GigabitEthernet0/1']?.in === '101',
        hint: 'Enter "interface g0/1", then execute "ip access-group 101 in"',
      },
    ],
    solutionCommands: [
      'enable',
      'configure terminal',
      'access-list 101 permit tcp 192.168.10.0 0.0.0.255 any eq 80',
      'access-list 101 permit tcp 192.168.10.0 0.0.0.255 any eq 443',
      'access-list 101 deny ip 192.168.10.0 0.0.0.255 any',
      'interface g0/1',
      'ip access-group 101 in',
      'exit',
      'exit',
    ],
  },
  {
    id: 'lab-6',
    title: 'Lab 6: Switchport Port Security & Violation Actions',
    domain: 'security_fundamentals',
    difficulty: 'Intermediate',
    deviceType: 'switch',
    deviceName: 'SW1',
    scenario:
      'Prevent unauthorized rogue laptops and MAC-flooding attacks on access interface FastEthernet0/1. Configure port security to allow a maximum of 2 learned MAC addresses, save them dynamically via sticky learning, and set the violation mode to shutdown.',
    initialState: {
      hostname: 'SW1',
      passwordEncryption: false,
      interfaces: {
        'FastEthernet0/1': {
          name: 'FastEthernet0/1',
          status: 'up',
          protocol: 'up',
          mode: 'access',
          vlan: 1,
        },
      },
      vlans: { 1: { name: 'default', status: 'active' } },
      acls: {},
      appliedAcls: {},
      routes: [],
      vtyConfig: { transportInput: ['all'], loginMethod: 'login' },
    },
    tasks: [
      {
        id: 'task-6-1',
        description: 'Enable port security on FastEthernet0/1 ("switchport port-security").',
        targetCheck: (state) => state.interfaces['FastEthernet0/1']?.portSecurity?.enabled === true,
        hint: 'Enter "interface f0/1", "switchport mode access", then "switchport port-security"',
      },
      {
        id: 'task-6-2',
        description: 'Set maximum learned MAC addresses to 2.',
        targetCheck: (state) => state.interfaces['FastEthernet0/1']?.portSecurity?.maxMacs === 2,
        hint: 'Type "switchport port-security maximum 2"',
      },
      {
        id: 'task-6-3',
        description: 'Set the security violation mode to shutdown.',
        targetCheck: (state) => state.interfaces['FastEthernet0/1']?.portSecurity?.violation === 'shutdown',
        hint: 'Type "switchport port-security violation shutdown"',
      },
      {
        id: 'task-6-4',
        description: 'Enable sticky MAC address learning ("switchport port-security mac-address sticky").',
        targetCheck: (state) => state.interfaces['FastEthernet0/1']?.portSecurity?.sticky === true,
        hint: 'Type "switchport port-security mac-address sticky"',
      },
    ],
    solutionCommands: [
      'enable',
      'configure terminal',
      'interface f0/1',
      'switchport mode access',
      'switchport port-security',
      'switchport port-security maximum 2',
      'switchport port-security violation shutdown',
      'switchport port-security mac-address sticky',
      'exit',
      'exit',
    ],
  },
];

export const CCNA_EXAM_QUESTIONS: ExamQuestion[] = [
  {
    id: 'q-1',
    domain: 'ip_connectivity',
    question:
      'Refer to the exhibit. A network engineer configures a static floating route to provide backup connectivity when the primary OSPF link fails. Which static route command achieves this objective?',
    codeSnippet: `R1# show ip route ospf
O    10.5.0.0/24 [110/20] via 192.168.1.2, 00:14:22, GigabitEthernet0/0`,
    options: [
      { id: 'A', text: 'ip route 10.5.0.0 255.255.255.0 192.168.2.2 90' },
      { id: 'B', text: 'ip route 10.5.0.0 255.255.255.0 192.168.2.2 110' },
      { id: 'C', text: 'ip route 10.5.0.0 255.255.255.0 192.168.2.2 120' },
      { id: 'D', text: 'ip route 10.5.0.0 255.255.255.0 192.168.2.2 1' },
    ],
    correctOptionIds: ['C'],
    explanation:
      'A floating static route must have an Administrative Distance (AD) HIGHER than the primary routing protocol. The primary route is learned via OSPF, which has an AD of 110. A static route with an AD of 120 (higher than 110) will remain dormant in the running-config and will only be installed into the routing table if the OSPF route disappears.',
    ciscoReference: 'Cisco CCNA 200-301 Official Cert Guide Vol 1, Ch 16: Configuring IPv4 Routing',
  },
  {
    id: 'q-2',
    domain: 'network_access',
    question:
      'A network administrator connects two Cisco Catalyst switches via an EtherChannel trunk. The link fails to bundle. The administrator examines Switch A and sees it is configured with "channel-group 1 mode desirable". Which two modes on Switch B will successfully form the EtherChannel bundle? (Choose two.)',
    options: [
      { id: 'A', text: 'auto' },
      { id: 'B', text: 'desirable' },
      { id: 'C', text: 'active' },
      { id: 'D', text: 'passive' },
      { id: 'E', text: 'on' },
    ],
    correctOptionIds: ['A', 'B'],
    isMultiSelect: true,
    explanation:
      'The "desirable" mode uses Cisco proprietary Port Aggregation Protocol (PAgP). PAgP bundles successfully when one side is "desirable" and the other side is either "desirable" (both negotiate) or "auto" (passively responds to PAgP packets). "active" and "passive" belong to IEEE 802.3ad LACP, which cannot negotiate with PAgP.',
    ciscoReference: 'Cisco 200-301 Exam Topic 2.4: Configure and verify (Layer 2/Layer 3) EtherChannel (LACP/PAgP)',
  },
  {
    id: 'q-3',
    domain: 'network_fundamentals',
    question:
      'How many usable host IP addresses are available on an IPv4 subnet with a CIDR prefix of /28?',
    options: [
      { id: 'A', text: '14' },
      { id: 'B', text: '16' },
      { id: 'C', text: '30' },
      { id: 'D', text: '6' },
    ],
    correctOptionIds: ['A'],
    explanation:
      'An IPv4 address has 32 bits. With a /28 prefix, there are 32 - 28 = 4 host bits remaining. Total addresses = 2^4 = 16. Subtracting 2 (one for the Network ID and one for the Broadcast Address) yields 16 - 2 = 14 usable host addresses.',
    ciscoReference: 'Cisco CCNA 200-301 Official Cert Guide Vol 1, Ch 13: Subnetting',
  },
  {
    id: 'q-4',
    domain: 'ip_services',
    question:
      'Match the Cisco IOS Syslog severity level with the correct numeric code. What is the severity level number for "Warnings"?',
    options: [
      { id: 'A', text: 'Level 2' },
      { id: 'B', text: 'Level 3' },
      { id: 'C', text: 'Level 4' },
      { id: 'D', text: 'Level 5' },
    ],
    correctOptionIds: ['C'],
    explanation:
      'Cisco Syslog levels range from 0 to 7: 0=Emergency, 1=Alert, 2=Critical, 3=Error, 4=Warning, 5=Notification, 6=Informational, 7=Debugging. (Memory aid: "Every Almond Tree Blossoms Clearly With Seeds" / 0:Em, 1:Al, 2:Cr, 3:Err, 4:Warn, 5:Not, 6:Inf, 7:Dbg).',
    ciscoReference: 'Cisco CCNA 200-301 Official Cert Guide Vol 2, Ch 8: Device Management Protocols',
  },
  {
    id: 'q-5',
    domain: 'security_fundamentals',
    question:
      'A network administrator configures port security on an interface with "switchport port-security violation restrict". What occurs when an unauthorized host connects and sends traffic exceeding the maximum MAC limit?',
    options: [
      { id: 'A', text: 'The interface is immediately placed into the err-disabled state and an SNMP trap is sent.' },
      { id: 'B', text: 'Frames from unauthorized MACs are dropped, the violation counter increments, and a syslog/SNMP trap is generated.' },
      { id: 'C', text: 'Frames from unauthorized MACs are dropped silently without incrementing the violation counter.' },
      { id: 'D', text: 'Traffic is permitted but marked with DSCP CS1 background priority.' },
    ],
    correctOptionIds: ['B'],
    explanation:
      'Under "restrict" violation mode, frames with unauthorized MAC addresses are dropped, the security violation counter increments, and a syslog alert / SNMP trap is generated. In contrast, "protect" drops frames silently without sending traps, while "shutdown" puts the port into err-disabled.',
    ciscoReference: 'Cisco CCNA 200-301 Official Cert Guide Vol 2, Ch 6: Implementing Switch Port Security',
  },
  {
    id: 'q-6',
    domain: 'automation_programmability',
    question:
      'Which HTTP response status code indicates that a REST API request was received and processed successfully by a Cisco DNA Center controller, creating a new resource?',
    options: [
      { id: 'A', text: '200 OK' },
      { id: 'B', text: '201 Created' },
      { id: 'C', text: '204 No Content' },
      { id: 'D', text: '301 Moved Permanently' },
    ],
    correctOptionIds: ['B'],
    explanation:
      'HTTP status code 201 indicates "Created" — the request has succeeded and resulted in the creation of a new resource on the server. 200 indicates standard success, and 204 indicates success with no response payload.',
    ciscoReference: 'Cisco CCNA 200-301 Official Cert Guide Vol 2, Ch 18: Understanding REST and JSON',
  },
  {
    id: 'q-7',
    domain: 'ip_connectivity',
    question:
      'Two Cisco routers are connected on a multi-access broadcast Ethernet network running OSPFv2. Router R1 has a router priority of 100 and Router ID 2.2.2.2. Router R2 has a router priority of 50 and Router ID 9.9.9.9. Which router becomes the Designated Router (DR)?',
    options: [
      { id: 'A', text: 'Router R2 because it has the highest Router ID (9.9.9.9)' },
      { id: 'B', text: 'Router R1 because it has the higher OSPF interface priority (100 > 50)' },
      { id: 'C', text: 'Neither, OSPF requires identical priorities to establish adjacency' },
      { id: 'D', text: 'Both routers share DR status via round-robin election' },
    ],
    correctOptionIds: ['B'],
    explanation:
      'In OSPF DR/BDR elections on broadcast networks, the router with the highest OSPF interface priority wins the election (default is 1). The Router ID is only used as a tiebreaker if the priorities are equal. Because R1 has priority 100 while R2 has priority 50, R1 wins DR election.',
    ciscoReference: 'Cisco CCNA 200-301 Official Cert Guide Vol 1, Ch 21: OSPF Concepts',
  },
  {
    id: 'q-8',
    domain: 'network_fundamentals',
    question:
      'Which IPv6 address type is designated by the prefix fe80::/10 and is mandatory on all IPv6-enabled interfaces for neighbor discovery and next-hop routing?',
    options: [
      { id: 'A', text: 'Global Unicast Address (GUA)' },
      { id: 'B', text: 'Unique Local Address (ULA)' },
      { id: 'C', text: 'Link-Local Address (LLA)' },
      { id: 'D', text: 'Solicited-Node Multicast Address' },
    ],
    correctOptionIds: ['C'],
    explanation:
      'IPv6 Link-Local Addresses (LLA) reside in the fe80::/10 range (first 10 bits 1111 1110 10xx xxxx). They are non-routable beyond the local link and are required on every IPv6 interface for Neighbor Discovery Protocol (NDP) and dynamic routing protocol neighbor peering (e.g. OSPFv3).',
    ciscoReference: 'Cisco CCNA 200-301 Official Cert Guide Vol 1, Ch 24: Fundamentals of IPv6',
  },
];

export const SUBNETTING_SPEED_BANK = [
  { ip: '192.168.10.67', cidr: 26 },
  { ip: '10.50.128.45', cidr: 23 },
  { ip: '172.16.89.201', cidr: 27 },
  { ip: '192.168.1.130', cidr: 25 },
  { ip: '10.0.0.15', cidr: 29 },
  { ip: '172.20.14.70', cidr: 28 },
  { ip: '192.168.100.9', cidr: 30 },
  { ip: '10.10.10.125', cidr: 24 },
];

export const CHEAT_SHEET_DATA = {
  syslog: [
    { level: 0, name: 'Emergency', keyword: 'emergencies', description: 'System is completely unusable' },
    { level: 1, name: 'Alert', keyword: 'alerts', description: 'Immediate action needed' },
    { level: 2, name: 'Critical', keyword: 'critical', description: 'Critical conditions' },
    { level: 3, name: 'Error', keyword: 'errors', description: 'Error conditions' },
    { level: 4, name: 'Warning', keyword: 'warnings', description: 'Warning conditions' },
    { level: 5, name: 'Notification', keyword: 'notifications', description: 'Normal but significant condition' },
    { level: 6, name: 'Informational', keyword: 'informational', description: 'Informational messages' },
    { level: 7, name: 'Debugging', keyword: 'debugging', description: 'Detailed diagnostic output' },
  ],
  adminDistance: [
    { source: 'Connected Interface', distance: 0 },
    { source: 'Static Route', distance: 1 },
    { source: 'eBGP (External BGP)', distance: 20 },
    { source: 'EIGRP (Internal)', distance: 90 },
    { source: 'OSPF', distance: 110 },
    { source: 'IS-IS', distance: 115 },
    { source: 'RIP', distance: 120 },
    { source: 'EIGRP (External)', distance: 170 },
    { source: 'iBGP (Internal BGP)', distance: 200 },
    { source: 'Unusable / Unknown', distance: 255 },
  ],
  wellKnownPorts: [
    { port: '20 / 21', protocol: 'TCP', service: 'FTP (File Transfer Protocol)' },
    { port: '22', protocol: 'TCP', service: 'SSH (Secure Shell) & SFTP' },
    { port: '23', protocol: 'TCP', service: 'Telnet (Unencrypted remote terminal)' },
    { port: '25', protocol: 'TCP', service: 'SMTP (Simple Mail Transfer)' },
    { port: '53', protocol: 'UDP / TCP', service: 'DNS (Domain Name System)' },
    { port: '67 / 68', protocol: 'UDP', service: 'DHCP (Server: 67, Client: 68)' },
    { port: '69', protocol: 'UDP', service: 'TFTP (Trivial File Transfer Protocol)' },
    { port: '80', protocol: 'TCP', service: 'HTTP (Hypertext Transfer Protocol)' },
    { port: '110', protocol: 'TCP', service: 'POP3 (Post Office Protocol v3)' },
    { port: '123', protocol: 'UDP', service: 'NTP (Network Time Protocol)' },
    { port: '161 / 162', protocol: 'UDP', service: 'SNMP (Agent: 161, Trap: 162)' },
    { port: '443', protocol: 'TCP', service: 'HTTPS (HTTP over TLS/SSL)' },
  ],
  multicastIpv6: [
    { address: 'FF02::1', scope: 'All Nodes on local link' },
    { address: 'FF02::2', scope: 'All Routers on local link' },
    { address: 'FF02::5', scope: 'OSPFv3 All Routers' },
    { address: 'FF02::6', scope: 'OSPFv3 Designated Routers (DR/BDR)' },
    { address: 'FF02::1:FFxx:xxxx', scope: 'Solicited-Node Multicast (for NDP ARP)' },
  ],
};
