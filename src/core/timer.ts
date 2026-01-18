import { MODE_PRESETS, TimerConfig, TimerState, URGENCY_THRESHOLDS, UrgencyLevel } from '../types.js';

export class PeemodoroTimer {
  private config: TimerConfig;
  private state: TimerState;
  private intervalId?: ReturnType<typeof setInterval>;
  private onTick?: (state: TimerState) => void;
  private onBreakTime?: () => void;
  private onUrgencyChange?: (level: UrgencyLevel) => void;

  constructor(config: TimerConfig) {
    this.config = config;
    this.state = this.createInitialState();
  }

  private createInitialState(): TimerState {
    return {
      status: 'paused',
      timeRemaining: this.config.workDuration,
      cycleCount: 0,
      currentCycle: 1,
      startedAt: 0,
    };
  }

  start(): void {
    if (this.state.status === 'running') return;

    this.state.status = 'running';
    this.state.startedAt = Date.now();

    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  pause(): void {
    if (this.state.status !== 'running') return;
    this.state.status = 'paused';
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  resume(): void {
    if (this.state.status !== 'paused') return;
    this.start();
  }

  reset(): void {
    this.pause();
    this.state = this.createInitialState();
  }

  enterFocusMode(durationMinutes?: number): void {
    const duration = durationMinutes
      ? Math.min(durationMinutes * 60, this.config.focusMaxDuration)
      : this.config.focusMaxDuration;

    this.state.status = 'focus';
    this.state.focusUntil = Date.now() + (duration * 1000);
  }

  exitFocusMode(): void {
    if (this.state.status !== 'focus') return;
    this.state.status = 'running';
    this.state.focusUntil = undefined;
  }

  snooze(minutes: number = 5): void {
    this.state.timeRemaining = minutes * 60;
    if (this.state.status === 'break') {
      this.state.status = 'running';
    }
  }

  startBreak(): void {
    this.pause();
    this.state.status = 'break';
    const isLongBreak = this.state.currentCycle >= this.config.cyclesBeforeLongBreak;
    this.state.timeRemaining = isLongBreak
      ? this.config.longBreakDuration
      : this.config.breakDuration;
    this.state.lastBreakAt = Date.now();
    this.onBreakTime?.();
  }

  endBreak(): void {
    this.state.cycleCount++;
    this.state.currentCycle = (this.state.currentCycle % this.config.cyclesBeforeLongBreak) + 1;
    this.state.timeRemaining = this.config.workDuration;
    this.state.status = 'paused';
  }

  private tick(): void {
    // Check if focus mode has expired
    if (this.state.status === 'focus' && this.state.focusUntil) {
      if (Date.now() >= this.state.focusUntil) {
        this.exitFocusMode();
      }
    }

    if (this.state.status === 'running' || this.state.status === 'focus') {
      const previousUrgency = this.getUrgencyLevel();
      this.state.timeRemaining = Math.max(0, this.state.timeRemaining - 1);
      const currentUrgency = this.getUrgencyLevel();

      if (previousUrgency !== currentUrgency) {
        this.onUrgencyChange?.(currentUrgency);
      }

      this.onTick?.(this.state);

      // Timer expired - time for break
      if (this.state.timeRemaining <= 0 && this.state.status === 'running') {
        this.startBreak();
      }
    }
  }

  getUrgencyLevel(): UrgencyLevel {
    if (this.state.timeRemaining <= 0) return 4;

    const percentRemaining = this.state.timeRemaining / this.config.workDuration;

    if (percentRemaining > URGENCY_THRESHOLDS[2]) return 1;
    if (percentRemaining > URGENCY_THRESHOLDS[3]) return 2;
    if (percentRemaining > URGENCY_THRESHOLDS[4]) return 3;
    return 4;
  }

  getState(): TimerState {
    return { ...this.state };
  }

  getConfig(): TimerConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<TimerConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  applyModePreset(mode: keyof typeof MODE_PRESETS): void {
    const preset = MODE_PRESETS[mode];
    this.config = { ...this.config, ...preset, mode };
  }

  setState(state: Partial<TimerState>): void {
    this.state = { ...this.state, ...state };
  }

  onTickCallback(callback: (state: TimerState) => void): void {
    this.onTick = callback;
  }

  onBreakTimeCallback(callback: () => void): void {
    this.onBreakTime = callback;
  }

  onUrgencyChangeCallback(callback: (level: UrgencyLevel) => void): void {
    this.onUrgencyChange = callback;
  }

  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
