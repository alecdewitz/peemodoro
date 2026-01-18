import { UrgencyLevel } from '../types.js';

/**
 * Hint system for new users during the first 5-10 pee breaks.
 * Shows usage tips and health facts to help users get the most out of Peemodoro.
 */

export interface Hint {
  id: string;
  category: 'usage' | 'health';
  urgency: UrgencyLevel[]; // when to show this hint
  message: string;
  emoji: string;
}

/**
 * Collection of hints for new users
 */
export const HINTS: Hint[] = [
  // Usage tips (shown during first ~5 pees)
  {
    id: 'usage-pee',
    category: 'usage',
    urgency: [1, 2, 3, 4],
    message: 'Type /pee to log your bathroom break and reset the timer.',
    emoji: '\u{1F4A1}', // Light bulb
  },
  {
    id: 'usage-focus',
    category: 'usage',
    urgency: [1, 2],
    message: '/focus gives you uninterrupted time when you need to concentrate.',
    emoji: '\u{1F3AF}', // Target
  },
  {
    id: 'usage-snooze',
    category: 'usage',
    urgency: [2, 3],
    message: '/snooze delays reminders by 5 minutes if you need a bit more time.',
    emoji: '\u{23F0}', // Alarm clock
  },
  {
    id: 'usage-stats',
    category: 'usage',
    urgency: [1, 2],
    message: '/stats shows your hydration streaks and unlocked badges!',
    emoji: '\u{1F4CA}', // Chart
  },
  {
    id: 'usage-config',
    category: 'usage',
    urgency: [1, 2],
    message: '/config lets you customize timer durations and notifications.',
    emoji: '\u{2699}\u{FE0F}', // Gear
  },

  // Health facts (shown after usage tips)
  {
    id: 'health-hydration',
    category: 'health',
    urgency: [1, 2, 3],
    message: 'Staying hydrated improves focus and cognitive performance by up to 30%.',
    emoji: '\u{1F4A7}', // Droplet
  },
  {
    id: 'health-uti',
    category: 'health',
    urgency: [3, 4],
    message: 'Regular bathroom breaks help prevent UTIs and kidney issues.',
    emoji: '\u{1FA7A}', // Stethoscope
  },
  {
    id: 'health-eyes',
    category: 'health',
    urgency: [2, 3],
    message: 'The 20-20-20 rule: Every 20 mins, look 20 feet away for 20 seconds.',
    emoji: '\u{1F440}', // Eyes
  },
  {
    id: 'health-posture',
    category: 'health',
    urgency: [2, 3],
    message: 'Standing up regularly reduces back pain and improves circulation.',
    emoji: '\u{1F9D8}', // Person in lotus position
  },
  {
    id: 'health-breaks',
    category: 'health',
    urgency: [1, 2],
    message: 'Short breaks every 45 mins boost productivity more than working straight.',
    emoji: '\u{1F4AA}', // Flexed bicep
  },
];

/**
 * Hint prefix messages based on urgency level
 */
const HINT_PREFIXES: Record<UrgencyLevel, string> = {
  1: '\u{1F4A1} Did you know?',
  2: '\u{1F4A1} Tip:',
  3: '\u{26A0}\u{FE0F} Quick tip:',
  4: '\u{1F198} Remember:',
};

/**
 * HintManager handles hint selection and formatting
 */
export class HintManager {
  private shownHintIds: Set<string>;

  constructor(shownHintIds: string[] = []) {
    this.shownHintIds = new Set(shownHintIds);
  }

  /**
   * Gets an unshown hint appropriate for the current urgency level.
   * Prioritizes usage tips for new users, then health facts.
   */
  getHint(urgency: UrgencyLevel): Hint | null {
    // Filter hints that match urgency and haven't been shown
    const availableHints = HINTS.filter(
      hint => hint.urgency.includes(urgency) && !this.shownHintIds.has(hint.id)
    );

    if (availableHints.length === 0) {
      return null;
    }

    // Prioritize usage tips over health facts for new users
    const usageTips = availableHints.filter(h => h.category === 'usage');
    const healthFacts = availableHints.filter(h => h.category === 'health');

    // If there are usage tips, prefer those first
    const hintsToChooseFrom = usageTips.length > 0 ? usageTips : healthFacts;

    // Pick a random hint from the available ones
    const index = Math.floor(Math.random() * hintsToChooseFrom.length);
    return hintsToChooseFrom[index];
  }

  /**
   * Marks a hint as shown so it won't be repeated.
   */
  markShown(hintId: string): void {
    this.shownHintIds.add(hintId);
  }

  /**
   * Formats a hint for display with appropriate prefix based on urgency.
   */
  formatHint(hint: Hint, urgency: UrgencyLevel): string {
    const prefix = HINT_PREFIXES[urgency];
    return `${prefix} ${hint.message}`;
  }

  /**
   * Gets and formats a hint in one call.
   * Returns null if no appropriate hint is available.
   */
  getFormattedHint(urgency: UrgencyLevel): { formatted: string; hint: Hint } | null {
    const hint = this.getHint(urgency);
    if (!hint) {
      return null;
    }
    return {
      formatted: this.formatHint(hint, urgency),
      hint,
    };
  }

  /**
   * Gets the count of shown hints.
   */
  getShownCount(): number {
    return this.shownHintIds.size;
  }

  /**
   * Checks if all hints have been shown.
   */
  allHintsShown(): boolean {
    return this.shownHintIds.size >= HINTS.length;
  }
}
