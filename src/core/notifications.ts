import notifier from 'node-notifier';
import { getConfig } from '../persistence/config.js';
import { UrgencyLevel } from '../types.js';
import { getReminderMessage } from '../ui/messages.js';

export class NotificationManager {
  private config = getConfig();

  async sendBreakReminder(urgency: UrgencyLevel): Promise<void> {
    if (!this.config.get('desktopNotifications')) {
      return;
    }

    const message = getReminderMessage(urgency);
    const title = urgency >= 3 ? '🚨 Peemodoro - BREAK TIME!' : '💧 Peemodoro';

    notifier.notify({
      title,
      message,
      sound: this.config.get('soundEnabled'),
      wait: false,
      timeout: urgency >= 3 ? 10 : 5,
      // icon: path.join(__dirname, '../../assets/icon.png'), // Optional
    });
  }

  async sendBadgeUnlocked(badgeName: string, badgeEmoji: string): Promise<void> {
    if (!this.config.get('desktopNotifications')) {
      return;
    }

    notifier.notify({
      title: '🏆 Badge Unlocked!',
      message: `${badgeEmoji} ${badgeName}`,
      sound: this.config.get('soundEnabled'),
      wait: false,
    });
  }

  async sendStreakMilestone(streak: number): Promise<void> {
    if (!this.config.get('desktopNotifications')) {
      return;
    }

    notifier.notify({
      title: '🔥 Streak Milestone!',
      message: `${streak} days! Keep it up!`,
      sound: this.config.get('soundEnabled'),
      wait: false,
    });
  }

  async sendFocusModeExpired(): Promise<void> {
    if (!this.config.get('desktopNotifications')) {
      return;
    }

    notifier.notify({
      title: '🎯 Focus Mode Ended',
      message: 'Ready for a quick break?',
      sound: false,
      wait: false,
    });
  }

  // Play sound effect (if enabled)
  async playSound(soundName: 'drip' | 'splash' | 'alert'): Promise<void> {
    if (!this.config.get('soundEnabled')) {
      return;
    }

    // Sound playback would require additional dependencies
    // For now, we rely on the system notification sound
    // In a future version, could use `play-sound` package
  }
}

export const notificationManager = new NotificationManager();
