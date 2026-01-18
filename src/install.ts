#!/usr/bin/env node

import chalk from 'chalk';
import { claudeCodeIntegration } from './hooks/claude-code.js';

console.log(chalk.cyan.bold('\n🚽 Peemodoro Setup\n'));

try {
  const alreadyInstalled = claudeCodeIntegration.isInstalled();

  if (alreadyInstalled) {
    console.log(chalk.yellow('Peemodoro is already configured for Claude Code.'));
    console.log(chalk.gray('Run "peemodoro uninstall" to remove, then run setup again.'));
  } else {
    claudeCodeIntegration.installStatusLine();
    claudeCodeIntegration.installHooks();
    claudeCodeIntegration.installAutoUpdate();

    console.log(chalk.green('✓ Peemodoro configured successfully!\n'));
    console.log(chalk.white('What was configured:'));
    console.log(chalk.gray('  • Statusline integration (shows timer in Claude Code)'));
    console.log(chalk.gray('  • Session hooks (tracks focus time)'));
    console.log(chalk.gray('  • Auto-update on session start\n'));

    console.log(chalk.white('Next steps:'));
    console.log(chalk.gray('  1. Restart Claude Code to activate the statusline'));
    console.log(chalk.gray('  2. Run /peemodoro-start to begin'));
    console.log(chalk.gray('  3. Run "peemodoro help" to see all commands\n'));

    console.log(chalk.cyan('Stay hydrated! 💧'));
  }
} catch (error) {
  console.error(chalk.red('Installation failed:'), error instanceof Error ? error.message : error);
  process.exit(1);
}
