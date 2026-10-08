export type GradeLevel = 'grade3-5' | 'grade6-8';

export interface StudentProfile {
  name: string;
  grade: GradeLevel;
  avatar: string;
  xp: number;
  streak: number;
  completedLessons: string[];
  typingBestWpm: number;
  unlockedBadges: string[];
}

export type NavTab = 'coding' | 'typing' | 'citizenship' | 'hardware' | 'certificate';

// Coding Types
export type CommandType =
  | 'move_forward'
  | 'turn_left'
  | 'turn_right'
  | 'collect_crystal'
  | 'repeat_start'
  | 'repeat_end'
  | 'if_obstacle'
  | 'else_branch';

export interface CodeBlock {
  id: string;
  type: CommandType;
  label: string;
  color: string;
  repeatCount?: number;
}

export interface GridItem {
  x: number;
  y: number;
  type: 'wall' | 'crystal' | 'portal' | 'switch' | 'gate';
}

export interface CodingChallenge {
  id: string;
  title: string;
  grade: GradeLevel;
  concept: string;
  description: string;
  gridSize: { width: number; height: number };
  startPos: { x: number; y: number; dir: 'up' | 'down' | 'left' | 'right' };
  items: GridItem[];
  availableBlocks: CommandType[];
  starterBlocks?: CodeBlock[];
  idealBlockCount: number;
  pythonSyntaxPreview: string;
  hint: string;
}

// Typing Types
export type TypingCategory = 'home_row' | 'top_bottom' | 'sentences' | 'code_syntax' | 'asteroid_game';

export interface TypingLesson {
  id: string;
  title: string;
  category: TypingCategory;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  text: string;
  description: string;
}

// Digital Citizenship Types
export interface PhishingEmail {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  date: string;
  content: string;
  isPhishing: boolean;
  redFlags: string[];
  educationalTakeaway: string;
}

export interface PrivacyItem {
  id: string;
  title: string;
  example: string;
  isSafeToSharePublicly: boolean;
  explanation: string;
}

export interface DilemmaChoice {
  text: string;
  isBestPractice: boolean;
  feedback: string;
  impactScore: number;
}

export interface UpstanderDilemma {
  id: string;
  title: string;
  scenario: string;
  context: string;
  choices: DilemmaChoice[];
}

// Hardware Types
export interface HardwareComponent {
  id: string;
  name: string;
  category: 'core' | 'memory' | 'display' | 'power' | 'system';
  role: string;
  realWorldAnalogy: string;
  whatHappensWithoutIt: string;
  funFact: string;
}

export interface DeviceSortingItem {
  id: string;
  name: string;
  category: 'input' | 'output' | 'storage';
  description: string;
}
