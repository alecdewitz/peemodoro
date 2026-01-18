import { Badge, BreakRecord, UserStats } from '../types.js';

// Badge definitions
const BADGE_DEFINITIONS: Omit<Badge, 'unlockedAt' | 'progress'>[] = [
  // Milestone badges
  {
    id: 'first-flush',
    name: 'First Flush',
    description: 'Complete your first break',
    emoji: '🚽',
    category: 'milestone',
    requirement: 1,
  },
  {
    id: 'ten-timer',
    name: 'Ten Timer',
    description: 'Complete 10 breaks',
    emoji: '🔟',
    category: 'milestone',
    requirement: 10,
  },
  {
    id: 'century-club',
    name: 'Century Club',
    description: 'Complete 100 breaks',
    emoji: '💯',
    category: 'milestone',
    requirement: 100,
  },
  {
    id: 'five-hundred',
    name: 'High Fiver',
    description: 'Complete 500 breaks',
    emoji: '🖐️',
    category: 'milestone',
    requirement: 500,
  },
  {
    id: 'thousand',
    name: 'Grand Master',
    description: 'Complete 1000 breaks',
    emoji: '👑',
    category: 'milestone',
    requirement: 1000,
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    emoji: '⚔️',
    category: 'milestone',
    requirement: 7,
  },
  {
    id: 'month-master',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    emoji: '📅',
    category: 'milestone',
    requirement: 30,
  },
  {
    id: 'quarter-champion',
    name: 'Quarter Champion',
    description: 'Maintain a 90-day streak',
    emoji: '🏆',
    category: 'milestone',
    requirement: 90,
  },

  // Behavior badges
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Take 10 breaks before 9 AM',
    emoji: '🐦',
    category: 'behavior',
    requirement: 10,
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Take 10 breaks after 10 PM',
    emoji: '🦉',
    category: 'behavior',
    requirement: 10,
  },
  {
    id: 'speed-peeer',
    name: 'Speed Pee-er',
    description: 'Complete 10 breaks in under 2 minutes',
    emoji: '⚡',
    category: 'behavior',
    requirement: 10,
  },
  {
    id: 'consistent-carl',
    name: 'Consistent Carl',
    description: 'Take breaks at the same time for 5 days',
    emoji: '⏰',
    category: 'behavior',
    requirement: 5,
  },
  {
    id: 'perfect-week',
    name: 'Perfect Week',
    description: 'Never skip a break for 7 days straight',
    emoji: '✨',
    category: 'behavior',
    requirement: 7,
  },

  // Humor badges
  {
    id: 'bladder-of-steel',
    name: 'Bladder of Steel',
    description: 'Snooze 3 times before taking a break (not recommended)',
    emoji: '🛡️',
    category: 'humor',
    requirement: 3,
  },
  {
    id: 'waterfall',
    name: 'Waterfall',
    description: 'Respond to break reminder within 30 seconds',
    emoji: '💦',
    category: 'humor',
    requirement: 10,
  },
  {
    id: 'camel-mode',
    name: 'Camel Mode',
    description: 'Use hydration mode for 30 days',
    emoji: '🐪',
    category: 'humor',
    requirement: 30,
  },
  {
    id: 'aquaholic',
    name: 'Aquaholic',
    description: 'Log 20+ pee breaks in a single day',
    emoji: '🌊',
    category: 'humor',
    requirement: 20,
  },

  // Secret badges (hidden until unlocked)
  {
    id: 'midnight-owl',
    name: 'Midnight Owl',
    description: 'Take a break exactly at midnight',
    emoji: '🌙',
    category: 'secret',
    requirement: 1,
    hidden: true,
  },
  {
    id: 'lucky-seven',
    name: 'Lucky Seven',
    description: 'Complete a break at 7:07:07',
    emoji: '🍀',
    category: 'secret',
    requirement: 1,
    hidden: true,
  },
  {
    id: 'new-year-pee',
    name: 'New Year Pee',
    description: 'Take a break on January 1st',
    emoji: '🎊',
    category: 'secret',
    requirement: 1,
    hidden: true,
  },
  {
    id: 'friday-feeling',
    name: 'TGIF',
    description: 'Complete a 7-day streak on a Friday',
    emoji: '🎉',
    category: 'secret',
    requirement: 1,
    hidden: true,
  },
  {
    id: 'palindrome',
    name: 'Palindrome Master',
    description: 'Take a break when total breaks is a palindrome (101, 111, etc)',
    emoji: '🔄',
    category: 'secret',
    requirement: 1,
    hidden: true,
  },
];

