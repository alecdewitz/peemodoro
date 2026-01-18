import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { stateSync } from '../core/state-sync.js';
import { statuslineRenderer } from '../ui/statusline.js';

const CLAUDE_SETTINGS_DIR = path.join(os.homedir(), '.claude');
const CLAUDE_SETTINGS_FILE = path.join(CLAUDE_SETTINGS_DIR, 'settings.json');

interface HookCommand {
  type: 'command';
  command: string;
}

interface HookEntry {
  matcher: string;
  hooks: HookCommand[];
}

interface StatusLine {
  type: 'command';
  command: string;
}

interface ClaudeSettings {
  hooks?: {
    PreToolUse?: HookEntry[];
    PostToolUse?: HookEntry[];
    Notification?: HookEntry[];
    Stop?: HookEntry[];
    SessionStart?: HookEntry[];
  };
  env?: Record<string, string>;
  statusLine?: StatusLine;
  permissions?: Record<string, unknown>;
  [key: string]: unknown;
}

export class ClaudeCodeIntegration {
  private settingsPath: string;

  constructor(settingsPath?: string) {
    this.settingsPath = settingsPath || CLAUDE_SETTINGS_FILE;
  }

  private loadSettings(): ClaudeSettings {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const content = fs.readFileSync(this.settingsPath, 'utf-8');
        return JSON.parse(content);
      }
    } catch {
      // Return empty settings on error
    }
    return {};
  }

  private saveSettings(settings: ClaudeSettings): void {
    const dir = path.dirname(this.settingsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.settingsPath, JSON.stringify(settings, null, 2));
  }

  installStatusLine(): void {
    const settings = this.loadSettings();

    // Set the statusline to use peemodoro
    settings.statusLine = { type: 'command', command: 'peemodoro statusline' };

    this.saveSettings(settings);
  }

  uninstallStatusLine(): void {
    const settings = this.loadSettings();

    // Remove peemodoro statusline if it's set
    if (settings.statusLine?.command?.includes('peemodoro')) {
      delete settings.statusLine;
    }

    this.saveSettings(settings);
  }

  installHooks(): void {
    const settings = this.loadSettings();

    if (!settings.hooks) {
      settings.hooks = {};
    }

    // Add Stop hook to track session end time for focus mode
    if (!settings.hooks.Stop) {
      settings.hooks.Stop = [];
    }

    // Check if our hook already exists
    const hasStopHook = settings.hooks.Stop.some(
      h => h.hooks.some(cmd => cmd.command.includes('peemodoro'))
    );

    if (!hasStopHook) {
      settings.hooks.Stop.push({
        matcher: '',
        hooks: [{ type: 'command', command: 'peemodoro on-session-end' }],
      });
    }

    this.saveSettings(settings);
  }

  installAutoUpdate(): void {
    const settings = this.loadSettings();

    if (!settings.hooks) {
      settings.hooks = {};
    }

    // Add SessionStart hook to auto-update peemodoro
    if (!settings.hooks.SessionStart) {
      settings.hooks.SessionStart = [];
    }

    // Check if our auto-update hook already exists
    const hasAutoUpdateHook = settings.hooks.SessionStart.some(
      h => h.hooks.some(cmd => cmd.command.includes('peemodoro') && cmd.command.includes('update'))
    );

    if (!hasAutoUpdateHook) {
      // Run npm update in background to not block session start
      settings.hooks.SessionStart.push({
        matcher: '',
        hooks: [{ type: 'command', command: 'npm update -g peemodoro &>/dev/null &' }],
      });
    }

    this.saveSettings(settings);
  }

  uninstallAutoUpdate(): void {
    const settings = this.loadSettings();

    if (settings.hooks?.SessionStart) {
      settings.hooks.SessionStart = settings.hooks.SessionStart.filter(
        h => !h.hooks.some(cmd => cmd.command.includes('peemodoro') && cmd.command.includes('update'))
      );
      if (settings.hooks.SessionStart.length === 0) {
        delete settings.hooks.SessionStart;
      }
    }

    this.saveSettings(settings);
  }

  uninstallHooks(): void {
    const settings = this.loadSettings();

    if (settings.hooks?.Stop) {
      settings.hooks.Stop = settings.hooks.Stop.filter(
        h => !h.hooks.some(cmd => cmd.command.includes('peemodoro'))
      );
      if (settings.hooks.Stop.length === 0) {
        delete settings.hooks.Stop;
      }
    }

    // Also clean up SessionStart hooks
    if (settings.hooks?.SessionStart) {
      settings.hooks.SessionStart = settings.hooks.SessionStart.filter(
        h => !h.hooks.some(cmd => cmd.command.includes('peemodoro'))
      );
      if (settings.hooks.SessionStart.length === 0) {
        delete settings.hooks.SessionStart;
      }
    }

    this.saveSettings(settings);
  }

  isInstalled(): boolean {
    const settings = this.loadSettings();
    return settings.statusLine?.command?.includes('peemodoro') || false;
  }

  getStatusLineCommand(): string {
    return 'peemodoro statusline';
  }
}

// Generate the statusline output for Claude Code
export function generateStatusLine(): string {
  const state = stateSync.getState();

  return statuslineRenderer.render(
    state.timer,
    state.config,
    state.stats.currentStreak
  );
}

export const claudeCodeIntegration = new ClaudeCodeIntegration();
