import chalk from 'chalk';
import { BADGE_DEFINITIONS, BadgeSystem, formatBadgeUnlock } from '../core/badges.js';
import { stateSync } from '../core/state-sync.js';
import { getConfig } from '../persistence/config.js';
import { getDatabase } from '../persistence/database.js';
import { BreakType, MODE_PRESETS, TimerMode } from '../types.js';
import { breakScreen } from '../ui/break-screen.js';
import { HintManager } from '../ui/hints.js';
import { getBreakCompleteMessage, getFocusModeMessage, getReminderMessage, getReminderWithHint, getSnoozeMessage, getStreakMessage } from '../ui/messages.js';
import { statuslineRenderer } from '../ui/statusline.js';

export class PeemodoroCommands {
  private db = getDatabase();
  private config = getConfig();
  private badgeSystem: BadgeSystem;

  constructor() {
    const savedBadges = this.db.getBadges();
    // Merge saved badge progress with definitions using database as source of truth
    const mergedBadges = BADGE_DEFINITIONS.map(def => {
      const saved = savedBadges.find(s => s.id === def.id);
      if (saved) {
        return {
          ...def,
          unlockedAt: saved.unlockedAt || undefined,
          progress: saved.progress || 0
        };
      }
      return { ...def, progress: 0 };
    });
    this.badgeSystem = new BadgeSystem(mergedBadges);
  }

  // /pee command - Log a break
  async pee(type: BreakType = 'pee'): Promise<string> {
    const state = stateSync.getState();
    // Use breakReminderAt for accurate response time, fallback to lastBreakAt or startedAt
    const breakStartTime = state.timer.breakReminderAt || state.timer.lastBreakAt || state.timer.startedAt || Date.now();
    const duration = Math.floor((Date.now() - breakStartTime) / 1000);

    // Get snooze tracking data
    const snoozeCount = state.timer.currentSnoozeCount || 0;
    const wasSnoozed = snoozeCount > 0;

    // Record the break with snooze data
    this.db.recordBreak(type, duration, wasSnoozed, snoozeCount);

    // Record mode usage for Camel Mode badge tracking
    const currentMode = state.config.mode;
    this.db.recordModeUsage(currentMode);

    // Update stats and check badges (use more records for multi-day badge tracking)
    const stats = this.db.getStats();
    const breaks = this.db.getBreaks(500);
    const hydrationDays = this.db.getHydrationModeDays();
    const newBadges = this.badgeSystem.checkAndUnlock(stats, breaks, hydrationDays);

    // Save badge progress
    for (const badge of this.badgeSystem.getAllBadges()) {
      this.db.saveBadge(badge);
    }

    // Reset timer for next cycle and clear snooze tracking
    stateSync.updateTimer({
      status: 'running',
      timeRemaining: state.config.workDuration,
      startedAt: Date.now(), // Reset startedAt so elapsed time calculates correctly
      cycleCount: state.timer.cycleCount + 1,
      currentSnoozeCount: 0, // Reset snooze count for next cycle
      breakReminderAt: undefined, // Clear break reminder timestamp
    });
    stateSync.updateStats(stats);

    // Build response
    let response = getBreakCompleteMessage() + '\n';

    // Check for streak milestones
    const streakMsg = getStreakMessage(stats.currentStreak);
    if (streakMsg) {
      response += '\n' + streakMsg + '\n';
    }

    // Show any new badges
    for (const badge of newBadges) {
      response += '\n' + formatBadgeUnlock(badge);
    }

    return response;
  }

