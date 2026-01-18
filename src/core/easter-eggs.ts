import chalk from 'chalk';
import { getConfig } from '../persistence/config.js';

// Konami code sequence: up up down down left right left right b a
const KONAMI_CODE = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'];

// Secret themes unlocked by Konami code
const SECRET_THEMES = {
  retro: {
    name: 'Retro Pixel',
    water: '▓',
    progress: '■□',
    moods: [':-)', ':-(', ':-|', 'X-('],
  },
  matrix: {
    name: 'Matrix',
    water: '💊',
    progress: '01',
    moods: ['🔴', '🔵', '⬛', '💀'],
  },
  space: {
    name: 'Space',
    water: '🌍',
    progress: '🌑🌕',
    moods: ['🛸', '🚀', '🌟', '☄️'],
  },
  ocean: {
    name: 'Ocean',
    water: '🐟',
    progress: '🌊',
    moods: ['🐠', '🐡', '🦈', '🐙'],
  },
};

// Milestone celebrations
const MILESTONE_CELEBRATIONS: Record<number, string> = {
  100: `
🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉
   CENTURY CLUB!
   100 BREAKS!
🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉
`,
  500: `
🌟✨🌟✨🌟✨🌟✨🌟✨
   HALF A THOUSAND!
   You're a legend!
🌟✨🌟✨🌟✨🌟✨🌟✨
`,
  1000: `
👑👑👑👑👑👑👑👑👑👑
  GRAND MASTER!
  1000 BREAKS!

  You have achieved
  true bladder wisdom.
👑👑👑👑👑👑👑👑👑👑
`,
};

// ASCII art water sounds
const WATER_SOUNDS = [
  'drip drip',
  'splash!',
  'woooosh',
  'tinkle tinkle',
  'pssssssh',
  'glug glug',
];

export class EasterEggs {
  private konamiProgress: string[] = [];
  private config = getConfig();

  processKeySequence(key: string): { matched: boolean; message?: string } {
    this.konamiProgress.push(key.toLowerCase());

    // Keep only last 10 keys
    if (this.konamiProgress.length > KONAMI_CODE.length) {
      this.konamiProgress.shift();
    }

    // Check if matches Konami code
    if (this.konamiProgress.length === KONAMI_CODE.length) {
      const matches = KONAMI_CODE.every(
        (k, i) => this.konamiProgress[i] === k
      );

      if (matches) {
        this.konamiProgress = [];
        return this.unlockKonami();
      }
    }

    return { matched: false };
  }

  private unlockKonami(): { matched: boolean; message: string } {
    this.config.unlockKonami();

    const themes = Object.keys(SECRET_THEMES);
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    this.config.setSecretTheme(randomTheme);

    return {
      matched: true,
      message: chalk.magenta(`
🎮 KONAMI CODE ACTIVATED! 🎮

You've unlocked secret themes!
Current theme: ${SECRET_THEMES[randomTheme as keyof typeof SECRET_THEMES].name}

Use "peemodoro theme <name>" to switch:
${themes.map(t => `  - ${t}: ${SECRET_THEMES[t as keyof typeof SECRET_THEMES].name}`).join('\n')}
`),
    };
  }

  getMilestoneCelebration(breakCount: number): string | null {
    return MILESTONE_CELEBRATIONS[breakCount] || null;
  }

  getRandomWaterSound(): string {
    return WATER_SOUNDS[Math.floor(Math.random() * WATER_SOUNDS.length)];
  }

  getSecretTheme(): typeof SECRET_THEMES[keyof typeof SECRET_THEMES] | null {
    const themeName = this.config.getSecretTheme();
    if (themeName && themeName in SECRET_THEMES) {
      return SECRET_THEMES[themeName as keyof typeof SECRET_THEMES];
    }
    return null;
  }

  setTheme(themeName: string): { success: boolean; message: string } {
    if (!this.config.isKonamiUnlocked()) {
      return {
        success: false,
        message: chalk.red('🔒 Themes are locked. Find the secret code to unlock them!'),
      };
    }

    if (themeName in SECRET_THEMES) {
      this.config.setSecretTheme(themeName);
      return {
        success: true,
        message: chalk.green(`✓ Theme set to ${SECRET_THEMES[themeName as keyof typeof SECRET_THEMES].name}`),
      };
    }

    return {
      success: false,
      message: chalk.red(`Unknown theme: ${themeName}`),
    };
  }

  listThemes(): string {
    if (!this.config.isKonamiUnlocked()) {
      return chalk.gray('🔒 Themes are locked. There might be a secret way to unlock them...');
    }

    const currentTheme = this.config.getSecretTheme();
    const lines = [chalk.cyan.bold('\n🎨 Secret Themes\n')];

    for (const [id, theme] of Object.entries(SECRET_THEMES)) {
      const marker = id === currentTheme ? chalk.green('→ ') : '  ';
      lines.push(`${marker}${theme.name} (${id})`);
    }

    lines.push('');
    lines.push(chalk.gray('Use "peemodoro theme <name>" to switch'));

    return lines.join('\n');
  }

  // Special messages for specific times
  getTimeBasedMessage(): string | null {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // 4:20
    if (hour === 16 && minute === 20) {
      return '🌿 Nice timing... wait, we meant hydration!';
    }

    // 11:11
    if (hour === 11 && minute === 11) {
      return '✨ 11:11 - Make a wish! (We wish for good hydration)';
    }

    // 3:14 (Pi time)
    if (hour === 3 && minute === 14) {
      return '🥧 Pi time! 3.14159... breaks and counting';
    }

    // Midnight
    if (hour === 0 && minute === 0) {
      return '🌙 Coding at midnight? Your dedication (and bladder) are noted.';
    }

    return null;
  }

  // Special ASCII art for celebrations
  getConfetti(): string {
    const confetti = ['🎉', '🎊', '✨', '🌟', '💫', '🎈'];
    const lines: string[] = [];

    for (let i = 0; i < 3; i++) {
      let line = '';
      for (let j = 0; j < 20; j++) {
        line += confetti[Math.floor(Math.random() * confetti.length)];
      }
      lines.push(line);
    }

    return lines.join('\n');
  }
}

export const easterEggs = new EasterEggs();