export class BadgeSystem {
  private badges: Map<string, Badge> = new Map();

  constructor(existingBadges: Badge[] = []) {
    // Initialize all badges
    for (const def of BADGE_DEFINITIONS) {
      const existing = existingBadges.find(b => b.id === def.id);
      if (existing) {
        this.badges.set(def.id, existing);
      } else {
        this.badges.set(def.id, { ...def, progress: 0 });
      }
    }
  }

  checkAndUnlock(stats: UserStats, breakRecords: BreakRecord[] = [], hydrationDays: number = 0): Badge[] {
    const newlyUnlocked: Badge[] = [];
    const now = new Date();

    // Milestone badges based on total breaks
    const breakMilestones: Record<string, number> = {
      'first-flush': 1,
      'ten-timer': 10,
      'century-club': 100,
      'five-hundred': 500,
      'thousand': 1000,
    };

    for (const [badgeId, requirement] of Object.entries(breakMilestones)) {
      const badge = this.badges.get(badgeId);
      if (badge && !badge.unlockedAt) {
        badge.progress = Math.min(100, (stats.totalBreaks / requirement) * 100);
        if (stats.totalBreaks >= requirement) {
          badge.unlockedAt = Date.now();
          newlyUnlocked.push(badge);
        }
      }
    }

    // Streak badges
    const streakMilestones: Record<string, number> = {
      'week-warrior': 7,
      'month-master': 30,
      'quarter-champion': 90,
    };

    for (const [badgeId, requirement] of Object.entries(streakMilestones)) {
      const badge = this.badges.get(badgeId);
      if (badge && !badge.unlockedAt) {
        badge.progress = Math.min(100, (stats.currentStreak / requirement) * 100);
        if (stats.currentStreak >= requirement) {
          badge.unlockedAt = Date.now();
          newlyUnlocked.push(badge);
        }
      }
    }

    // Time-based badges from break records
    if (breakRecords.length > 0) {
      const recentBreaks = breakRecords.slice(-50); // Check last 50 breaks

      // Early Bird (breaks before 9 AM)
      const earlyBreaks = recentBreaks.filter(b => new Date(b.timestamp).getHours() < 9);
      this.updateProgressBadge('early-bird', earlyBreaks.length, 10, newlyUnlocked);

      // Night Owl (breaks after 10 PM)
      const nightBreaks = recentBreaks.filter(b => new Date(b.timestamp).getHours() >= 22);
      this.updateProgressBadge('night-owl', nightBreaks.length, 10, newlyUnlocked);

      // Speed Pee-er (breaks under 2 minutes / 120 seconds)
      // Only count breaks with valid duration > 0 to avoid timing bugs
      const quickBreaks = recentBreaks.filter(b => b.duration > 0 && b.duration < 120);
      this.updateProgressBadge('speed-peeer', quickBreaks.length, 10, newlyUnlocked);

      // Waterfall (respond within 30 seconds, 10 times)
      // Only count breaks with valid duration > 0
      const waterfallBreaks = recentBreaks.filter(b => b.duration > 0 && b.duration < 30);
      this.updateProgressBadge('waterfall', waterfallBreaks.length, 10, newlyUnlocked);

      // Bladder of Steel (snooze 3+ times before taking a single break)
      const bladderBreaks = recentBreaks.filter(b => b.snoozeCount >= 3);
      if (bladderBreaks.length > 0) {
        this.updateProgressBadge('bladder-of-steel', 3, 3, newlyUnlocked);
      }
    }

    // Behavior badges that need additional data
    this.checkBehaviorBadges(stats, breakRecords, now, newlyUnlocked, hydrationDays);

    // Secret badges
    this.checkSecretBadges(stats, now, newlyUnlocked);

    return newlyUnlocked;
  }

