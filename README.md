<p align="center">
  <img src="https://img.shields.io/badge/Claude%20Code-Plugin-blueviolet?style=for-the-badge" alt="Claude Code Plugin"/>
  <img src="https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge" alt="Version"/>
  <img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="License"/>
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=for-the-badge&logo=node.js" alt="Node"/>
</p>

<h1 align="center">🚽 Peemodoro</h1>

<p align="center">
  <strong>A pomodoro timer for Claude coders who forget to use the bathroom</strong>
  <br />
  <em>Your code can wait. Your kidneys cannot.</em>
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#installation">Installation</a> •
  <a href="#commands">Commands</a> •
  <a href="#configuration">Configuration</a>
</p>

---

## Overview

Peemodoro is a Claude Code plugin that reminds you to take breaks. It puts a countdown timer in your statusline that gets more urgent as time runs out.

The default is 45 minutes, which is roughly how long you can go before needing the bathroom if you're drinking enough water. Most pomodoro timers are about productivity. This one is about remembering to pee.

```
💧 32:15 ████████         Totally fine
💦 22:00 █████░░░         Hmm, maybe later
😅 10:00 ███░░░░░         It can wait
😰 06:00 ██░░░░░░         ...can it though?
🫠 02:30 █░░░░░░░         Oh no
🆘 01:00 ░░░░░░░░         OH NO
🚽 TIME TO PEE ░░░░░░░░   GO. NOW.
```

---

## Installation

### Claude Code Marketplace (recommended)

```bash
# run inside claude code

/plugin marketplace add alecdewitz/peemodoro
/plugin install peemodoro
/peemodoro:setup
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
npm install && npm run build && npm link
peemodoro setup
```

---

## Commands

### Core

| Command  | Description                         |
| -------- | ----------------------------------- |
| `/pee`   | Log a break and reset the timer     |
| `/start` | Start the timer                     |
| `/stats` | View break history and achievements |
| `/break` | Show the break screen               |

### Timer Control

| Command         | Description                             |
| --------------- | --------------------------------------- |
| `/focus [min]`  | Suppress reminders for up to 90 minutes |
| `/snooze [min]` | Delay reminder by 5-15 minutes          |
| `/config`       | View or update settings                 |

---

## Configuration

```bash
peemodoro config                      # View current settings
peemodoro config set mode classic     # Switch timer mode
peemodoro config set work 30          # Custom work duration
```

### Timer Modes

| Mode          | Work     | Break    | Description                                          |
| ------------- | -------- | -------- | ---------------------------------------------------- |
| **Hydration** | 45 min   | 10 min   | Default. Based on how long you can actually hold it. |
| **Classic**   | 25 min   | 5 min    | Traditional Pomodoro intervals.                      |
| **Adaptive**  | Variable | Variable | Learns from your patterns over time.                 |

---

## Badges

You unlock achievements as you keep up with breaks.

### Milestones

| Badge | Name         | Requirement          |
| ----- | ------------ | -------------------- |
| 🚽     | First Flush  | Log your first break |
| 💯     | Century Club | 100 breaks           |
| 👑     | Grand Master | 1,000 breaks         |

### Streaks

| Badge | Name         | Requirement   |
| ----- | ------------ | ------------- |
| ⚔️     | Week Warrior | 7-day streak  |
| 📅     | Month Master | 30-day streak |

### Behavioral

| Badge | Name             | Requirement                    |
| ----- | ---------------- | ------------------------------ |
| 🛡️     | Bladder of Steel | Snooze 3 times before breaking |
| 🌊     | Aquaholic        | 20+ breaks in one day          |

There are also some hidden badges that unlock at specific times.

---

## Data Storage

Everything stays on your machine in `~/.peemodoro/`:

| File          | Purpose                                       |
| ------------- | --------------------------------------------- |
| `state.json`  | Current timer state (synced across terminals) |
| `history.db`  | Break history and statistics                  |
| `config.json` | Your preferences                              |

---

## Contributing

```bash
git clone https://github.com/alecdewitz/peemodoro.git
cd peemodoro
npm install
npm run dev
```

---

<p align="center">
  <em>Built for developers who forget they have bodies.</em>
</p>
