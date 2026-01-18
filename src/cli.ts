#!/usr/bin/env node

import chalk from 'chalk';
import { commands } from './commands/index.js';
import { easterEggs } from './core/easter-eggs.js';
import { stateSync } from './core/state-sync.js';
import { isTerminalFocused } from './core/terminal-focus.js';
import { claudeCodeIntegration, generateStatusLine } from './hooks/claude-code.js';
import { getDatabase } from './persistence/database.js';

const HELP_TEXT = `
${chalk.cyan.bold('🚽 Peemodoro')} - Pomodoro timer that reminds you to pee. Seriously.

${chalk.yellow('Usage:')}
  peemodoro <command> [options]

${chalk.yellow('Commands:')}
  ${chalk.green('start')}              Start the timer
  ${chalk.green('pause')}              Pause the timer
  ${chalk.green('resume')}             Resume the timer
  ${chalk.green('reset')}              Reset the timer

  ${chalk.green('pee')}                Log a pee break (ends current break)
  ${chalk.green('stretch')}            Log a stretch break
  ${chalk.green('skip')}               Skip this break (not recommended!)

  ${chalk.green('focus [mins]')}       Enter focus mode (quiets reminders)
  ${chalk.green('snooze [mins]')}      Snooze reminder (default: 5 mins)

  ${chalk.green('stats')}              Show your stats and badges
  ${chalk.green('config')}             Show current configuration
  ${chalk.green('config set <k> <v>')} Update configuration

  ${chalk.green('statusline')}         Output statusline (for Claude Code)
  ${chalk.green('setup')}              Configure Claude Code integration
  ${chalk.green('uninstall')}          Remove Claude Code integration

  ${chalk.green('theme [name]')}       List or set secret themes (if unlocked)
  ${chalk.green('help')}               Show this help message

${chalk.yellow('Config Keys:')}
  mode          Timer mode: classic, hydration, adaptive
  work          Work duration in minutes (1-120)
  break         Break duration in minutes (1-30)
  sound         Enable/disable sounds: on/off
  notifications Enable/disable desktop notifications: on/off

${chalk.yellow('Examples:')}
  peemodoro start           # Start timer
  peemodoro pee             # Log a pee break
  peemodoro focus 30        # Focus mode for 30 minutes
  peemodoro config set mode classic
  peemodoro stats

${chalk.gray('Pro tip: Run "peemodoro setup" to enable the Claude Code statusline!')}
`;

async function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    console.log(HELP_TEXT);
    return;
  }

  try {
    switch (command) {
      case 'start':
        console.log(commands.start());
        break;

      case 'pause':
        console.log(commands.pause());
        break;

      case 'resume':
        console.log(commands.resume());
        break;

      case 'reset':
        console.log(commands.reset());
        break;

      case 'pee':
        console.log(await commands.pee('pee'));
        break;

      case 'stretch':
        console.log(await commands.pee('stretch'));
        break;

      case 'skip':
        console.log(await commands.pee('skip'));
        console.log(chalk.yellow('(Your bladder will remember this...)'));
        break;

      case 'focus':
        const focusMins = args[1] ? parseInt(args[1], 10) : undefined;
        console.log(commands.focus(focusMins));
        break;

      case 'snooze':
        const snoozeMins = args[1] ? parseInt(args[1], 10) : 5;
        console.log(commands.snooze(snoozeMins));
        break;

      case 'stats':
        console.log(commands.stats());
        break;

      case 'config':
        if (args[1] === 'set' && args[2] && args[3]) {
          console.log(commands.setConfig(args[2], args[3]));
        } else {
          console.log(commands.showConfig());
        }
        break;

      case 'statusline':
        // Output just the statusline for Claude Code integration
        // Optional: only show when terminal is focused (use --focus-only flag)
        if (args.includes('--focus-only') && !isTerminalFocused()) {
          console.log(''); // Empty output when not focused
        } else {
          console.log(generateStatusLine());
        }
        break;

      case 'setup':
      case 'install':
        claudeCodeIntegration.installStatusLine();
        claudeCodeIntegration.installHooks();
        claudeCodeIntegration.installAutoUpdate();
        console.log(chalk.green('✓ Peemodoro configured for Claude Code!'));
        console.log(chalk.gray('  Restart Claude Code to see the statusline.'));
        break;

      case 'uninstall':
        claudeCodeIntegration.uninstallStatusLine();
        claudeCodeIntegration.uninstallHooks();
        console.log(chalk.green('✓ Peemodoro uninstalled from Claude Code.'));
        break;

      case 'theme':
        if (args[1]) {
          const result = easterEggs.setTheme(args[1]);
          console.log(result.message);
        } else {
          console.log(easterEggs.listThemes());
        }
        break;

      case 'break':
        // Show the break screen
        console.log(commands.showBreakScreen());
        break;

      case 'reminder':
        // Get current reminder message
        console.log(commands.getReminder());
        break;

      case 'on-session-end':
        // Hook called when Claude Code session ends
        const state = stateSync.getState();
        if (state.timer.status === 'focus') {
          const focusTime = state.timer.focusUntil
            ? (state.timer.focusUntil - Date.now()) / 1000
            : 0;
          if (focusTime > 0) {
            getDatabase().addFocusTime(Math.abs(focusTime));
          }
        }
        break;

      case 'version':
      case '--version':
      case '-v':
        console.log('peemodoro v1.0.0');
        break;

      default:
        console.log(chalk.red(`Unknown command: ${command}`));
        console.log(chalk.gray('Run "peemodoro help" for usage information.'));
        process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