  private updateProgressBadge(
    badgeId: string,
    current: number,
    requirement: number,
    newlyUnlocked: Badge[]
  ): void {
    const badge = this.badges.get(badgeId);
    if (badge && !badge.unlockedAt) {
      badge.progress = Math.min(100, (current / requirement) * 100);
      if (current >= requirement) {
        badge.unlockedAt = Date.now();
        newlyUnlocked.push(badge);
      }
    }
  }

  private checkBehaviorBadges(
    stats: UserStats,
    breakRecords: BreakRecord[],
    now: Date,
    newlyUnlocked: Badge[],
    hydrationDays: number = 0
  ): void {
    // Aquaholic - 20+ breaks in a single day
    // Group breaks by date and find any day with 20+ pee breaks
    const breaksByDate = new Map<string, number>();
    for (const br of breakRecords) {
      if (br.type === 'pee') {
        const dateStr = new Date(br.timestamp).toISOString().split('T')[0];
        breaksByDate.set(dateStr, (breaksByDate.get(dateStr) || 0) + 1);
      }
    }
    const maxBreaksInDay = Math.max(0, ...Array.from(breaksByDate.values()));
    this.updateProgressBadge('aquaholic', maxBreaksInDay, 20, newlyUnlocked);

    // Consistent Carl - Take breaks at the same time (+/- 30 mins) for 5 consecutive days
    // Group breaks by date and get the primary break hour for each day
    const breakHoursByDate = new Map<string, number[]>();
    for (const br of breakRecords) {
      if (br.type === 'pee') {
        const date = new Date(br.timestamp);
        const dateStr = date.toISOString().split('T')[0];
        const hour = date.getHours();
        if (!breakHoursByDate.has(dateStr)) {
          breakHoursByDate.set(dateStr, []);
        }
        breakHoursByDate.get(dateStr)!.push(hour);
      }
    }

    // Find consecutive days with breaks in the same hour window
    const sortedDates = Array.from(breakHoursByDate.keys()).sort();
    let maxConsistentDays = 0;
    let currentConsistentDays = 1;
    let targetHour: number | null = null;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        const prevHours = breakHoursByDate.get(sortedDates[i - 1])!;
        const currHours = breakHoursByDate.get(sortedDates[i])!;

        // Check if any hour overlaps (+/- 1 hour tolerance)
        const hasOverlap = prevHours.some(ph =>
          currHours.some(ch => Math.abs(ph - ch) <= 1)
        );

        if (hasOverlap) {
          if (targetHour === null) {
            // Find the overlapping hour
            for (const ph of prevHours) {
              for (const ch of currHours) {
                if (Math.abs(ph - ch) <= 1) {
                  targetHour = ph;
                  break;
                }
              }
              if (targetHour !== null) break;
            }
          }
          currentConsistentDays++;
          maxConsistentDays = Math.max(maxConsistentDays, currentConsistentDays);
        } else {
          currentConsistentDays = 1;
          targetHour = null;
        }
      } else {
        currentConsistentDays = 1;
        targetHour = null;
      }
    }
    this.updateProgressBadge('consistent-carl', maxConsistentDays, 5, newlyUnlocked);

    // Perfect Week - 7 consecutive days with no skipped breaks
    // This requires tracking skipped breaks by date
    const skipsByDate = new Map<string, number>();
    const activeDates = new Set<string>();
    for (const br of breakRecords) {
      const dateStr = new Date(br.timestamp).toISOString().split('T')[0];
      activeDates.add(dateStr);
      if (br.type === 'skip') {
        skipsByDate.set(dateStr, (skipsByDate.get(dateStr) || 0) + 1);
      }
    }

    // Find longest streak of consecutive days with no skips
    const sortedActiveDates = Array.from(activeDates).sort();
    let perfectDays = 0;
    let currentPerfectDays = 0;

    for (let i = 0; i < sortedActiveDates.length; i++) {
      const dateStr = sortedActiveDates[i];
      const skips = skipsByDate.get(dateStr) || 0;

      if (skips === 0) {
        // Check if consecutive day
        if (i > 0) {
          const prevDate = new Date(sortedActiveDates[i - 1]);
          const currDate = new Date(dateStr);
          const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
          if (dayDiff === 1) {
            currentPerfectDays++;
          } else {
            currentPerfectDays = 1;
          }
        } else {
          currentPerfectDays = 1;
        }
        perfectDays = Math.max(perfectDays, currentPerfectDays);
      } else {
        currentPerfectDays = 0;
      }
    }
    this.updateProgressBadge('perfect-week', perfectDays, 7, newlyUnlocked);

    // Camel Mode - Use hydration mode for 30 days
    this.updateProgressBadge('camel-mode', hydrationDays, 30, newlyUnlocked);
  }

  private checkSecretBadges(stats: UserStats, now: Date, newlyUnlocked: Badge[]): void {
    // Midnight Owl - break at midnight
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      this.unlockSecret('midnight-owl', newlyUnlocked);
    }

    // Lucky Seven - break at 7:07:07
    if (now.getHours() === 7 && now.getMinutes() === 7 && now.getSeconds() === 7) {
      this.unlockSecret('lucky-seven', newlyUnlocked);
    }

    // New Year Pee - break on January 1st
    if (now.getMonth() === 0 && now.getDate() === 1) {
      this.unlockSecret('new-year-pee', newlyUnlocked);
    }

    // TGIF - 7-day streak on Friday
    if (now.getDay() === 5 && stats.currentStreak >= 7) {
      this.unlockSecret('friday-feeling', newlyUnlocked);
    }

    // Palindrome - total breaks is a palindrome
    const totalStr = stats.totalBreaks.toString();
    if (totalStr.length >= 3 && totalStr === totalStr.split('').reverse().join('')) {
      this.unlockSecret('palindrome', newlyUnlocked);
    }
  }

  private unlockSecret(badgeId: string, newlyUnlocked: Badge[]): void {
    const badge = this.badges.get(badgeId);
    if (badge && !badge.unlockedAt) {
      badge.unlockedAt = Date.now();
      badge.hidden = false; // Reveal the badge
      newlyUnlocked.push(badge);
    }
  }

  getBadge(id: string): Badge | undefined {
    return this.badges.get(id);
  }

  getAllBadges(): Badge[] {
    return Array.from(this.badges.values());
  }

  getUnlockedBadges(): Badge[] {
    return this.getAllBadges().filter(b => b.unlockedAt);
  }

  getVisibleBadges(): Badge[] {
    return this.getAllBadges().filter(b => !b.hidden || b.unlockedAt);
  }

  getNextBadges(limit: number = 3): Badge[] {
    return this.getAllBadges()
      .filter(b => !b.unlockedAt && !b.hidden)
      .sort((a, b) => (b.progress || 0) - (a.progress || 0))
      .slice(0, limit);
  }

  toJSON(): Badge[] {
    return this.getAllBadges();
  }
}

export function formatBadgeUnlock(badge: Badge): string {
  return `
🎊 BADGE UNLOCKED! 🎊
${badge.emoji} ${badge.name}
"${badge.description}"
`;
}

export { BADGE_DEFINITIONS };
