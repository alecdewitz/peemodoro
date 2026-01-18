import * as fs from 'fs';
import { LOCK_FILE, LOCK_TIMEOUT, PEEMODORO_DIR, STATE_FILE } from '../constants.js';
import { Badge, DEFAULT_CONFIG, PeeState, TimerConfig, TimerState, UserStats } from '../types.js';

function generateInstanceId(): string {
  return `pee-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

export class StateSync {
  private instanceId: string;
  private lockFd: number | null = null;
  private watchDebounce: ReturnType<typeof setTimeout> | null = null;
  private onStateChange?: (state: PeeState) => void;

  constructor() {
    this.instanceId = generateInstanceId();
    this.ensureDirectory();
  }

  private ensureDirectory(): void {
    if (!fs.existsSync(PEEMODORO_DIR)) {
      fs.mkdirSync(PEEMODORO_DIR, { recursive: true });
    }
  }

  private acquireLock(): boolean {
    try {
      // Try to create lock file exclusively
      this.lockFd = fs.openSync(LOCK_FILE, 'wx');
      fs.writeFileSync(LOCK_FILE, JSON.stringify({
        instanceId: this.instanceId,
        timestamp: Date.now(),
        pid: process.pid
      }));
      return true;
    } catch (err: any) {
      if (err.code === 'EEXIST') {
        // Lock exists, check if it's stale
        try {
          const lockData = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf-8'));
          if (Date.now() - lockData.timestamp > LOCK_TIMEOUT) {
            // Stale lock, remove and retry
            fs.unlinkSync(LOCK_FILE);
            return this.acquireLock();
          }
        } catch {
          // Corrupted lock file, remove and retry
          try {
            fs.unlinkSync(LOCK_FILE);
            return this.acquireLock();
          } catch {
            return false;
          }
        }
      }
      return false;
    }
  }

  private releaseLock(): void {
    try {
      if (this.lockFd !== null) {
        fs.closeSync(this.lockFd);
        this.lockFd = null;
      }
      if (fs.existsSync(LOCK_FILE)) {
        const lockData = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf-8'));
        if (lockData.instanceId === this.instanceId) {
          fs.unlinkSync(LOCK_FILE);
        }
      }
    } catch {
      // Ignore errors during cleanup
    }
  }

  getState(): PeeState {
    try {
      if (fs.existsSync(STATE_FILE)) {
        const data = fs.readFileSync(STATE_FILE, 'utf-8');
        const state = JSON.parse(data) as PeeState;

        // Calculate actual time remaining based on elapsed time
        if (state.timer.status === 'running' && state.timer.startedAt > 0) {
          const elapsedSeconds = Math.floor((Date.now() - state.timer.startedAt) / 1000);
          state.timer.timeRemaining = Math.max(0, state.config.workDuration - elapsedSeconds);
        } else if (state.timer.status === 'focus' && state.timer.startedAt > 0) {
          const elapsedSeconds = Math.floor((Date.now() - state.timer.startedAt) / 1000);
          state.timer.timeRemaining = Math.max(0, state.config.workDuration - elapsedSeconds);

          // Check if focus mode expired
          if (state.timer.focusUntil && Date.now() >= state.timer.focusUntil) {
            state.timer.status = 'running';
            state.timer.focusUntil = undefined;
          }
        }

        return state;
      }
    } catch {
      // Return default state if file is corrupted
    }
    return this.createDefaultState();
  }

  private createDefaultState(): PeeState {
    return {
      config: DEFAULT_CONFIG,
      timer: {
        status: 'paused',
        timeRemaining: DEFAULT_CONFIG.workDuration,
        cycleCount: 0,
        currentCycle: 1,
        startedAt: 0,
      },
      stats: {
        totalBreaks: 0,
        peeBreaks: 0,
        stretchBreaks: 0,
        skippedBreaks: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalFocusTime: 0,
        averageBreakInterval: DEFAULT_CONFIG.workDuration,
        lastActiveDate: new Date().toISOString().split('T')[0],
      },
      badges: [],
      instanceId: this.instanceId,
      lastUpdated: Date.now(),
    };
  }

  saveState(state: Partial<PeeState>): boolean {
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      if (this.acquireLock()) {
        try {
          const currentState = this.getState();
          const newState: PeeState = {
            ...currentState,
            ...state,
            instanceId: this.instanceId,
            lastUpdated: Date.now(),
          };
          fs.writeFileSync(STATE_FILE, JSON.stringify(newState, null, 2));
          return true;
        } finally {
          this.releaseLock();
        }
      }
      retries++;
    }
    return false;
  }

  updateTimer(timer: Partial<TimerState>): boolean {
    const state = this.getState();
    return this.saveState({
      timer: { ...state.timer, ...timer },
    });
  }

  updateConfig(config: Partial<TimerConfig>): boolean {
    const state = this.getState();
    return this.saveState({
      config: { ...state.config, ...config },
    });
  }

  updateStats(stats: Partial<UserStats>): boolean {
    const state = this.getState();
    return this.saveState({
      stats: { ...state.stats, ...stats },
    });
  }

  addBadge(badge: Badge): boolean {
    const state = this.getState();
    const existingIndex = state.badges.findIndex(b => b.id === badge.id);
    if (existingIndex >= 0) {
      state.badges[existingIndex] = badge;
    } else {
      state.badges.push(badge);
    }
    return this.saveState({ badges: state.badges });
  }

  watchState(callback: (state: PeeState) => void): void {
    this.onStateChange = callback;

    fs.watchFile(STATE_FILE, { interval: 500 }, () => {
      // Debounce rapid changes
      if (this.watchDebounce) {
        clearTimeout(this.watchDebounce);
      }
      this.watchDebounce = setTimeout(() => {
        const state = this.getState();
        // Only notify if another instance made the change
        if (state.instanceId !== this.instanceId) {
          this.onStateChange?.(state);
        }
      }, 100);
    });
  }

  unwatchState(): void {
    fs.unwatchFile(STATE_FILE);
    if (this.watchDebounce) {
      clearTimeout(this.watchDebounce);
    }
  }

  getInstanceId(): string {
    return this.instanceId;
  }

  isLeader(): boolean {
    const state = this.getState();
    return state.instanceId === this.instanceId;
  }

  claimLeadership(): boolean {
    return this.saveState({ instanceId: this.instanceId });
  }

  cleanup(): void {
    this.unwatchState();
    this.releaseLock();
  }
}

export const stateSync = new StateSync();
