---
description: Show or update peemodoro configuration
argument-hint: "[set <key> <value>]"
allowed-tools: Bash
---

# Peemodoro Configuration

To show current configuration:

```bash
peemodoro config
```

To change a setting:

```bash
peemodoro config set <key> <value>
```

Available keys:
- `mode` - Timer mode: classic (25/5), hydration (45/10), adaptive
- `work` - Work duration in minutes (1-120)
- `break` - Break duration in minutes (1-30)
- `sound` - Enable/disable sounds: on/off
- `notifications` - Enable/disable desktop notifications: on/off
