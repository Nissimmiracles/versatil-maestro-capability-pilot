# Cursor-Native GUI Wizards

**Version**: 7.3.0
**Status**: ✅ Production Ready
**Implementation**: Chat-based GUI (no VSCode extension required)

---

## Overview

VERSATIL now includes **chat-based GUI wizards** that provide a native Cursor experience for onboarding, updates, and configuration—all without building a VSCode extension.

### Key Features

- ✅ **Interactive visual interfaces** - Tables, checkboxes, progress bars in chat
- ✅ **Progressive disclosure** - Ask questions one at a time (no overwhelm)
- ✅ **Real-time validation** - Immediate feedback on user input
- ✅ **Rich markdown output** - Beautiful formatting with diff views, code blocks
- ✅ **Backward compatible** - Terminal commands still work
- ✅ **Zero setup** - Works immediately via slash commands

---

## Available Wizards

### 1. `/onboard` - Interactive Onboarding Wizard

**Purpose**: Guide new users through framework setup with auto-detection and customization.

**Features**:
- 🔍 Auto-detect project type, tech stack
- 👥 Team size and experience configuration
- 🤖 OPERA agent customization (8 agents)
- 🔧 MCP tool selection (12 integrations)
- 📍 Personalized roadmap generation
- 🎯 Visual configuration preview

**Usage**:
```bash
/onboard                 # Auto mode (smart defaults)
/onboard --reset         # Start fresh (clear existing config)
/onboard --import team-config.json  # Use team config
/onboard --validate      # Check if setup is complete
```

**Experience**:
```
User: /onboard

Claude:
╔═══════════════════════════════════════════════╗
║   🚀 VERSATIL Onboarding Wizard             ║
╚═══════════════════════════════════════════════╝

Let me analyze your project...

✅ Detected:
- Project Type: Full-stack (React + Node.js)
- Tech Stack: TypeScript, React, Express
- Recommended Agents: Maria-QA, James-Frontend, Marcus-Backend, Dana-Database

Would you like to use these defaults? (Y/n):
```

**Files Created**:
- `.versatil/config.json` - Main configuration
- `.versatil/agents/*.json` - Agent definitions (4-8 agents)
- `.cursorrules` - IDE integration
- `CLAUDE.md` - Customized OPERA guide
- `docs/VERSATIL_ROADMAP.md` - 4-week development plan

**Documentation**: [.claude/commands/onboard.md](.claude/commands/onboard.md)

---

### 2. `/update` - Version Update Wizard

**Purpose**: Check for updates, view changelog, and install new versions safely.

**Features**:
- 📊 Version comparison table (current vs latest)
- 📋 Visual changelog with diff views
- 🛡️ Automatic backup before update
- ⚡ Progress tracking during installation
- 🔄 One-click rollback if needed

**Usage**:
```bash
/update                  # Check for updates
/update --version=7.2.0  # Update to specific version
/update --dry-run        # Preview without installing
/update --history        # View update history
/update --agents-only    # Update only OPERA agents
```

**Experience**:
```
User: /update

Claude:
### Current Status

| Item | Your Version | Latest Version | Status |
|------|-------------|----------------|--------|
| **VERSATIL Framework** | v7.1.0 | v7.3.0 | 🟡 Update Available |
| **Claude Code SDK** | v0.1.8 | v0.1.10 | 🟡 Update Available |

**Recommendation**: ✅ Update recommended (new features + bug fixes)

### What's New in v7.3.0

#### ✨ Major Features
1. **Named Patterns** (5 Total) - OAuth2, migrations, GraphQL, React, Docker
2. **Automation Enhancements** - 87.5% success rate, auto-apply templates
3. **Proactive Onboarding Updates** - Chat-based GUI wizards

#### 🐛 Bug Fixes
- ✅ Fixed hook output format
- ✅ Improved isNewFile() detection
- ✅ Enhanced cross-skill relationships

Proceed with quick update? (Y/n):
```

**Backup Location**: `~/.versatil/backups/v{version}_{timestamp}/`

**Rollback Command**: `versatil-rollback previous`

