<p align="center">
  <img src="https://img.shields.io/badge/Claude%20Code-Plugin-blueviolet?style=for-the-badge" alt="Claude Code Plugin"/>
  <img src="https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge" alt="Version"/>
  <img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="License"/>
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=for-the-badge&logo=node.js" alt="Node"/>
</p>

<h1 align="center">🚽 Peemodoro</h1>

<p align="center">
  <strong>A hydration-focused productivity timer for Claude Code</strong>
  <br />
  <em>Your code can wait. Your kidneys cannot.</em>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-commands">Commands</a> •
  <a href="#-badges">Badges</a> •
  <a href="#%EF%B8%8F-configuration">Configuration</a>
</p>

---

## Why Peemodoro?

Most productivity timers optimize for output. **Peemodoro optimizes for you.**

Built specifically for developers who lose track of time in deep focus, Peemodoro is a Claude Code plugin that combines the proven Pomodoro technique with science-backed hydration reminders. It integrates directly into your Claude Code statusline, keeping health cues visible without breaking your flow.

```
💧 23:45 ░░░░░░░░ 😌         Fresh and focused
💦 12:30 ███░░░░░ 😐         Building urgency
🌊 02:15 ██████░░ 😬         Time to wrap up
🚨 OVERDUE ████████ 🥴       Your bladder is staging a revolt
```

---

## ✨ Features

### 🎯 Smart Timer Modes

| Mode | Work | Break | Best For |
|------|------|-------|----------|
| **Classic** | 25 min | 5 min | Traditional Pomodoro fans |
| **Hydration** | 45 min | 10 min | Science-backed bladder timing |
| **Adaptive** | Learns | Learns | Your natural rhythm |

**Hydration Mode** (default) is based on actual bladder biology—the average person needs a bathroom break every 45 minutes when properly hydrated. No more arbitrary 25-minute intervals.

### 📊 Escalating Reminders

Peemodoro uses a 4-level urgency system that intensifies as break time approaches:

| Level | Visual | Mood | What Happens |
|-------|--------|------|--------------|
| Fresh | 💧 Green | 😌 | Gentle ambient awareness |
| Building | 💦 Yellow | 😐 | "Urine need of a break soon!" |
| Urgent | 🌊 Orange | 😬 | Clear break signals |
| Critical | 🚨 Pulsing Red | 🥴 | "CODE YELLOW! This is not a drill!" |

### 🏆 Gamification That Motivates

**25+ badges** to unlock, from milestones to hidden achievements:

- 🚽 **First Flush** — Your journey begins
- 💯 **Century Club** — 100 breaks logged
- ⚔️ **Week Warrior** — 7-day streak
- 🌙 **Midnight Owl** — Break at exactly midnight
- 🍀 **Lucky Seven** — Break at 7:07:07
- 🛡️ **Bladder of Steel** — Snooze 3 times before breaking

### 🔄 Cross-Terminal Sync

Multiple terminals? No problem. Peemodoro maintains shared state across all your sessions with intelligent file locking—no duplicate reminders, no missed breaks.

### 🎯 Focus Mode

Need deep work time? Enter focus mode to mute reminders while keeping the timer visible:

```bash
peemodoro focus 60  # 60 minutes of uninterrupted flow
```

### 💡 Hydration Tips

Every break screen includes curated health tips:

> "Your brain is 75% water. A 2% drop in hydration can trigger a 10% decrease in cognitive performance."

---

## 📦 Installation

### Claude Code Marketplace (Recommended)

```bash
# Add the marketplace plugin (if not already installed)
/plugin marketplace add alecdewitz/peemodoro

# Install peemodoro
/plugin install peemodoro

# Configure statusline integration
/peemodoro-setup
```

**Restart Claude Code** to activate the statusline.

### From npm

```bash
npm install -g peemodoro
peemodoro setup
```

### From Source

```bash
git clone https://github.com/alecdewitz/peemodoro.git
cd peemodoro
npm install
npm run build
npm link
peemodoro setup
```

---

## 🚀 Quick Start

```bash
# Start your first timer
peemodoro start

# When it's break time, log it
peemodoro pee

# Check your progress
peemodoro stats

# View configuration
peemodoro config
```

That's it. The timer appears in your Claude Code statusline automatically.

---

## 📋 Commands

### Timer Controls

| Command | Description |
|---------|-------------|
| `peemodoro start` | Start the timer |
| `peemodoro pause` | Pause the running timer |
| `peemodoro resume` | Resume a paused timer |
| `peemodoro reset` | Reset timer to initial state |

### Break Actions

