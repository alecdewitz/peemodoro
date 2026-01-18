import { execSync } from 'child_process';

const TERMINAL_APPS = ['Terminal', 'iTerm2', 'iTerm', 'Hyper', 'Alacritty', 'kitty', 'WezTerm', 'Warp'];

export function isTerminalFocused(): boolean {
  try {
    const result = execSync(
      `osascript -e 'tell application "System Events" to get name of first process whose frontmost is true'`,
      { encoding: 'utf-8', timeout: 500 }
    ).trim();

    return TERMINAL_APPS.some(app =>
      result.toLowerCase().includes(app.toLowerCase())
    );
  } catch {
    // If we can't detect, assume focused (fail open)
    return true;
  }
}

export function getFrontmostApp(): string | null {
  try {
    return execSync(
      `osascript -e 'tell application "System Events" to get name of first process whose frontmost is true'`,
      { encoding: 'utf-8', timeout: 500 }
    ).trim();
  } catch {
    return null;
  }
}