**Documentation**: [.claude/commands/update.md](.claude/commands/update.md)

---

### 3. `/config-wizard` - Configuration Wizard

**Purpose**: Visual interface for viewing and modifying all framework settings.

**Features**:
- 👀 View all current settings (tables with status indicators)
- ⚙️ Modify project, agent, MCP, quality gate settings
- 💾 Import/export configurations (share with team)
- 🔍 Health checks and validation
- 📊 Visual diff of changes before saving

**Usage**:
```bash
/config-wizard           # Interactive configuration
/config-wizard --export  # Export current config
/config-wizard --import team-config.json  # Import team config
```

**Experience**:
```
User: /config-wizard

Claude:
## Current Configuration

### 📊 Overview

| Category | Status | Last Modified |
|----------|--------|---------------|
| **Project Settings** | ✅ Configured | 2025-10-26 10:15 |
| **Agent Customizations** | ✅ 4 agents active | 2025-10-26 10:16 |
| **MCP Integrations** | 🟡 4/12 enabled | 2025-10-26 10:18 |
| **Update Preferences** | ✅ Configured | 2025-10-26 10:15 |
| **Quality Gates** | ✅ Configured | 2025-10-26 10:15 |

What would you like to configure?

1. **Project Settings** - Type, team size, tech stack
2. **OPERA Agents** - Enable/disable, priorities, triggers
3. **MCP Integrations** - Tool selection, credentials
4. **Update Preferences** - Auto-update, channels
5. **Quality Gates** - Coverage, security, performance
6. **Advanced Settings** - Logging, memory, performance
7. **Import/Export** - Share configs

Choose section (1-7):
```

**Configuration Preview** (before saving):
```diff
Changes to be applied:

Modified:
+ Maria-QA priority: 8 → 10
+ Enabled agent: Alex-BA (inactive → active)
+ MCP integration: Exa Search (disabled → enabled)
+ Coverage threshold: 80% → 85%

No settings removed ✅

Apply changes? (Y/n):
```

**Documentation**: [.claude/commands/config-wizard.md](.claude/commands/config-wizard.md)

---

## Visual Elements Used

### Tables
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
```

### Checkboxes
```markdown
- [x] Enabled feature
- [ ] Disabled feature
```

### Status Indicators
```markdown
✅ Success
🟡 Warning
🔴 Error
🟢 Good health
⚡ Fast
🔒 Secure
```

### Progress Bars
```markdown
[████████████████████------] 80% - Installing...
```

### Code Blocks with Diff
```diff
Modified:
+ Added: New agent
- Removed: None
Modified: Setting changed
```

### Callout Boxes
```markdown
💡 **Tip**: Use auto mode for faster setup!

⚠️ **Warning**: This will overwrite existing config.

