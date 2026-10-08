import { TypingLesson } from '../types';

export const KEY_FINGER_MAP: Record<string, { hand: 'left' | 'right'; finger: 'pinky' | 'ring' | 'middle' | 'index' | 'thumb'; color: string }> = {
  // Left Pinky
  '`': { hand: 'left', finger: 'pinky', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  '1': { hand: 'left', finger: 'pinky', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  'q': { hand: 'left', finger: 'pinky', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  'a': { hand: 'left', finger: 'pinky', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  'z': { hand: 'left', finger: 'pinky', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },

  // Left Ring
  '2': { hand: 'left', finger: 'ring', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  'w': { hand: 'left', finger: 'ring', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  's': { hand: 'left', finger: 'ring', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  'x': { hand: 'left', finger: 'ring', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },

  // Left Middle
  '3': { hand: 'left', finger: 'middle', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  'e': { hand: 'left', finger: 'middle', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  'd': { hand: 'left', finger: 'middle', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  'c': { hand: 'left', finger: 'middle', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },

  // Left Index
  '4': { hand: 'left', finger: 'index', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  '5': { hand: 'left', finger: 'index', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  'r': { hand: 'left', finger: 'index', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  't': { hand: 'left', finger: 'index', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  'f': { hand: 'left', finger: 'index', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  'g': { hand: 'left', finger: 'index', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  'v': { hand: 'left', finger: 'index', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  'b': { hand: 'left', finger: 'index', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },

  // Thumbs
  ' ': { hand: 'left', finger: 'thumb', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },

  // Right Index
  '6': { hand: 'right', finger: 'index', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  '7': { hand: 'right', finger: 'index', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  'y': { hand: 'right', finger: 'index', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  'u': { hand: 'right', finger: 'index', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  'h': { hand: 'right', finger: 'index', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  'j': { hand: 'right', finger: 'index', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  'n': { hand: 'right', finger: 'index', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  'm': { hand: 'right', finger: 'index', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },

  // Right Middle
  '8': { hand: 'right', finger: 'middle', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  'i': { hand: 'right', finger: 'middle', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  'k': { hand: 'right', finger: 'middle', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  ',': { hand: 'right', finger: 'middle', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  '<': { hand: 'right', finger: 'middle', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },

  // Right Ring
  '9': { hand: 'right', finger: 'ring', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
  'o': { hand: 'right', finger: 'ring', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
  'l': { hand: 'right', finger: 'ring', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
  '.': { hand: 'right', finger: 'ring', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
  '>': { hand: 'right', finger: 'ring', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },

  // Right Pinky
  '0': { hand: 'right', finger: 'pinky', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  '-': { hand: 'right', finger: 'pinky', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  '=': { hand: 'right', finger: 'pinky', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  'p': { hand: 'right', finger: 'pinky', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  '[': { hand: 'right', finger: 'pinky', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  ']': { hand: 'right', finger: 'pinky', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  ';': { hand: 'right', finger: 'pinky', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  ':': { hand: 'right', finger: 'pinky', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  '\'': { hand: 'right', finger: 'pinky', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  '/': { hand: 'right', finger: 'pinky', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
};

export const TYPING_LESSONS: TypingLesson[] = [
  {
    id: 'type-home-1',
    title: 'Home Row Anchor (asdf jkl;)',
    category: 'home_row',
    difficulty: 'Beginner',
    description: 'Keep index fingers resting on F and J bumps. Use individual fingers without moving your wrists.',
    text: 'asdf jkl; asdf jkl; a fad as dad ask lads fall flasks salsa salads',
  },
  {
    id: 'type-home-2',
    title: 'Home Row Words & Rhythm',
    category: 'home_row',
    difficulty: 'Beginner',
    description: 'Build natural finger coordination with common home row words.',
    text: 'all fall half flash salads flask glad fall alas dash asks glass',
  },
  {
    id: 'type-top-bottom',
    title: 'Reaching Up & Down (E, I, R, U, C, N)',
    category: 'top_bottom',
    difficulty: 'Intermediate',
    description: 'Reach up to the top row and drop down to the bottom row, then return to home row.',
    text: 'red run car fun cue ice out net sun pet tree blue bird run code fast',
  },
  {
    id: 'type-sentences-1',
    title: 'Digital Citizenship Quick Facts',
    category: 'sentences',
    difficulty: 'Intermediate',
    description: 'Practice real-world typing with foundational computer wisdom.',
    text: 'Computers think in binary code of zeros and ones. Always think before posting anything online.',
  },
  {
    id: 'type-sentences-2',
    title: 'Middle School Cyber Explorer',
    category: 'sentences',
    difficulty: 'Intermediate',
    description: 'Speed training with realistic tech concepts and punctuation.',
    text: 'A strong passphrase contains multiple unrelated words. Protect your digital footprint with care.',
  },
  {
    id: 'type-code-1',
    title: 'Coder Brackets & Punctuation',
    category: 'code_syntax',
    difficulty: 'Advanced',
    description: 'Essential muscle memory for young coders: brackets, semicolons, and curly braces.',
    text: 'let score = 100; if (score >= 50) { levelUp(); }',
  },
  {
    id: 'type-code-2',
    title: 'Python & JavaScript Syntax Drill',
    category: 'code_syntax',
    difficulty: 'Advanced',
    description: 'Master symbols like arrows, equals, brackets, and quotes without looking down.',
    text: 'for (let i = 0; i < 5; i++) { console.log("Rover at: " + i); }',
  },
];

export const ASTEROID_WORDS = [
  'pixel', 'byte', 'code', 'data', 'loop', 'logic', 'cpu', 'ram',
  'cyber', 'shield', 'input', 'cloud', 'array', 'debug', 'click',
  'robot', 'safety', 'router', 'server', 'hacker', 'binary', 'mouse',
  'screen', 'sensor', 'switch', 'memory', 'device', 'python', 'script'
];
