import chalk from 'chalk';
import { TimerConfig, TimerState, UrgencyLevel } from '../types.js';
import { applyGradientColor, renderGradientProgressBar } from './colors.js';

const FOCUS_EMOJI = '🎯';
const BREAK_EMOJI = '🚽';

/**
 * Gets urgency emoji based on percent remaining.
 * Bladder-themed progression: 💧 → 💦 → 😅 → 😰 → 🫠 → 🆘 → 🚽
 *
 * For a 45-minute session:
 * 💧 100-60%  (0-18 min)    - Fresh, hydrated
 * 💦 60-40%   (18-27 min)   - Starting to feel it
 * 😅 40-25%   (27-34 min)   - Getting uncomfortable
 * 😰 25-15%   (34-38 min)   - Anxious, really need to go
 * 🫠 15-3.3%  (38-43.5 min) - Melting
 * 🆘 <1:30   (last 90 sec)  - SOS! Emergency!
 * 🚽 0% (overdue)           - TIME TO PEE!
 */
function getUrgencyEmoji(percentRemaining: number, timeRemaining: number): string {
  if (percentRemaining <= 0) return '🚽';
  if (timeRemaining <= 90) return '🆘';  // Last 1:30
  if (percentRemaining <= 0.15) return '🫠';
  if (percentRemaining <= 0.25) return '😰';
  if (percentRemaining <= 0.40) return '😅';
  if (percentRemaining <= 0.60) return '💦';
  return '💧';
}

export class StatuslineRenderer {
  private blinkState = false;
  private blinkInterval?: ReturnType<typeof setInterval>;

  constructor() {
    // Start blink animation for critical states
    // Use unref() so this doesn't prevent Node from exiting
    this.blinkInterval = setInterval(() => {
      this.blinkState = !this.blinkState;
    }, 500);
    this.blinkInterval.unref();
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    const sign = seconds < 0 ? '-' : '';
    return `${sign}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  renderProgressBar(timeRemaining: number, totalTime: number, width: number = 8): string {
    // Drain down: full when fresh, empty when time's up
    const percentRemaining = Math.max(0, Math.min(1, timeRemaining / totalTime));
    const filled = Math.round(percentRemaining * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  getUrgencyLevel(timeRemaining: number, totalTime: number): UrgencyLevel {
    if (timeRemaining <= 0) return 4;
    const percentRemaining = timeRemaining / totalTime;
    if (percentRemaining > 0.75) return 1;
    if (percentRemaining > 0.25) return 2;
    if (percentRemaining > 0) return 3;
    return 4;
  }

  colorize(text: string, urgency: UrgencyLevel, isFocus: boolean = false, percentRemaining?: number): string {
    if (isFocus) {
      return chalk.gray(text);
    }

    // Use smooth gradient coloring when percentRemaining is provided
    if (percentRemaining !== undefined) {
      // For critical/overdue state, add pulsing effect
      if (urgency === 4) {
        const colored = applyGradientColor(text, percentRemaining);
        return this.blinkState ? chalk.bold(colored) : colored;
      }
      return applyGradientColor(text, percentRemaining);
    }

    // Fallback to discrete colors
    switch (urgency) {
      case 1:
        return chalk.green(text);
      case 2:
        return chalk.yellow(text);
      case 3:
        return chalk.hex('#FFA500')(text); // orange
      case 4:
        // Pulsing red for critical
        return this.blinkState ? chalk.red.bold(text) : chalk.redBright(text);
      default:
        return text;
    }
  }

  renderWorkMode(state: TimerState, config: TimerConfig, _streak?: number): string {
    const urgency = this.getUrgencyLevel(state.timeRemaining, config.workDuration);
    const percentRemaining = state.timeRemaining / config.workDuration;
    const isFocus = state.status === 'focus';

    const urgencyEmoji = isFocus ? FOCUS_EMOJI : getUrgencyEmoji(percentRemaining, state.timeRemaining);
    const time = this.formatTime(state.timeRemaining);

    // Use gradient progress bar for smooth color transitions (drains down)
    const progress = isFocus
      ? chalk.gray(this.renderProgressBar(state.timeRemaining, config.workDuration))
      : renderGradientProgressBar(percentRemaining);

    let statusText = '';

    if (state.timeRemaining <= 0) {
      statusText = 'TIME TO PEE';
    } else {
      statusText = time;
    }

    // Build the statusline
    // Format: emoji time progress
    return `${urgencyEmoji} ${this.colorize(statusText, urgency, isFocus, percentRemaining)} ${progress}`;
  }

  renderBreakMode(timeRemaining: number, breakDuration: number): string {
    const time = this.formatTime(timeRemaining);
    const progress = this.renderProgressBar(breakDuration - timeRemaining, breakDuration);
    return chalk.cyan(`${BREAK_EMOJI} BREAK ${time} ${progress}`);
  }

  renderPaused(): string {
    return chalk.gray(`💧 PAUSED`);
  }

  render(state: TimerState, config: TimerConfig, streak?: number): string {
    switch (state.status) {
      case 'running':
      case 'focus':
        return this.renderWorkMode(state, config, streak);
      case 'break':
        return this.renderBreakMode(state.timeRemaining, config.breakDuration);
      case 'paused':
        return this.renderPaused();
      default:
        return '';
    }
  }

  // Compact version for tight spaces
  renderCompact(state: TimerState, config: TimerConfig): string {
    const urgency = this.getUrgencyLevel(state.timeRemaining, config.workDuration);
    const percentRemaining = state.timeRemaining / config.workDuration;
    const time = this.formatTime(state.timeRemaining);

    if (state.status === 'break') {
      return chalk.cyan(`${BREAK_EMOJI} ${time}`);
    }
    if (state.status === 'paused') {
      return chalk.gray(`💧 PAUSED`);
    }
    if (state.status === 'focus') {
      return chalk.gray(`${FOCUS_EMOJI} ${time}`);
    }

    const emoji = getUrgencyEmoji(percentRemaining, state.timeRemaining);
    const statusText = state.timeRemaining <= 0 ? 'TIME TO PEE' : time;
    return `${emoji} ${this.colorize(statusText, urgency, false, percentRemaining)}`;
  }

  // For Claude Code statusline integration - returns plain object
  toStatuslineConfig(state: TimerState, config: TimerConfig, streak?: number): {
    text: string;
    color?: string;
    priority?: number;
  } {
    const urgency = this.getUrgencyLevel(state.timeRemaining, config.workDuration);

    let color: string;
    switch (urgency) {
      case 1: color = 'green'; break;
      case 2: color = 'yellow'; break;
      case 3: color = 'orange'; break;
      case 4: color = 'red'; break;
      default: color = 'gray';
    }

    if (state.status === 'focus') {
      color = 'gray';
    } else if (state.status === 'break') {
      color = 'cyan';
    }

    return {
      text: this.render(state, config, streak),
      color,
      priority: state.status === 'break' || urgency >= 3 ? 100 : 50,
    };
  }

  destroy(): void {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
    }
  }
}

export const statuslineRenderer = new StatuslineRenderer();
