import { UrgencyLevel } from '../types.js';
import { Hint, HintManager } from './hints.js';

interface EscalatingMessage {
  level: UrgencyLevel;
  messages: string[];
}

const REMINDER_MESSAGES: EscalatingMessage[] = [
  {
    level: 1,
    messages: [
      'Just a friendly reminder to stay hydrated! 💧',
      'Your body will thank you for a quick break soon.',
      'Hydration check: How are those water levels?',
      'A break is coming up - great time to grab some water!',
    ],
  },
  {
    level: 2,
    messages: [
      'Urine need of a break soon! 😄',
      'Water you waiting for? A break is approaching!',
      'Your bladder sends its regards...',
      'Time to start wrapping up - break incoming!',
      'Pee-lease consider taking a break soon!',
      'The bathroom misses you!',
    ],
  },
  {
    level: 3,
    messages: [
      '⚠️ Break time is NOW! Your body is calling!',
      '🚨 Hydration alert! Time for a bathroom break!',
      'This is your bladder speaking: We need to talk.',
      '⏰ OVERDUE: Your kidneys filed a complaint.',
      'Code can be refactored. Bladders cannot. GO!',
      'You\'ve been holding it together - now let it go!',
    ],
  },
  {
    level: 4,
    messages: [
      '🚨 CODE YELLOW! Hydration emergency detected!',
      '⚠️ CRITICAL: Bathroom break required IMMEDIATELY!',
      '🔴 RED ALERT: Your body is staging a protest!',
      '💀 DANGER ZONE: This is not a drill. Bathroom. Now.',
      '🚽 EMERGENCY: Ignoring this message may cause... issues.',
      '⚡ URGENT: Your bladder has filed for independence!',
    ],
  },
];

const SNOOZE_MESSAGES = [
  'Okay, snoozing for {mins} minutes... but your bladder remembers.',
  'Snooze activated. Your kidneys are taking notes.',
  'Fine, {mins} more minutes. But this isn\'t over.',
  'Snoozed! Pro tip: don\'t make this a habit 😅',
];

const BREAK_COMPLETE_MESSAGES = [
  'Welcome back, refreshed developer! 💪',
  'Break complete! Ready to write some amazing code?',
  'Feeling lighter? Time to tackle that code!',
  'Hydration: ✓ Bathroom: ✓ Focus: Loading...',
  'You did it! Your body thanks you.',
];

const STREAK_MESSAGES: Record<number, string> = {
  3: '🔥 3-day streak! You\'re on fire (but well hydrated)!',
  7: '🏆 One week streak! You\'re a hydration hero!',
  14: '⭐ Two weeks! Your bladder wrote you a thank-you note.',
  30: '👑 30 DAYS! You are the Peemodoro Master!',
  100: '🎊 100 DAYS! Legend status achieved!',
};

const FOCUS_MODE_MESSAGES = {
  enter: [
    '🎯 Focus mode activated. Reminders quieted.',
    '🎯 Entering the zone. Timer visible, notifications muted.',
    '🎯 Focus mode on. Your bladder respects your dedication.',
  ],
  exit: [
    'Focus complete! Time to check in with your body.',
    'Exiting focus mode. How are you feeling?',
    'Focus session done! Maybe time for a quick break?',
  ],
  autoExpire: [
    '⏰ Focus mode auto-expired. Even focus needs breaks!',
    '🎯 Focus limit reached. Time to reconnect with reality.',
  ],
};

export function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getReminderMessage(urgency: UrgencyLevel): string {
  const levelMessages = REMINDER_MESSAGES.find(m => m.level === urgency);
  if (!levelMessages) return REMINDER_MESSAGES[0].messages[0];
  return getRandomMessage(levelMessages.messages);
}

export function getSnoozeMessage(minutes: number): string {
  const message = getRandomMessage(SNOOZE_MESSAGES);
  return message.replace('{mins}', minutes.toString());
}

export function getBreakCompleteMessage(): string {
  return getRandomMessage(BREAK_COMPLETE_MESSAGES);
}

export function getStreakMessage(streak: number): string | null {
  // Check for exact milestones
  if (STREAK_MESSAGES[streak]) {
    return STREAK_MESSAGES[streak];
  }
  return null;
}

export function getFocusModeMessage(type: 'enter' | 'exit' | 'autoExpire'): string {
  return getRandomMessage(FOCUS_MODE_MESSAGES[type]);
}

/**
 * Gets a reminder message with an optional hint for new users.
 * @param urgency - Current urgency level
 * @param hintManager - HintManager instance for hint selection
 * @param shouldShowHint - Whether hints should be shown (based on user's hint count)
 * @returns Object containing the reminder message and optional hint
 */
export function getReminderWithHint(
  urgency: UrgencyLevel,
  hintManager: HintManager,
  shouldShowHint: boolean
): { message: string; hint: Hint | null } {
  const message = getReminderMessage(urgency);

  if (!shouldShowHint) {
    return { message, hint: null };
  }

  const hintResult = hintManager.getFormattedHint(urgency);
  if (!hintResult) {
    return { message, hint: null };
  }

  // Combine message with hint, separated by newline
  const combinedMessage = `${message}\n\n${hintResult.formatted}`;
  return { message: combinedMessage, hint: hintResult.hint };
}

export { BREAK_COMPLETE_MESSAGES, FOCUS_MODE_MESSAGES, REMINDER_MESSAGES, SNOOZE_MESSAGES, STREAK_MESSAGES };
