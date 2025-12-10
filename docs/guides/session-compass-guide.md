# 🧭 Session Compass - User Guide

> **Part of VERSATIL Pulse System** - Real-time framework usage tracking and session context

**Purpose**: Provide comprehensive development context on every Cursor/Claude session opening

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Features](#features)
4. [Command Usage](#command-usage)
5. [Output Format](#output-format)
6. [Integration](#integration)
7. [Architecture](#architecture)
8. [Configuration](#configuration)
9. [Troubleshooting](#troubleshooting)
10. [API Reference](#api-reference)

---

## Overview

### What is Session Compass?

Session Compass is the **Session Opening Hook** component of the VERSATIL Pulse System. It automatically displays comprehensive development context when you open a Cursor workspace or Claude tab.

**Key Questions Answered**:
- ✅ **Where am I?** - Project, branch, git status, last session summary
- ✅ **What am I working on?** - Active feature, phases with progress/ETA
- ✅ **What's next?** - Prioritized tasks (high/medium/low priority)
- ✅ **Can I parallelize?** - Tasks that can run simultaneously
- ✅ **Do I have context?** - Context budget (tokens available vs needed)
- ✅ **Three-tier status?** - Backend/database/frontend progress and blockers
- ✅ **Framework health?** - Quick stats, agents active, build/test status

### Why Session Compass?

**Problem**: Every time you open Cursor, you waste 5-10 minutes:
- Checking git status
- Reading last commit messages
- Remembering what you were working on
- Planning what to do next
- Checking if builds/tests are passing

**Solution**: Session Compass provides instant context overview in <5 seconds

**Time Saved**: ~7 minutes per session opening × 10 sessions/day = **70 minutes/day saved**

---

## Quick Start

### 1. Test Session Compass

```bash
# Brief summary (recommended for first test)
ppnpm session:compass:brief

# Full overview
ppnpm session:compass

# JSON output
ppnpm session:compass -- --json

# Watch mode (refresh every 60s)
ppnpm session:compass:watch
```

### 2. Add to Cursor Hooks (Automatic on Project Open)

**Edit**: `~/.cursor/hooks.json`

```json
{
  "version": 1,
  "hooks": {
    "afterWorkspaceOpen": [
      {
        "command": "ppnpm session:compass:brief",
        "description": "Show session overview on project open"
      }
    ]
  }
}
```

**Result**: Every time you open this project in Cursor, you'll see:
- Last session summary (time saved, impact score)
- Current git status
- Next high-priority task
- Framework health snapshot

### 3. Use /context Command

In Claude conversation:

```
/context
```

Shows full session overview without leaving chat.

```
/context --brief
```

Shows condensed summary.

---

## Features

### 1. Project Context

**What it shows**:
- Project name
- Current branch
- Git status (clean, modified files, untracked files)
- Last session summary (when it was, time saved, impact score)

**Example**:
```
📁 Project: VERSATIL SDLC FW
🌿 Branch: main
📊 Git: ⚠️ 3 modified, 2 untracked
⏰ Last Session: 21m ago (saved 104 min, score: 7.1/10)
```

### 2. Main Plan Summary

**What it shows**:
- Active feature being developed
- Current status (in_progress, completed, etc.)
- Agents working on this feature
- Phases with progress bars and ETAs
- Total ETA for feature completion

**Example**:
```
🎯 Main Plan: Session Compass Implementation
Status: 🔄 in_progress
Agents: Sarah-PM, Marcus-Backend
Total ETA: 4 hours

Phases:
  ✅ Phase 1: Session Opening Hook
     ██████████████████ 60% │ ETA: 1 hour
  ⏸️ Phase 2: Three-Tier Status Tracker
     ░░░░░░░░░░░░░░░░░░ 0% │ ETA: 3 hours
```

### 3. Task Prioritization

**What it shows**:
- Tasks grouped by priority (high/medium/low)
- Assigned agent for each task
- ETA for completion
- Context tokens needed
- Dependencies between tasks
- Parallel execution opportunities

**Example**:
```
📋 Task Prioritization:

🔴 High Priority (2):
  • Create /context command for manual session overview
    Marcus-Backend │ ETA: 20 minutes │ Context: 5,000 tokens │ ✓ Can parallel
  • Create session-compass.cjs CLI script
    Sarah-PM │ ETA: 30 minutes │ Depends on: COMPASS-2
```

### 4. Parallel Execution Opportunities

**What it shows**:
- Which tasks can run simultaneously
- Which agents can work in parallel
- Time saved by parallelizing
- Context tokens required for parallel execution

**Example**:
```
⚡ Parallel Execution Opportunities:

  ✓ Run tasks COMPASS-2, COMPASS-3, COMPASS-4 in parallel
    Agents: Marcus-Backend, Sarah-PM
    Time Saved: 40 minutes
    Context Required: 15,000 tokens
```

### 5. Context Budget

**What it shows**:
- Total context tokens available (200k)
- Tokens allocated to current tasks
- Reserved tokens (emergency buffer)
- Remaining tokens available
- Status (healthy/warning/critical)
- Progress bar showing usage %

**Example**:
```
🧠 Context Budget:

  🟢 HEALTHY - Plenty of context available for all tasks
  Available: 200,000 tokens
  Allocated: 45,000 tokens
  Reserved:  15,000 tokens
  Remaining: 140,000 tokens

  ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 30% used
```

**Context Status Levels**:
- 🟢 **Healthy** (<70% used): All prioritized tasks fit in context
- 🟡 **Warning** (70-85% used): Defer low-priority tasks, clear old tool uses
- 🔴 **Critical** (>85% used): Emergency context compaction triggered

### 6. Three-Tier Architecture Status

**What it shows** (for each tier: backend, database, frontend):
- Progress percentage and completion count
- Next task to work on
- Recommendation for improvement
- Health status (excellent/good/needs_attention/blocked)
- Blockers (if any)

**Example**:
```
🏗️  Three-Tier Architecture Status:

  💻 Backend (Marcus):
     🟢 ██████████████████ 60% (3/5)
     Next: Create SessionCompass CLI script
     💡 Complete SessionCompass class first

  🗄️  Database (Dana):
     🔴 ░░░░░░░░░░░░░░░░░░ 0% - Not started
     💡 No database changes needed for Session Compass
     ⚠️ Blockers: No database schema found

  🎨 Frontend (James):
     🟡 ████████░░░░░░░░░░ 40% (2/5)
     Next: Create Cursor status bar integration
     💡 Wait for Phase 2 (Cursor Status Bar Extension)
```

**Health Indicators**:
- ✅ **Excellent** (80-100%): Tier is on track
- 🟢 **Good** (50-79%): Tier progressing well
- 🟡 **Needs Attention** (1-49%): Tier falling behind
- 🔴 **Blocked** (0% or blockers present): Tier cannot proceed

### 7. Quick Stats

**What it shows**:
- Framework health score (0-100%)
- Active agents count
- Pending todos count
- Git status (clean, uncommitted changes, ahead/behind)
- Build status (passing, failing, unknown)
- Test status (passing, failing, unknown)

**Example**:
```
📊 Quick Stats:

  Framework Health: 🟢 87%
  Active Agents:    2/17
  Pending Todos:    9
  Git Status:       uncommitted changes
  Build Status:     ✅ passing
  Test Status:      ✅ passing
```

---

## Command Usage

### npm Scripts

```bash
# Full overview (default)
ppnpm session:compass

# Brief summary (recommended for quick checks)
ppnpm session:compass:brief

# Watch mode (refresh every 60 seconds)
ppnpm session:compass:watch
```

### Direct Script Execution

```bash
# Full overview
node scripts/session-compass.cjs

# Brief mode
node scripts/session-compass.cjs --brief

# JSON output
node scripts/session-compass.cjs --json

# Watch mode
node scripts/session-compass.cjs --watch

# Help
node scripts/session-compass.cjs --help
```

### Flags

| Flag | Description |
|------|-------------|
| `--brief` | Show condensed summary (project context + next task) |
| `--json` | Output as JSON for programmatic use |
| `--watch` | Watch mode - refresh every 60 seconds |
| `--help` | Show help message |

---

## Output Format

### Text Format (Default)

**Sections** (in order):
1. Project Context (name, branch, git, last session)
2. Main Plan Summary (active feature, phases, ETA)
3. Task Prioritization (high/medium/low tasks)
4. Parallel Execution Opportunities
5. Context Budget (tokens available/used)
6. Three-Tier Architecture Status
7. Quick Stats

**Color Coding**:
- 🟢 Green: Excellent/healthy/passing
- 🟡 Yellow: Good/warning/needs attention
- 🔴 Red: Critical/failing/blocked
- 🔵 Blue: Info/in progress
- ⚪ Gray: Dim/completed/metadata

### Brief Format (--brief)

**Sections** (condensed):
1. Project Context (name, branch, git)
2. Quick Status (health, agents, tasks, context)
3. Next High-Priority Task

**Use Case**: Quick check when opening project, perfect for Cursor hooks

### JSON Format (--json)

**Structure**:
```json
{
  "projectContext": {
    "projectName": "string",
    "branch": "string",
    "gitStatus": {
      "clean": boolean,
      "ahead": number,
      "behind": number,
      "modified": number,
      "untracked": number
    },
    "lastSession": {
      "when": "string",
      "timeSaved": number,
      "impactScore": number
    } | null
  },
  "mainPlan": {
    "activeFeature": "string" | null,
    "status": "string",
    "agentsWorking": ["string"],
    "phases": [
      {
        "number": number,
        "name": "string",
        "status": "completed" | "in_progress" | "pending",
        "progress": number,
        "eta": "string"
      }
    ],
    "totalETA": "string"
  },
  "taskPriority": {
    "high": [Task],
    "medium": [Task],
    "low": [Task]
  },
  "parallelOpportunities": [
    {
      "tasks": ["string"],
      "agents": ["string"],
      "timeSaved": "string",
      "contextRequired": number
    }
  ],
  "contextBudget": {
    "available": number,
    "allocated": number,
    "reserved": number,
    "remaining": number,
    "status": "healthy" | "warning" | "critical",
    "message": "string"
  },
  "threeTierStatus": {
    "backend": TierStatus,
    "database": TierStatus,
    "frontend": TierStatus
  },
  "quickStats": {
    "frameworkHealth": number,
    "activeAgents": number,
    "pendingTodos": number,
    "gitStatus": "string",
    "buildStatus": "string",
    "testStatus": "string"
  }
}
```

**Use Case**: Integrate with CI/CD, dashboards, or custom tooling

---

## Integration

### 1. Cursor Hooks (Recommended)

**Automatic session overview on project open**:

`~/.cursor/hooks.json`:
```json
{
  "version": 1,
  "hooks": {
    "afterWorkspaceOpen": [
      {
        "command": "ppnpm session:compass:brief",
        "description": "Show session overview on project open"
      }
    ]
  }
}
```

**Trigger**: Every time you open Cursor workspace
**Duration**: <5 seconds
**Output**: Brief summary in terminal

### 2. /context Command

**Manual invocation in Claude chat**:

```
/context
```

Shows full session overview.

**Configuration**: `.claude/commands/context.md`

### 3. npm Scripts

**Quick access from terminal**:

```bash
# After opening terminal
ppnpm session:compass:brief
```

**Add alias** (optional):
```bash
# In ~/.bashrc or ~/.zshrc
alias compass="ppnpm session:compass:brief"
```

### 4. Watch Mode (Background Monitoring)

**Continuous monitoring**:

```bash
# Start watch mode
ppnpm session:compass:watch

# Opens continuous dashboard refreshing every 60s
# Press Ctrl+C to stop
```

**Use Case**: Keep terminal open during development for live status

---

## Architecture

### Data Sources

Session Compass aggregates data from **7 systems**:

```
┌─────────────────────────────────────────────────────────┐
│                  SESSION COMPASS                        │
│                   (Aggregator)                          │
└─────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
    ┌────▼────┐                    ┌────▼────┐
    │ SESSION │                    │  TASK   │
    │ MANAGER │                    │ PLANNER │
    └────┬────┘                    └────┬────┘
         │                               │
    ┌────▼────┐                    ┌────▼────┐
    │ CONTEXT │                    │ 3-TIER  │
    │SENTINEL │                    │TRACKER  │
    └────┬────┘                    └────┬────┘
         │                               │
    ┌────▼────┐                    ┌────▼────┐
    │  USAGE  │                    │DIAGRAM  │
    │ LOGGER  │                    │  GEN    │
    └────┬────┘                    └────┬────┘
         │                               │
         └───────────────┬───────────────┘
                         │
                    ┌────▼────┐
                    │   GIT   │
                    │  STATUS │
                    └─────────┘
```

**Data Flow**:
1. SessionCompass calls all 7 data sources in parallel
2. Each source provides its specialized data
3. SessionCompass aggregates into unified view
4. Output formatter renders as text/JSON/markdown

### File Structure

```
VERSATIL SDLC FW/
├── src/
│   └── tracking/
│       ├── session-compass.ts          # Main aggregator (580+ lines)
│       ├── three-tier-status-tracker.ts # Backend/DB/Frontend monitor
│       ├── session-manager.ts          # Session metrics (Phase 1)
│       └── usage-logger.ts             # Agent activation logging (Phase 1)
├── scripts/
│   ├── session-compass.cjs             # CLI script (479 lines)
│   ├── session-summary.cjs             # Historical summaries (Phase 1)
│   └── context-stats.cjs               # Context management stats
├── .claude/
│   └── commands/
│       └── context.md                  # /context command definition
└── docs/
    └── guides/
        └── session-compass-guide.md    # This file
```

### Dependencies

**Required**:
- `SessionManager` - Last session metrics
- `UsageLogger` - Agent activation tracking
- `git` - Branch and status detection

**Optional** (graceful fallback to mock data):
- `TaskPlanManager` - Active feature and phases
- `ContextSentinel` - Real-time context monitoring
- `ThreeTierStatusTracker` - Backend/database/frontend status
- `DiagramGenerator` - Gantt charts

**Build**:
- TypeScript compilation: `ppnpm build`
- Fallback to mock data if not built

---

## Configuration

### Mock Data vs Real Data

Session Compass works **without building TypeScript** by using mock data:

```bash
# No build - uses mock data
ppnpm session:compass:brief
# Output: (Using mock data - run 'ppnpm build' for real-time data)

# After build - uses real data
ppnpm build
ppnpm session:compass:brief
# Output: Real-time data from all 7 sources
```

**Mock Data Source**: `scripts/session-compass.cjs` (fallback function)

### Customizing Output

**Edit Brief Mode Content**:

`scripts/session-compass.cjs`:
```javascript
if (flags.brief) {
  // Customize brief output here
  output += `Custom brief content...`;
}
```

**Edit Full Mode Sections**:

`scripts/session-compass.cjs`:
```javascript
function formatAsText(data, brief = false) {
  // Customize full output sections here
}
```

### Changing Refresh Interval (Watch Mode)

Default: 60 seconds

`scripts/session-compass.cjs`:
```javascript
setInterval(async () => {
  // Change 60000 to desired milliseconds
}, 60000);
```

---

## Troubleshooting

### "Using mock data" Message

**Cause**: TypeScript files not compiled to `dist/`

**Fix**:
```bash
ppnpm build
```

**Why**: SessionCompass is written in TypeScript but CLI script is CommonJS. Must compile first.

**Workaround**: Mock data provides realistic example output for testing

### No Last Session Data

**Cause**: First time using VERSATIL Pulse

**Fix**: Complete one session with agent activations

**Result**: After first session, last session summary will appear

### Context Budget Shows "Unknown"

**Cause**: ContextSentinel not initialized or not running

**Fix**:
```bash
# Check if ContextSentinel is active
ppnpm monitor

# Restart framework
ppnpm build
ppnpm session:compass
```

### Git Status Not Showing

**Cause**: Not in a git repository

**Fix**: Initialize git in project:
```bash
git init
git add .
git commit -m "Initial commit"
```

### Three-Tier Status Shows 0% for All Tiers

**Cause**: No `todos/*.md` files with tier-specific tasks

**Fix**: Create todos with tier keywords:
```bash
mkdir -p todos

# Backend tasks
echo "- [ ] Implement API endpoint" > todos/001-backend-api.md

# Database tasks
echo "- [ ] Create users table" > todos/002-database-schema.md

# Frontend tasks
echo "- [ ] Build LoginForm component" > todos/003-frontend-ui.md
```

**Tier Detection**:
- Backend: `backend`, `api`, `marcus` in filename
- Database: `database`, `db`, `dana` in filename
- Frontend: `frontend`, `ui`, `james` in filename

---

## API Reference

### SessionCompass Class

**Location**: `src/tracking/session-compass.ts`

#### Constructor

```typescript
constructor()
```

No parameters required.

#### Methods

##### `generateOverview()`

```typescript
async generateOverview(): Promise<SessionCompassData>
```

Generates comprehensive session overview by aggregating all 7 data sources.

**Returns**: `SessionCompassData` object with all sections

**Example**:
```typescript
import { SessionCompass } from './src/tracking/session-compass.js';

const compass = new SessionCompass();
const overview = await compass.generateOverview();

console.log(overview.projectContext.branch); // "main"
console.log(overview.contextBudget.remaining); // 140000
```

##### `formatAsText()`

```typescript
formatAsText(data: SessionCompassData, brief?: boolean): string
```

Formats overview as ANSI-colored terminal output.

**Parameters**:
- `data`: SessionCompassData from `generateOverview()`
- `brief`: Optional boolean (default false) - use brief format

**Returns**: Formatted string with ANSI color codes

**Example**:
```typescript
const data = await compass.generateOverview();
const text = compass.formatAsText(data);
console.log(text); // Shows colored terminal output
```

##### `formatAsJSON()`

```typescript
formatAsJSON(data: SessionCompassData): string
```

Formats overview as JSON string.

**Parameters**:
- `data`: SessionCompassData from `generateOverview()`

**Returns**: Formatted JSON string (pretty-printed)

**Example**:
```typescript
const data = await compass.generateOverview();
const json = compass.formatAsJSON(data);
fs.writeFileSync('session-state.json', json);
```

##### `formatAsMarkdown()`

```typescript
formatAsMarkdown(data: SessionCompassData): string
```

Formats overview as Markdown documentation.

**Parameters**:
- `data`: SessionCompassData from `generateOverview()`

**Returns**: Formatted Markdown string

**Example**:
```typescript
const data = await compass.generateOverview();
const md = compass.formatAsMarkdown(data);
fs.writeFileSync('session-report.md', md);
```

---

### ThreeTierStatusTracker Class

**Location**: `src/tracking/three-tier-status-tracker.ts`

#### Constructor

```typescript
constructor(projectRoot?: string)
```

**Parameters**:
- `projectRoot`: Optional project root path (default: `process.cwd()`)

#### Methods

##### `getStatus()`

```typescript
async getStatus(): Promise<ThreeTierStatus>
```

Gets comprehensive three-tier status for backend, database, frontend.

**Returns**: `ThreeTierStatus` object

**Example**:
```typescript
import { getThreeTierStatusTracker } from './src/tracking/three-tier-status-tracker.js';

const tracker = getThreeTierStatusTracker();
const status = await tracker.getStatus();

console.log(status.backend.progress); // 60
console.log(status.database.recommendation); // "Add RLS policies"
```

##### `getStatusSummary()`

```typescript
async getStatusSummary(): Promise<string>
```

Gets text summary of three-tier status with progress bars.

**Returns**: Formatted text string

**Example**:
```typescript
const summary = await tracker.getStatusSummary();
console.log(summary);
// Output:
// 💻 Backend (Marcus): 🟢 ████████ 60%
//    Next: Create API endpoint
```

---

## See Also

- **VERSATIL Pulse Guide**: `docs/guides/usage-tracking-integration.md` (Phase 1)
- **Session Summaries**: `ppnpm session:summary` (historical tracking)
- **Context Stats**: `ppnpm context:stats` (context management)
- **Monitoring Dashboard**: `ppnpm dashboard` (real-time framework health)
- **Claude Commands**: `.claude/commands/context.md` (/context command)

---

**Version**: 6.4.1
**Part of**: VERSATIL Pulse System (Phase 2: Session Opening Hook)
**Status**: ✅ Implemented
**Created**: 2025-10-19
**Last Updated**: 2025-10-19