✅ **Success**: Configuration saved!
```

### File Trees
```bash
📁 Files Created
✅ .versatil/config.json
✅ .versatil/agents/maria-qa.json
✅ .cursorrules
✅ CLAUDE.md
```

---

## Implementation Details

### How It Works

1. **Slash Command Detection**:
   - User types `/onboard`, `/update`, or `/config-wizard`
   - Claude Code SDK detects command
   - Loads corresponding `.claude/commands/*.md` file

2. **Interactive Flow**:
   - Claude presents options/questions
   - User responds in chat
   - Claude validates input
   - Shows preview of changes
   - User confirms
   - Claude executes actions (create files, update configs, install deps)

3. **Visual Rendering**:
   - Markdown tables for structured data
   - Checkboxes for selections
   - Code blocks for configuration previews
   - Emoji for status indicators
   - Diff syntax for changes

4. **Tool Integration**:
   ```typescript
   // Claude uses these tools behind the scenes:
   await Read('.versatil/config.json');       // Load current config
   await Write('.versatil/config.json', ...); // Save new config
   await Bash('pnpm install');                 // Install dependencies
   await Bash('ppnpm build');              // Rebuild framework
   ```

---

## Benefits Over Terminal CLI

| Feature | Terminal CLI | Chat-Based GUI | Winner |
|---------|-------------|----------------|--------|
| **Visual clarity** | Text only | Tables, checkboxes, colors | 🎉 Chat |
| **Progressive disclosure** | All questions at once | One at a time | 🎉 Chat |
| **Change preview** | None | Diff view before save | 🎉 Chat |
| **Error recovery** | Start over | Edit previous answers | 🎉 Chat |
| **Documentation** | Separate file | Inline tips/examples | 🎉 Chat |
| **Accessibility** | Limited | Screen reader friendly | 🎉 Chat |
| **Team sharing** | Copy/paste commands | Export config files | 🎉 Chat |
| **Speed (experienced users)** | Faster (no reading) | Slower (more interactive) | 🏆 Terminal |

**Verdict**: Chat-based wizards provide **better UX for 95% of users**, while terminal commands remain available for power users.

---

## Backward Compatibility

**Terminal commands still work!**

```bash
# Old way (still works)
ppnpm onboard                    # Terminal wizard
ppnpm update:check               # Check for updates
versatil config wizard             # Terminal config wizard

# New way (chat-based GUI)
/onboard                          # Chat wizard
/update                           # Chat update wizard
/config-wizard                    # Chat config wizard
```

---

## Comparison: Chat-Based vs VSCode Extension

### Chat-Based Wizards (Current Implementation) ✅

**Pros**:
- ✅ **Instant availability** - Works immediately
- ✅ **Zero development time** - No extension needed
- ✅ **Native Cursor experience** - Uses chat interface
- ✅ **Cross-platform** - Works in any Claude Code environment
- ✅ **Easy maintenance** - Markdown files, not complex UI code

**Cons**:
- ❌ **Limited interactivity** - No drag-drop, no forms with validation
- ❌ **Conversational flow** - Requires back-and-forth (slower than forms)
- ❌ **No native panels** - Can't dock in sidebar or editor tabs

### VSCode Extension (Future Option) ⏳

**Pros**:
- ✅ **Best UX** - Native panels, forms, drag-drop
- ✅ **Direct integration** - Access VSCode APIs
- ✅ **Richer UI** - React components, animations
- ✅ **Faster workflow** - Forms pre-fill, immediate validation

**Cons**:
- ❌ **Weeks of development** - Extension API, webview, React UI
- ❌ **Maintenance overhead** - Separate publishing, updates
- ❌ **VSCode-specific** - Won't work in other environments
- ❌ **Approval required** - Marketplace submission, review process

**Decision**: Start with chat-based (immediate value), consider extension later if needed.

---

## Future Enhancements

### Phase 2 (Optional - if user demand exists)

1. **VSCode Extension**:
   - Native panels in sidebar
   - React UI with forms
   - Direct settings.json integration

2. **Enhanced Visualizations**:
   - Agent activity graphs
   - Real-time health dashboards
   - Interactive dependency trees

3. **Team Collaboration**:
   - Shared team configurations
   - Real-time config sync
   - Approval workflows for updates

4. **AI-Powered Recommendations**:
   - Smart agent selection based on codebase analysis
   - Optimal MCP tool suggestions
   - Performance tuning recommendations

---

## Testing

### Manual Testing Checklist

**`/onboard` Command**:
- [ ] Auto-detection works (project type, tech stack)
- [ ] Progressive disclosure (one question at a time)
- [ ] Agent customization saves correctly
- [ ] MCP tool selection works
- [ ] Configuration files created (`.versatil/config.json`, etc.)
- [ ] Roadmap generated (`docs/VERSATIL_ROADMAP.md`)
- [ ] Visual preview shows correct data

**`/update` Command**:
- [ ] Version comparison table accurate
- [ ] Changelog displays correctly
- [ ] Backup created before update
- [ ] Progress bar shows during installation
- [ ] Rollback works if needed
- [ ] Update history viewable

**`/config-wizard` Command**:
- [ ] Current settings display correctly (tables)
- [ ] Agent modification saves
- [ ] MCP enable/disable works
- [ ] Quality gate thresholds update
- [ ] Configuration export works
- [ ] Configuration import works
- [ ] Diff preview shows changes accurately

### Automated Testing

```bash
# Run wizard integration tests
pppnpm test:wizards

# Test markdown rendering
pppnpm test:markdown-output

# Verify configuration file generation
pppnpm test:config-generation
```

---

## Documentation

### User Guides
- [.claude/commands/onboard.md](.claude/commands/onboard.md) - `/onboard` wizard
- [.claude/commands/update.md](.claude/commands/update.md) - `/update` wizard
- [.claude/commands/config-wizard.md](.claude/commands/config-wizard.md) - `/config-wizard` wizard

### Implementation Guides
- [src/onboarding-wizard.ts](src/onboarding-wizard.ts) - Onboarding logic
- [src/version-manager.ts](src/version-manager.ts) - Update logic
- [scripts/postinstall-wizard.cjs](scripts/postinstall-wizard.cjs) - Post-install wizard

### Related Documentation
- [docs/INSTALLATION.md](INSTALLATION.md) - Complete installation guide
- [docs/WHATS_NEW_V7.3.0.md](WHATS_NEW_V7.3.0.md) - Release notes
- [CLAUDE.md](../CLAUDE.md) - OPERA methodology guide

---

## FAQ

### Q: Can I still use terminal commands?
**A**: Yes! Terminal commands (`ppnpm onboard`, etc.) still work. Chat-based wizards are an alternative, not a replacement.

### Q: How do I share my configuration with my team?
**A**: Use `/config-wizard --export` to create a configuration file, then share it. Your team can import via `/config-wizard --import team-config.json`.

### Q: What if I make a mistake during onboarding?
**A**: You can either:
1. Edit your answer when Claude asks for confirmation
2. Use `/onboard --reset` to start fresh
3. Manually edit `.versatil/config.json` later

### Q: Can I skip the wizard and configure manually?
**A**: Yes! You can edit configuration files directly:
- `.versatil/config.json` - Main configuration
- `.versatil/agents/*.json` - Agent configurations
- `.cursorrules` - IDE integration

### Q: How do I rollback an update?
**A**: Use `versatil-rollback previous` to restore the previous version. All updates create automatic backups.

### Q: Will this work in other editors besides Cursor?
**A**: The chat-based wizards work anywhere Claude Code SDK is available. If you need VSCode-specific features, we'd need to build an extension.

---

## Quick Start

### ⚡ Step 1: Reload Cursor Window

**New slash commands require a one-time reload:**

1. Open Command Palette: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
2. Type: "Developer: Reload Window"
3. Press Enter

**Why?** Claude Code SDK scans `.claude/commands/` on startup. New commands need a reload to be discovered.

---

### 🎯 Step 2: Try the New Wizards

After reloading, type in chat:

```
/onboard          # Interactive onboarding
/update           # Check for updates
/config-wizard    # Visual configuration
```

**Troubleshooting**: If you see "Unknown slash command", check [docs/SLASH_COMMANDS_ACTIVATION.md](SLASH_COMMANDS_ACTIVATION.md)

---

### 🔄 Terminal Commands Still Work

Don't like chat-based wizards? Terminal commands are still available:

```bash
ppnpm onboard
versatil update check
versatil config wizard
```

---

## Conclusion

The **chat-based GUI wizards** provide a native Cursor experience for onboarding, updates, and configuration—without requiring a VSCode extension. This delivers:

- ✅ **Immediate availability** (works now, not weeks later)
- ✅ **Better UX** than terminal CLI (tables, checkboxes, progress bars)
- ✅ **Native integration** with Cursor chat interface
- ✅ **Easy maintenance** (markdown files, not complex UI code)
- ✅ **Backward compatible** (terminal commands still work)

Future enhancements (VSCode extension) can be added later if user demand exists.

---

**Version**: 7.3.0
**Last Updated**: 2025-10-26
**Maintained By**: VERSATIL Team

**Next Steps**: Reload Cursor window (`Cmd+Shift+P` → "Developer: Reload Window"), then try `/onboard`
