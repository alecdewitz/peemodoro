export type TimerMode = 'classic' | 'hydration' | 'adaptive';
export type UrgencyLevel = 1 | 2 | 3 | 4;
export type TimerStatus = 'running' | 'break' | 'paused' | 'focus';
export type BreakType = 'pee' | 'stretch' | 'skip';

export interface TimerConfig {
  mode: TimerMode;
  workDuration: number; // in seconds
  breakDuration: number; // in seconds
  longBreakDuration: number; // in seconds
  cyclesBeforeLongBreak: number;
  soundEnabled: boolean;
  focusMaxDuration: number; // in seconds (default 90 mins)
}

export interface TimerState {
  status: TimerStatus;
  timeRemaining: number; // in seconds
  cycleCount: number;
  currentCycle: number;
  startedAt: number; // timestamp
  focusUntil?: number; // timestamp when focus mode expires
  lastBreakAt?: number;
  breakReminderAt?: number; // timestamp when break reminder was first shown
  breakStartedAt?: number; // timestamp when break mode started
  currentSnoozeCount?: number; // snooze count for the current break cycle
}

export interface UserStats {
  totalBreaks: number;
  peeBreaks: number;
  stretchBreaks: number;
  skippedBreaks: number;
  currentStreak: number;
  longestStreak: number;
  totalFocusTime: number; // in seconds
  averageBreakInterval: number; // learned from adaptive mode
  lastActiveDate: string; // YYYY-MM-DD
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'milestone' | 'behavior' | 'humor' | 'secret';
  unlockedAt?: number;
  progress?: number; // 0-100 for badges with progress
  requirement: number; // threshold to unlock
  hidden?: boolean; // for secret badges
}

export interface BreakRecord {
  id: number;
  timestamp: number;
  type: BreakType;
  duration: number; // how long the break lasted
  snoozed: boolean;
  snoozeCount: number;
}

export interface HydrationTip {
  tip: string;
  emoji: string;
}

export interface PeeState {
  config: TimerConfig;
  timer: TimerState;
  stats: UserStats;
  badges: Badge[];
  instanceId: string; // unique ID for this terminal instance
  lastUpdated: number;
}

export const DEFAULT_CONFIG: TimerConfig = {
  mode: 'hydration',
  workDuration: 45 * 60, // 45 minutes
  breakDuration: 10 * 60, // 10 minutes
  longBreakDuration: 20 * 60, // 20 minutes
  cyclesBeforeLongBreak: 4,
  soundEnabled: true,
  focusMaxDuration: 90 * 60, // 90 minutes
};

export const MODE_PRESETS: Record<TimerMode, Partial<TimerConfig>> = {
  classic: {
    workDuration: 25 * 60,
    breakDuration: 5 * 60,
    longBreakDuration: 15 * 60,
    cyclesBeforeLongBreak: 4,
  },
  hydration: {
    workDuration: 45 * 60,
    breakDuration: 10 * 60,
    longBreakDuration: 20 * 60,
    cyclesBeforeLongBreak: 4,
  },
  adaptive: {
    workDuration: 45 * 60, // starts as hydration, adapts over time
    breakDuration: 10 * 60,
    longBreakDuration: 20 * 60,
    cyclesBeforeLongBreak: 4,
  },
};

export const URGENCY_THRESHOLDS = {
  1: 1.0,    // 100% - 75% time remaining: fresh
  2: 0.75,   // 75% - 25% time remaining: building
  3: 0.25,   // 25% - 0% time remaining: urgent
  4: 0,      // overdue: critical
};
