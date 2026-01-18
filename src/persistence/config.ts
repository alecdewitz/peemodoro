import * as fs from 'fs';
import { CONFIG_FILE, PEEMODORO_DIR } from '../constants.js';
import { DEFAULT_CONFIG, MODE_PRESETS, TimerConfig, TimerMode } from '../types.js';

export interface PeemodoroConfig extends TimerConfig {
  // UI preferences
  showProgressBar: boolean;
  showMoodEmoji: boolean;
  showStreak: boolean;
  compactMode: boolean;

  // Notification preferences
  desktopNotifications: boolean;
  soundEnabled: boolean;
  soundVolume: number; // 0-100

  // Adaptive mode settings
  adaptiveLearningEnabled: boolean;
  minWorkDuration: number; // minimum work duration for adaptive mode
  maxWorkDuration: number; // maximum work duration for adaptive mode

  // Easter egg tracking (don't show to user)
  konamiUnlocked: boolean;
  secretTheme: string | null;
}

const DEFAULT_FULL_CONFIG: PeemodoroConfig = {
  ...DEFAULT_CONFIG,

  // UI preferences
  showProgressBar: true,
  showMoodEmoji: true,
  showStreak: true,
  compactMode: false,

  // Notification preferences
  desktopNotifications: true,
  soundEnabled: true,
  soundVolume: 50,

  // Adaptive mode settings
  adaptiveLearningEnabled: true,
  minWorkDuration: 20 * 60, // 20 minutes
  maxWorkDuration: 90 * 60, // 90 minutes

  // Easter eggs
  konamiUnlocked: false,
  secretTheme: null,
};

export class ConfigManager {
  private config: PeemodoroConfig;

  constructor() {
    this.ensureDirectory();
    this.config = this.load();
  }

  private ensureDirectory(): void {
    if (!fs.existsSync(PEEMODORO_DIR)) {
      fs.mkdirSync(PEEMODORO_DIR, { recursive: true });
    }
  }

  private load(): PeemodoroConfig {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
        const loaded = JSON.parse(data);
        // Merge with defaults to handle new config options
        return { ...DEFAULT_FULL_CONFIG, ...loaded };
      }
    } catch {
      // Return defaults on any error
    }
    return { ...DEFAULT_FULL_CONFIG };
  }

  save(): void {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2));
  }

  get<K extends keyof PeemodoroConfig>(key: K): PeemodoroConfig[K] {
    return this.config[key];
  }

  set<K extends keyof PeemodoroConfig>(key: K, value: PeemodoroConfig[K]): void {
    this.config[key] = value;
    this.save();
  }

  update(updates: Partial<PeemodoroConfig>): void {
    this.config = { ...this.config, ...updates };
    this.save();
  }

  getAll(): PeemodoroConfig {
    return { ...this.config };
  }

  setMode(mode: TimerMode): void {
    const preset = MODE_PRESETS[mode];
    this.update({ ...preset, mode });
  }

  reset(): void {
    this.config = { ...DEFAULT_FULL_CONFIG };
    this.save();
  }

  // Get timer-specific config
  getTimerConfig(): TimerConfig {
    return {
      mode: this.config.mode,
      workDuration: this.config.workDuration,
      breakDuration: this.config.breakDuration,
      longBreakDuration: this.config.longBreakDuration,
      cyclesBeforeLongBreak: this.config.cyclesBeforeLongBreak,
      soundEnabled: this.config.soundEnabled,
      focusMaxDuration: this.config.focusMaxDuration,
    };
  }

  // Easter egg methods
  unlockKonami(): void {
    if (!this.config.konamiUnlocked) {
      this.config.konamiUnlocked = true;
      this.save();
    }
  }

  isKonamiUnlocked(): boolean {
    return this.config.konamiUnlocked;
  }

  setSecretTheme(theme: string | null): void {
    this.config.secretTheme = theme;
    this.save();
  }

  getSecretTheme(): string | null {
    return this.config.secretTheme;
  }
}

// Singleton instance
let configInstance: ConfigManager | null = null;

export function getConfig(): ConfigManager {
  if (!configInstance) {
    configInstance = new ConfigManager();
  }
  return configInstance;
}

export { DEFAULT_FULL_CONFIG };
