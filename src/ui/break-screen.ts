import chalk from 'chalk';
import { Badge, HydrationTip, UserStats } from '../types.js';

const TOILET_ART = `
    ┌─────┐
    │ (_) │
    │ |│| │
    └─┬─┬─┘
      └─┘
`;

const TOILET_ART_URGENT = `
    ┌─────┐
    │ (!) │
    │ |│| │
    └─┬─┬─┘
      └─┘
`;

const WATER_DROP_ART = `
      ╭─╮
     ╱   ╲
    │     │
    │     │
     ╲   ╱
      ╰─╯
`;

const HYDRATION_TIPS: HydrationTip[] = [
  { tip: 'Room temperature water absorbs faster than cold water', emoji: '💡' },
  { tip: 'Your brain is 75% water - hydration improves focus', emoji: '🧠' },
  { tip: 'Mild dehydration can reduce cognitive performance by 25%', emoji: '📉' },
  { tip: 'The color of your pee indicates hydration - aim for light yellow', emoji: '🎨' },
  { tip: 'Drinking water before meals aids digestion', emoji: '🍽️' },
  { tip: 'Caffeine is a diuretic - balance coffee with water', emoji: '☕' },
  { tip: 'Standing up every 45 mins reduces health risks by 30%', emoji: '🧍' },
  { tip: 'Your kidneys filter about 120-150 quarts of blood daily', emoji: '🫘' },
  { tip: 'Adequate hydration can reduce headache frequency', emoji: '🤕' },
  { tip: 'Water helps regulate body temperature during focus sessions', emoji: '🌡️' },
  { tip: 'Dehydration can make you feel hungry when you\'re actually thirsty', emoji: '🥤' },
  { tip: 'Your body loses water just from breathing - about 1-2 cups per day', emoji: '💨' },
  { tip: 'Hydration improves mood and reduces anxiety', emoji: '😊' },
  { tip: 'Taking breaks improves long-term productivity, not just health', emoji: '📈' },
  { tip: 'A 10-minute break can reset your focus for hours', emoji: '⏰' },
];

const MOTIVATIONAL_QUOTES = [
  'Your code can wait. Your kidneys cannot.',
  'A hydrated developer is a happy developer.',
  'The best code is written after a good break.',
  'You can\'t debug your body like you debug code.',
  'Taking breaks is not lazy - it\'s strategic.',
  'Your future self will thank you for this break.',
  'Even the best processors need cooling time.',
  'Consistency beats intensity. Take the break.',
  'Your bladder has no merge conflicts - listen to it.',
  'This is not a bug, it\'s a feature of being human.',
];

export class BreakScreen {
  private getRandomTip(): HydrationTip {
    return HYDRATION_TIPS[Math.floor(Math.random() * HYDRATION_TIPS.length)];
  }

  private getRandomQuote(): string {
    return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  }

  private getNextBadge(badges: Badge[]): Badge | null {
    const inProgress = badges.filter(b => !b.unlockedAt && b.progress !== undefined);
    if (inProgress.length === 0) return null;

    // Return the one closest to completion
    return inProgress.reduce((closest, badge) => {
      if (!closest) return badge;
      return (badge.progress || 0) > (closest.progress || 0) ? badge : closest;
    }, null as Badge | null);
  }

  render(stats: UserStats, badges: Badge[], isUrgent: boolean = false): string {
    const tip = this.getRandomTip();
    const quote = this.getRandomQuote();
    const art = isUrgent ? TOILET_ART_URGENT : TOILET_ART;
    const nextBadge = this.getNextBadge(badges);

    const lines: string[] = [];

    // Header
    lines.push(chalk.cyan.bold('┌─────────────────────────────────────────┐'));
    lines.push(chalk.cyan.bold('│           🚽 BREAK TIME! 🚽              │'));

    // ASCII Art
    const artLines = art.trim().split('\n');
    for (const artLine of artLines) {
      const padding = Math.floor((41 - artLine.length) / 2);
      lines.push(chalk.cyan('│') + ' '.repeat(padding) + chalk.white(artLine) + ' '.repeat(41 - padding - artLine.length) + chalk.cyan('│'));
    }

    lines.push(chalk.cyan('│' + ' '.repeat(41) + '│'));

    // Tip
    const tipText = `${tip.emoji} Tip: ${tip.tip}`;
    const wrappedTip = this.wrapText(tipText, 39);
    for (const tipLine of wrappedTip) {
      lines.push(chalk.cyan('│') + ' ' + chalk.yellow(tipLine.padEnd(40)) + chalk.cyan('│'));
    }

    lines.push(chalk.cyan('│' + ' '.repeat(41) + '│'));

    // Stats
    lines.push(chalk.cyan('│') + ' ' + chalk.green(`🔥 Streak: ${stats.currentStreak} days`.padEnd(40)) + chalk.cyan('│'));

    // Next badge
    if (nextBadge) {
      const progressBar = this.renderMiniProgress(nextBadge.progress || 0);
      const badgeText = `🏆 Next: "${nextBadge.name}" ${progressBar}`;
      lines.push(chalk.cyan('│') + ' ' + chalk.magenta(badgeText.padEnd(40)) + chalk.cyan('│'));
    }

    lines.push(chalk.cyan('│' + ' '.repeat(41) + '│'));

    // Quote
    const wrappedQuote = this.wrapText(`"${quote}"`, 37);
    for (const quoteLine of wrappedQuote) {
      lines.push(chalk.cyan('│') + '  ' + chalk.italic.gray(quoteLine.padEnd(39)) + chalk.cyan('│'));
    }

    lines.push(chalk.cyan('│' + ' '.repeat(41) + '│'));

    // Actions
    lines.push(chalk.cyan('│') + '        ' + chalk.white('[Press any key when done]') + '        ' + chalk.cyan('│'));
    lines.push(chalk.cyan('│') + '        ' + chalk.gray('[ ] I peed  [ ] Just stretched') + '   ' + chalk.cyan('│'));

    // Footer
    lines.push(chalk.cyan.bold('└─────────────────────────────────────────┘'));

    return lines.join('\n');
  }

  renderCompact(stats: UserStats): string {
    const tip = this.getRandomTip();
    return chalk.cyan(`
🚽 BREAK TIME!
${tip.emoji} ${tip.tip}
🔥 Streak: ${stats.currentStreak}

[Press any key to continue]
`);
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if (currentLine.length + word.length + 1 <= maxWidth) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    return lines;
  }

  private renderMiniProgress(percent: number): string {
    const width = 5;
    const filled = Math.round((percent / 100) * width);
    return `[${'█'.repeat(filled)}${'░'.repeat(width - filled)}]`;
  }
}

export const breakScreen = new BreakScreen();
