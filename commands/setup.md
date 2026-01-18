---
description: Configure peemodoro statusline and hooks for Claude Code
allowed-tools: Bash
---

# Setup Peemodoro

Run this command to configure peemodoro for Claude Code:

```bash
peemodoro setup
```

This will:
- Install the statusline integration (shows timer in Claude Code)
- Install session hooks (tracks focus time)
- Enable auto-update (updates peemodoro on each new Claude Code session)

Display the output to confirm setup was successful. Remind the user to restart Claude Code to activate the statusline.

Then start the timer:

```bash
peemodoro start
```

Display the output to confirm the timer has started.
