// Peemodoro - The #1 solution for your #1 problem
// A Pomodoro timer that reminds you to pee. Seriously.

export { BADGE_DEFINITIONS, BadgeSystem, formatBadgeUnlock } from './core/badges.js';
export { EasterEggs, easterEggs } from './core/easter-eggs.js';
export { NotificationManager, notificationManager } from './core/notifications.js';
export { StateSync, stateSync } from './core/state-sync.js';
export { getFrontmostApp, isTerminalFocused } from './core/terminal-focus.js';
export { PeemodoroTimer } from './core/timer.js';

export { BreakScreen, breakScreen } from './ui/break-screen.js';
export * from './ui/messages.js';
export { StatuslineRenderer, statuslineRenderer } from './ui/statusline.js';

export { commands, PeemodoroCommands } from './commands/index.js';
export { ClaudeCodeIntegration, claudeCodeIntegration, generateStatusLine } from './hooks/claude-code.js';

export { ConfigManager, getConfig, PeemodoroConfig } from './persistence/config.js';
export { getDatabase, PeemodoroDatabase } from './persistence/database.js';

export * from './types.js';
