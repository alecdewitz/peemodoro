import Database from 'better-sqlite3';
import * as fs from 'fs';
import { DB_PATH, PEEMODORO_DIR } from '../constants.js';
import { Badge, BreakRecord, BreakType, UserStats } from '../types.js';

export class PeemodoroDatabase {
  private db: Database.Database;

  constructor() {
    this.ensureDirectory();
    this.db = new Database(DB_PATH);
    this.init();
  }

  private ensureDirectory(): void {
    if (!fs.existsSync(PEEMODORO_DIR)) {
      fs.mkdirSync(PEEMODORO_DIR, { recursive: true });
    }
  }

  private init(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS breaks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        type TEXT NOT NULL,
        duration INTEGER NOT NULL,
        snoozed INTEGER NOT NULL DEFAULT 0,
        snooze_count INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS daily_stats (
        date TEXT PRIMARY KEY,
        total_breaks INTEGER NOT NULL DEFAULT 0,
        pee_breaks INTEGER NOT NULL DEFAULT 0,
        stretch_breaks INTEGER NOT NULL DEFAULT 0,
        skipped_breaks INTEGER NOT NULL DEFAULT 0,
        total_focus_time INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS badges (
        id TEXT PRIMARY KEY,
        unlocked_at INTEGER,
        progress REAL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE TABLE IF NOT EXISTS mode_usage (
        date TEXT PRIMARY KEY,
        mode TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_breaks_timestamp ON breaks(timestamp);
      CREATE INDEX IF NOT EXISTS idx_breaks_type ON breaks(type);

      CREATE TABLE IF NOT EXISTS hints_shown (
        hint_id TEXT PRIMARY KEY,
        shown_at INTEGER NOT NULL
      );
    `);

    // Initialize streak tracking if not exists
    const streakData = this.getMeta('current_streak');
    if (!streakData) {
      this.setMeta('current_streak', '0');
      this.setMeta('longest_streak', '0');
      this.setMeta('last_break_date', '');
    }
  }

  recordBreak(type: BreakType, duration: number, snoozed: boolean, snoozeCount: number): BreakRecord {
    const timestamp = Date.now();
    const today = new Date().toISOString().split('T')[0];

    // Insert break record
    const result = this.db.prepare(`
      INSERT INTO breaks (timestamp, type, duration, snoozed, snooze_count)
      VALUES (?, ?, ?, ?, ?)
    `).run(timestamp, type, duration, snoozed ? 1 : 0, snoozeCount);

    // Update daily stats
    const isPee = type === 'pee' ? 1 : 0;
    const isStretch = type === 'stretch' ? 1 : 0;
    const isSkip = type === 'skip' ? 1 : 0;

    this.db.prepare(`
      INSERT INTO daily_stats (date, total_breaks, pee_breaks, stretch_breaks, skipped_breaks)
      VALUES (?, 1, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        total_breaks = total_breaks + 1,
        pee_breaks = pee_breaks + ?,
        stretch_breaks = stretch_breaks + ?,
        skipped_breaks = skipped_breaks + ?
    `).run(today, isPee, isStretch, isSkip, isPee, isStretch, isSkip);

    // Update streak
    this.updateStreak(today);

    return {
      id: result.lastInsertRowid as number,
      timestamp,
      type,
      duration,
      snoozed,
      snoozeCount,
    };
  }

  private updateStreak(today: string): void {
    const lastBreakDate = this.getMeta('last_break_date');
    let currentStreak = parseInt(this.getMeta('current_streak') || '0', 10);
    const longestStreak = parseInt(this.getMeta('longest_streak') || '0', 10);

    if (lastBreakDate) {
      const lastDate = new Date(lastBreakDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day - increment streak
        currentStreak++;
      } else if (diffDays > 1) {
        // Streak broken
        currentStreak = 1;
      }
      // If diffDays === 0, same day - don't change streak
    } else {
      // First ever break
      currentStreak = 1;
    }

    this.setMeta('current_streak', currentStreak.toString());
    this.setMeta('last_break_date', today);

    if (currentStreak > longestStreak) {
      this.setMeta('longest_streak', currentStreak.toString());
    }
  }

  addFocusTime(seconds: number): void {
    const today = new Date().toISOString().split('T')[0];
    this.db.prepare(`
      INSERT INTO daily_stats (date, total_focus_time)
      VALUES (?, ?)
      ON CONFLICT(date) DO UPDATE SET
        total_focus_time = total_focus_time + ?
    `).run(today, seconds, seconds);
  }

  getBreaks(limit: number = 100, offset: number = 0): BreakRecord[] {
    return this.db.prepare(`
      SELECT id, timestamp, type, duration, snoozed, snooze_count as snoozeCount
      FROM breaks
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset) as BreakRecord[];
  }

  getBreaksForDate(date: string): BreakRecord[] {
    const startOfDay = new Date(date).setHours(0, 0, 0, 0);
    const endOfDay = new Date(date).setHours(23, 59, 59, 999);

    return this.db.prepare(`
      SELECT id, timestamp, type, duration, snoozed, snooze_count as snoozeCount
      FROM breaks
      WHERE timestamp >= ? AND timestamp <= ?
      ORDER BY timestamp ASC
    `).all(startOfDay, endOfDay) as BreakRecord[];
  }

  getStats(): UserStats {
    const totals = this.db.prepare(`
      SELECT
        COALESCE(SUM(total_breaks), 0) as totalBreaks,
        COALESCE(SUM(pee_breaks), 0) as peeBreaks,
        COALESCE(SUM(stretch_breaks), 0) as stretchBreaks,
        COALESCE(SUM(skipped_breaks), 0) as skippedBreaks,
        COALESCE(SUM(total_focus_time), 0) as totalFocusTime
      FROM daily_stats
    `).get() as Record<string, number>;

    const avgInterval = this.db.prepare(`
      SELECT AVG(timestamp - prev_timestamp) as avg
      FROM (
        SELECT timestamp, LAG(timestamp) OVER (ORDER BY timestamp) as prev_timestamp
        FROM breaks
        WHERE type != 'skip'
      )
      WHERE prev_timestamp IS NOT NULL
    `).get() as { avg: number | null };

    return {
      totalBreaks: totals.totalBreaks || 0,
      peeBreaks: totals.peeBreaks || 0,
      stretchBreaks: totals.stretchBreaks || 0,
      skippedBreaks: totals.skippedBreaks || 0,
      currentStreak: parseInt(this.getMeta('current_streak') || '0', 10),
      longestStreak: parseInt(this.getMeta('longest_streak') || '0', 10),
      totalFocusTime: totals.totalFocusTime || 0,
      averageBreakInterval: avgInterval?.avg || 45 * 60 * 1000, // default 45 mins
      lastActiveDate: this.getMeta('last_break_date') || new Date().toISOString().split('T')[0],
    };
  }

  saveBadge(badge: Badge): void {
    this.db.prepare(`
      INSERT INTO badges (id, unlocked_at, progress)
      VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        unlocked_at = ?,
        progress = ?
    `).run(badge.id, badge.unlockedAt || null, badge.progress || 0, badge.unlockedAt || null, badge.progress || 0);
  }

  getBadges(): { id: string; unlockedAt: number | null; progress: number }[] {
    return this.db.prepare(`
      SELECT id, unlocked_at as unlockedAt, progress
      FROM badges
    `).all() as { id: string; unlockedAt: number | null; progress: number }[];
  }

  private getMeta(key: string): string | null {
    const result = this.db.prepare('SELECT value FROM meta WHERE key = ?').get(key) as { value: string } | undefined;
    return result?.value || null;
  }

  private setMeta(key: string, value: string): void {
    this.db.prepare(`
      INSERT INTO meta (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = ?
    `).run(key, value, value);
  }

  // Record mode usage for the current day (for Camel Mode badge)
  recordModeUsage(mode: string): void {
    const today = new Date().toISOString().split('T')[0];
    this.db.prepare(`
      INSERT INTO mode_usage (date, mode)
      VALUES (?, ?)
      ON CONFLICT(date) DO UPDATE SET mode = ?
    `).run(today, mode, mode);
  }

  // Get count of days using hydration mode
  getHydrationModeDays(): number {
    const result = this.db.prepare(`
      SELECT COUNT(*) as count FROM mode_usage WHERE mode = 'hydration'
    `).get() as { count: number };
    return result.count;
  }

  // For adaptive mode - analyze break patterns
  analyzeBreakPatterns(): {
    averageInterval: number;
    preferredTimes: number[]; // hours of day
    averageDuration: number;
  } {
    const intervals = this.db.prepare(`
      SELECT AVG(timestamp - prev_timestamp) / 1000 as avgInterval
      FROM (
        SELECT timestamp, LAG(timestamp) OVER (ORDER BY timestamp) as prev_timestamp
        FROM breaks
        WHERE type = 'pee'
      )
      WHERE prev_timestamp IS NOT NULL
    `).get() as { avgInterval: number | null };

    const preferredHours = this.db.prepare(`
      SELECT CAST(strftime('%H', datetime(timestamp / 1000, 'unixepoch', 'localtime')) AS INTEGER) as hour,
             COUNT(*) as count
      FROM breaks
      WHERE type = 'pee'
      GROUP BY hour
      ORDER BY count DESC
      LIMIT 5
    `).all() as { hour: number; count: number }[];

    const avgDuration = this.db.prepare(`
      SELECT AVG(duration) as avg FROM breaks WHERE type = 'pee'
    `).get() as { avg: number | null };

    return {
      averageInterval: intervals?.avgInterval || 45 * 60,
      preferredTimes: preferredHours.map(h => h.hour),
      averageDuration: avgDuration?.avg || 5 * 60,
    };
  }

  // Hint tracking methods

  /**
   * Gets the total count of hints that have been shown to the user.
   */
  getHintsShownCount(): number {
    const result = this.db.prepare(`
      SELECT COUNT(*) as count FROM hints_shown
    `).get() as { count: number };
    return result.count;
  }

  /**
   * Checks if hints should still be shown (< 10 hints shown).
   */
  shouldShowHints(): boolean {
    return this.getHintsShownCount() < 10;
  }

  /**
   * Gets the IDs of all hints that have been shown.
   */
  getShownHintIds(): string[] {
    const results = this.db.prepare(`
      SELECT hint_id FROM hints_shown
    `).all() as { hint_id: string }[];
    return results.map(r => r.hint_id);
  }

  /**
   * Marks a specific hint as shown.
   */
  markHintShown(hintId: string): void {
    this.db.prepare(`
      INSERT OR IGNORE INTO hints_shown (hint_id, shown_at)
      VALUES (?, ?)
    `).run(hintId, Date.now());
  }

  /**
   * Increments the hints shown count by marking a hint as shown.
   * This is called after displaying a hint to track progress.
   */
  incrementHintsShown(hintId: string): void {
    this.markHintShown(hintId);
  }

  close(): void {
    this.db.close();
  }
}

// Singleton instance
let dbInstance: PeemodoroDatabase | null = null;

export function getDatabase(): PeemodoroDatabase {
  if (!dbInstance) {
    dbInstance = new PeemodoroDatabase();
  }
  return dbInstance;
}