| Command | Description |
|---------|-------------|
| `peemodoro pee` | Log a bathroom break |
| `peemodoro stretch` | Log a stretch break |
| `peemodoro skip` | Skip the break (tracked—we're watching 👀) |
| `peemodoro snooze [min]` | Snooze reminder for 5-15 minutes |

### Information

| Command | Description |
|---------|-------------|
| `peemodoro stats` | View break history, streaks, and badges |
| `peemodoro break` | Display the break screen with tips |
| `peemodoro help` | Show all commands |
| `peemodoro version` | Display version number |

### Focus & Configuration

| Command | Description |
|---------|-------------|
| `peemodoro focus [min]` | Enter focus mode (max 90 min) |
| `peemodoro config` | Show current settings |
| `peemodoro config set <key> <value>` | Update a setting |

### Setup

| Command | Description |
|---------|-------------|
| `peemodoro setup` | Configure Claude Code integration |
| `peemodoro uninstall` | Remove Claude Code integration |

---

## 🏅 Badges

Progress through 25+ achievements across four categories:

### Milestone Badges
| Badge | Name | Requirement |
|-------|------|-------------|
| 🚽 | First Flush | Log your first break |
| 🔟 | Ten Timer | 10 breaks |
| 💯 | Century Club | 100 breaks |
| 🖐️ | High Fiver | 500 breaks |
| 👑 | Grand Master | 1,000 breaks |

### Streak Badges
| Badge | Name | Requirement |
|-------|------|-------------|
| ⚔️ | Week Warrior | 7-day streak |
| 📅 | Month Master | 30-day streak |
| 🏆 | Quarter Champion | 90-day streak |

### Behavior Badges
| Badge | Name | Requirement |
|-------|------|-------------|
| 🐦 | Early Bird | 10 breaks before 9 AM |
| 🦉 | Night Owl | 10 breaks after 10 PM |
| ⚡ | Speed Pee-er | 10 breaks under 2 minutes |
| ✨ | Perfect Week | No skipped breaks for 7 days |
| 💦 | Waterfall | Respond within 30 seconds |
| 🛡️ | Bladder of Steel | Snooze 3 times before breaking |
| 🐪 | Camel Mode | Use hydration mode for 30 days |
| 🌊 | Aquaholic | 20+ breaks in one day |

### Secret Badges
*Hidden achievements unlocked by specific patterns...*

| Badge | Name | Hint |
|-------|------|------|
| 🌙 | ??? | The witching hour |
| 🍀 | ??? | Lucky numbers |
| 🎊 | ??? | New beginnings |
| 🔄 | ??? | Same forwards and backwards |

---

## ⚙️ Configuration

### View Current Settings

```bash
peemodoro config
```

```
⚙️  Peemodoro Configuration

📋 Mode: Hydration Mode (45/10)
⏱️  Work Duration: 45 minutes
☕ Break Duration: 10 minutes
🛋️  Long Break: 20 minutes
🔄 Cycles before long break: 4

Display:
   Progress bar: ✓
   Mood emoji: ✓
   Streak counter: ✓

Notifications:
   Desktop: ✓
   Sound: ✓
```

### Available Settings

| Key | Values | Description |
|-----|--------|-------------|
| `mode` | `classic`, `hydration`, `adaptive` | Timer mode |
| `work` | `1-120` | Work duration in minutes |
| `break` | `1-30` | Break duration in minutes |
| `sound` | `on`, `off` | Sound notifications |
| `notifications` | `on`, `off` | Desktop notifications |

### Examples

```bash
# Switch to classic Pomodoro
peemodoro config set mode classic

# Custom 30-minute work sessions
peemodoro config set work 30

# Disable sounds
peemodoro config set sound off
```

---

## 📊 Statusline Display

The statusline provides at-a-glance awareness without context switching:

```
💧 23:45 ░░░░░░░░ 😌                    # Fresh - all good
💦 12:30 ███░░░░░ 😐                    # Building - halfway there
🌊 02:15 ██████░░ 😬 🔥7                # Urgent + 7-day streak
🚨 OVERDUE ████████ 🥴                  # Critical - take a break!
🎯 💧 18:22 ░░░░░░ [muted]              # Focus mode active
🚽 BREAK 08:45 ████░░░░                 # Break time
```

### Statusline Elements

| Element | Meaning |
|---------|---------|
| 💧💦🌊🚨 | Urgency level indicator |
| `MM:SS` | Time remaining |
| `████░░░░` | Visual progress bar |
| 😌😐😬🥴 | Mood emoji |
| 🔥N | Current streak (shown when ≥3 days) |
| 🎯 | Focus mode active |
| 🚽 | Currently on break |

---

## 🎯 Adaptive Mode

When using adaptive mode, Peemodoro learns from your patterns:

1. **Analyzes** your break timing history
2. **Identifies** your natural focus duration
3. **Adjusts** work intervals (20-90 minute range)
4. **Adapts** to your time-of-day preferences

Enable it with:

```bash
peemodoro config set mode adaptive
```

The more you use it, the smarter it gets.

---

## 📁 Data Storage

All data is stored locally in `~/.peemodoro/`:

| File | Purpose |
|------|---------|
| `state.json` | Current timer state (synced across terminals) |
| `history.db` | Break history and statistics (SQLite) |
| `config.json` | User preferences |

Your data never leaves your machine.

---

## 🥚 Easter Eggs

Peemodoro includes hidden features for the curious:

- **Secret themes** unlock with a classic code sequence
- **Time-based messages** appear at special moments (try 4:20 or 3:14)
- **Milestone celebrations** with ASCII art at 100, 500, and 1000 breaks

Some things are more fun to discover yourself.

---

## 🔧 Troubleshooting

### Statusline not appearing?

1. Ensure you've run `peemodoro setup` or `/peemodoro-setup`
2. Restart Claude Code completely
3. Check that the timer is running: `peemodoro start`

### Timer not syncing across terminals?

Check for stale lock files:

```bash
ls -la ~/.peemodoro/
```

Remove any `.lock` files if the timer seems stuck.

### Notifications not working?

```bash
peemodoro config set notifications on
peemodoro config set sound on
```

Desktop notifications depend on your OS notification system being enabled.

---

## 🤝 Contributing

Contributions are welcome! Areas of interest:

- Additional timer modes
- More badges and achievements
- Sound effect themes
- Localization support
- Integration tests

### Development

```bash
git clone https://github.com/alecdewitz/peemodoro.git
cd peemodoro
npm install
npm run dev     # Watch mode
npm run build   # Production build
npm test        # Run tests
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>Stay hydrated. Ship code. Take breaks.</strong>
  <br />
  <br />
  <em>Built with 💧 for developers who forget they have bodies</em>
</p>