  // /peemodoro-stats command
  stats(): string {
    const stats = this.db.getStats();
    const unlockedBadges = this.badgeSystem.getUnlockedBadges();
    const nextBadges = this.badgeSystem.getNextBadges(3);

    const lines: string[] = [
      chalk.cyan.bold('\n📊 Peemodoro Stats\n'),
      chalk.white(`🚽 Total Breaks: ${stats.totalBreaks}`),
      chalk.white(`   💧 Pee breaks: ${stats.peeBreaks}`),
      chalk.white(`   🧘 Stretch breaks: ${stats.stretchBreaks}`),
      chalk.white(`   ⏭️  Skipped: ${stats.skippedBreaks}`),
      '',
      chalk.white(`🔥 Current Streak: ${stats.currentStreak} days`),
      chalk.white(`🏆 Longest Streak: ${stats.longestStreak} days`),
      chalk.white(`🎯 Total Focus Time: ${Math.floor(stats.totalFocusTime / 3600)}h ${Math.floor((stats.totalFocusTime % 3600) / 60)}m`),
      '',
      chalk.yellow.bold(`🏅 Badges Unlocked: ${unlockedBadges.length}`),
    ];

    if (unlockedBadges.length > 0) {
      const badgeEmojis = unlockedBadges.map(b => b.emoji).join(' ');
      lines.push(chalk.white(`   ${badgeEmojis}`));
    }

    if (nextBadges.length > 0) {
      lines.push('');
      lines.push(chalk.magenta.bold('📈 Next Badges:'));
      for (const badge of nextBadges) {
        const progress = badge.progress || 0;
        const bar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));
        lines.push(chalk.white(`   ${badge.emoji} ${badge.name}: [${bar}] ${Math.round(progress)}%`));
      }
    }

    return lines.join('\n') + '\n';
  }

  // /peemodoro-config command
  showConfig(): string {
    const config = this.config.getAll();
    const modeNames: Record<TimerMode, string> = {
      classic: 'Classic Pomodoro (25/5)',
      hydration: 'Hydration Mode (45/10)',
      adaptive: 'Adaptive Mode',
    };

    const lines: string[] = [
      chalk.cyan.bold('\n⚙️  Peemodoro Configuration\n'),
      chalk.white(`📋 Mode: ${modeNames[config.mode]}`),
      chalk.white(`⏱️  Work Duration: ${config.workDuration / 60} minutes`),
      chalk.white(`☕ Break Duration: ${config.breakDuration / 60} minutes`),
      chalk.white(`🛋️  Long Break: ${config.longBreakDuration / 60} minutes`),
      chalk.white(`🔄 Cycles before long break: ${config.cyclesBeforeLongBreak}`),
      '',
      chalk.yellow.bold('Display:'),
      chalk.white(`   Progress bar: ${config.showProgressBar ? '✓' : '✗'}`),
      chalk.white(`   Mood emoji: ${config.showMoodEmoji ? '✓' : '✗'}`),
      chalk.white(`   Streak counter: ${config.showStreak ? '✓' : '✗'}`),
      '',
      chalk.yellow.bold('Notifications:'),
      chalk.white(`   Desktop: ${config.desktopNotifications ? '✓' : '✗'}`),
      chalk.white(`   Sound: ${config.soundEnabled ? '✓' : '✗'}`),
      '',
      chalk.gray('Use "peemodoro config set <key> <value>" to change settings'),
    ];

    return lines.join('\n') + '\n';
  }

  setConfig(key: string, value: string): string {
    const config = this.config;

    switch (key) {
      case 'mode':
        if (['classic', 'hydration', 'adaptive'].includes(value)) {
          config.setMode(value as TimerMode);
          // Also update the running timer's work duration
          const preset = MODE_PRESETS[value as TimerMode];
          stateSync.updateConfig(preset);
          return chalk.green(`✓ Mode set to ${value}`);
        }
        return chalk.red('Invalid mode. Use: classic, hydration, or adaptive');

      case 'sound':
        config.set('soundEnabled', value === 'true' || value === 'on');
        return chalk.green(`✓ Sound ${config.get('soundEnabled') ? 'enabled' : 'disabled'}`);

      case 'notifications':
        config.set('desktopNotifications', value === 'true' || value === 'on');
        return chalk.green(`✓ Desktop notifications ${config.get('desktopNotifications') ? 'enabled' : 'disabled'}`);

      case 'work':
        const workMins = parseInt(value, 10);
        if (workMins >= 1 && workMins <= 120) {
          config.set('workDuration', workMins * 60);
          stateSync.updateConfig({ workDuration: workMins * 60 });
          return chalk.green(`✓ Work duration set to ${workMins} minutes`);
        }
        return chalk.red('Work duration must be between 1 and 120 minutes');

      case 'break':
        const breakMins = parseInt(value, 10);
        if (breakMins >= 1 && breakMins <= 30) {
          config.set('breakDuration', breakMins * 60);
          stateSync.updateConfig({ breakDuration: breakMins * 60 });
          return chalk.green(`✓ Break duration set to ${breakMins} minutes`);
        }
        return chalk.red('Break duration must be between 1 and 30 minutes');

      default:
        return chalk.red(`Unknown config key: ${key}`);
    }
  }

  // /focus command
  focus(minutes?: number): string {
    const maxMinutes = Math.floor(this.config.get('focusMaxDuration') / 60);
    const duration = minutes ? Math.min(minutes, maxMinutes) : maxMinutes;

    stateSync.updateTimer({
      status: 'focus',
      focusUntil: Date.now() + (duration * 60 * 1000),
    });

    return getFocusModeMessage('enter') + chalk.gray(` (${duration} minutes)`);
  }

  // /snooze command
  snooze(minutes: number = 5): string {
    const maxSnooze = 15;
    const duration = Math.min(minutes, maxSnooze);
    const state = stateSync.getState();

    // Increment snooze count and set breakReminderAt if first snooze
    const currentSnoozeCount = (state.timer.currentSnoozeCount || 0) + 1;
    const breakReminderAt = state.timer.breakReminderAt || Date.now();

    stateSync.updateTimer({
      status: 'running',
      timeRemaining: duration * 60,
      currentSnoozeCount,
      breakReminderAt,
    });

    return getSnoozeMessage(duration);
  }

  // Show break screen
  showBreakScreen(): string {
    const stats = this.db.getStats();
    const badges = this.badgeSystem.getAllBadges();
    const state = stateSync.getState();
    const isUrgent = state.timer.timeRemaining <= 0;

    // Set breakReminderAt when break screen is first shown (for accurate response time tracking)
    if (!state.timer.breakReminderAt) {
      stateSync.updateTimer({
        breakReminderAt: Date.now(),
      });
    }

    return breakScreen.render(stats, badges, isUrgent);
  }

  // Get current statusline
  statusline(): string {
    const state = stateSync.getState();
    return statuslineRenderer.render(
      state.timer,
      state.config,
      state.stats.currentStreak
    );
  }

  // Start the timer
  start(): string {
    stateSync.updateTimer({
      status: 'running',
      startedAt: Date.now(),
    });
    return chalk.green('🚀 Peemodoro started! Stay hydrated!');
  }

  // Pause the timer
  pause(): string {
    stateSync.updateTimer({ status: 'paused' });
    return chalk.yellow('⏸️  Peemodoro paused');
  }

  // Resume the timer
  resume(): string {
    stateSync.updateTimer({ status: 'running' });
    return chalk.green('▶️  Peemodoro resumed');
  }

  // Reset the timer
  reset(): string {
    const config = this.config.getTimerConfig();
    stateSync.updateTimer({
      status: 'paused',
      timeRemaining: config.workDuration,
      cycleCount: 0,
      currentCycle: 1,
    });
    return chalk.blue('🔄 Peemodoro reset');
  }

  // Get reminder message for current urgency level
  getReminder(): string {
    const state = stateSync.getState();
    const percentRemaining = state.timer.timeRemaining / state.config.workDuration;

    let urgency: 1 | 2 | 3 | 4;
    if (state.timer.timeRemaining <= 0) urgency = 4;
    else if (percentRemaining > 0.75) urgency = 1;
    else if (percentRemaining > 0.25) urgency = 2;
    else if (percentRemaining > 0) urgency = 3;
    else urgency = 4;

    // Check if we should show hints (< 10 hints shown)
    const shouldShowHint = this.db.shouldShowHints();

    if (shouldShowHint) {
      // Create hint manager with already-shown hints
      const shownHintIds = this.db.getShownHintIds();
      const hintManager = new HintManager(shownHintIds);

      const { message, hint } = getReminderWithHint(urgency, hintManager, shouldShowHint);

      // If we showed a hint, mark it as shown in the database
      if (hint) {
        this.db.incrementHintsShown(hint.id);
      }

      return message;
    }

    return getReminderMessage(urgency);
  }
}

export const commands = new PeemodoroCommands();
