# VERSATIL Framework Installation Guide

**Version**: 7.16.1 | **Last Updated**: 2025-10-31

Choose your installation path based on how you want to use VERSATIL:

---

## Choose Your Path

### 🎯 Path 1: npx (Recommended - MCP Server)
**Best for**: Claude Desktop + Cursor IDE users
**Installation Time**: 2-3 minutes (first run)
**Requirements**: Node.js 18+

**Why npx?**
- ⚡ Fast: 2-3 min vs 10-15 min pnpm install
- ✅ Simple: One command, no global install
- 🔒 Clean: No dependencies in your project
- 🚀 Always latest: Pin to specific versions

[→ Jump to npx Setup](#npx-setup-recommended)

---

### 🛠️ Path 2: Development Setup
**Best for**: Framework development, customization
**Installation Time**: 10-15 minutes
**Requirements**: Node.js 18+, npm 9+, Git

[→ Jump to Development Setup](#development-setup)

---

### 🖥️ Path 3: Global CLI Installation
**Best for**: Terminal workflows, automation scripts
**Installation Time**: 10-15 minutes
**Requirements**: Node.js 18+, npm 9+, Git

[→ Jump to CLI Installation](#cli-installation)

---

## npx Setup (Recommended)

### Prerequisites

- **Node.js** 18.0.0+ ([download](https://nodejs.org))
- **Claude Desktop** installed ([download](https://claude.ai/download)) *optional*
- **Cursor IDE** installed ([download](https://cursor.sh)) *optional*

### Quick Start

```bash
# Run VERSATIL MCP Server
npx --yes --package=github:Nissimmiracles/versatil-sdlc-framework#v7.16.1 versatil-mcp

# That's it! The MCP server is now running
```

**First run**: 2-3 minutes (downloads and caches)
**Subsequent runs**: Instant (uses cache)

### Configure Claude Desktop

Add VERSATIL MCP to your Claude Desktop config:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "versatil": {
      "command": "npx",
      "args": [
        "--yes",
        "--package=github:Nissimmiracles/versatil-sdlc-framework#v7.16.1",
        "versatil-mcp"
      ]
    }
  }
}
```

### Configure Cursor IDE (Optional)

Add to `.cursor/mcp_config.json` in your project:

```json
{
  "mcpServers": {
    "versatil": {
      "command": "npx",
      "args": [
        "--yes",
        "--package=github:Nissimmiracles/versatil-sdlc-framework#v7.16.1",
        "versatil-mcp"
      ]
    }
  }
}
```

### Restart and Verify

```bash
# macOS
killall "Claude" "Cursor"
open -a "Claude"
open -a "Cursor"

# Or manually quit and reopen both applications
```

In Claude Desktop, try:
```
Call versatil_health_check
```

Expected response:
```json
{
  "status": "healthy",
  "version": "7.16.1",
  "profile": "coding",
  "tools": 32,
  "startupTime": "<10ms"
}
```

### Version Pinning

```bash
# Use specific version (recommended)
npx --package=github:Nissimmiracles/versatil-sdlc-framework#v7.16.1 versatil-mcp

# Use latest from main branch
npx --package=github:Nissimmiracles/versatil-sdlc-framework#main versatil-mcp

# Use specific commit
npx --package=github:Nissimmiracles/versatil-sdlc-framework#8d8ff99 versatil-mcp
```

---

## Development Setup

For framework development or customization:

### Step 1: Clone Repository

```bash
git clone https://github.com/Nissimmiracles/versatil-sdlc-framework.git
cd versatil-sdlc-framework
```

### Step 2: Install Dependencies

```bash
ppnpm install
ppnpm build
```

**Time**: 10-15 minutes (downloads ~1-2GB dependencies)

**Note**: The framework uses pnpm@10.17.0 for development. Install pnpm: `pnpm add -g pnpm`

### Step 3: Verify Build

```bash
# Check build output
ls -la dist/

# Test MCP server
node bin/versatil-mcp.js
```

---

## CLI Installation

For global CLI tool access (not typical for MCP use):

### Prerequisites

- **Node.js** 18.0.0+ ([download](https://nodejs.org))
- **pnpm** 10.17.0+ (`pnpm add -g pnpm`)
- **Git** (for cloning repository)

### Step 1: Clone and Install

```bash
# Clone repository
git clone https://github.com/Nissimmiracles/versatil-sdlc-framework.git
cd versatil-sdlc-framework

# Install dependencies and build
ppnpm install
ppnpm build

# Link globally
npm link

# Verify installation
versatil --version
# Expected: 7.16.2
```

**Time**: 10-15 minutes

### Step 2: Use CLI Commands

```bash
# Run MCP server
versatil-mcp

# Other CLI tools
versatil --help
versatil-daemon start
versatil-config
```

**Note**: Most users should use [npx setup](#npx-setup-recommended) instead of global CLI installation.

**Alternative**: Use npx (no installation required)
```bash
npx @versatil/sdlc-framework init
```

### Step 2: Initialize Your Project

Navigate to your project directory and initialize VERSATIL:

```bash
cd /path/to/your/project
versatil init
```

**What `versatil init` does:**
1. ✅ Auto-detects your tech stack (React, Vue, Python, Node.js, etc.)
2. ✅ Recommends relevant agents from 18 available
3. ✅ Generates personalized 4-week roadmap (`docs/VERSATIL_ROADMAP.md`)
4. ✅ Creates `.versatil/config.json` configuration
5. ✅ Sets up quality gates (80%+ test coverage, WCAG 2.1 AA)

### Step 3: Configure Environment (Optional)

Create `.env` in your project root:

```bash
cat > .env << 'EOF'
# Framework Settings
VERSATIL_LOG_LEVEL=info
VERSATIL_AUTO_ACTIVATE=true
VERSATIL_MCP_ENABLED=false  # Set to true if using MCP

# Agent Settings
VERSATIL_AGENT_TIMEOUT=30000
VERSATIL_QUALITY_GATES=strict

# Optional: External Services
# GITHUB_TOKEN=your_github_token
# SUPABASE_URL=your_supabase_url
# SUPABASE_KEY=your_supabase_key
EOF
```

### Step 4: Start Daemon (Optional - For Auto-Activation)

```bash
# Start daemon (agents auto-activate on file saves)
versatil-daemon start

# Check status
versatil-daemon status
# Expected: ✅ Daemon running (PID: xxxxx)
```

**What the daemon does:**
- 👀 Watches project files
- 🤖 Auto-activates relevant agents when you save files
- ⚡ Runs quality gates before commits
- 📊 Provides real-time feedback

### Step 5: Verify Installation

```bash
# Run comprehensive health check
versatil doctor

# Expected output:
# ✅ Framework Status: OPERATIONAL
# ✅ Agents: 18/18 configured
# ✅ MCP Tools: 0/12 (CLI mode - MCP disabled)
# ✅ RAG Memory: Ready
# ✅ Quality Gates: Enforced
```

### Step 6: Test Basic Commands

```bash
# View available agents
versatil show-agents

# Generate development plan
versatil plan "Add user authentication"

# Execute work
versatil work todos/001-auth.md

# Check framework health
versatil doctor
```

---

## Verification

### Common Checks (Both Paths)

After installation, verify these items:

#### 1. Framework Health
```bash
ppnpm doctor  # (Cursor path)
versatil doctor  # (CLI path)

# Should show:
# ✅ All systems operational
# ✅ Agents configured
# ✅ Quality gates active
```

#### 2. Build Status
```bash
ppnpm build  # (Cursor path)
# No TypeScript errors
```

#### 3. Test Suite
```bash
ppnpm test  # (Cursor path)
versatil test  # (CLI path)

# All tests should pass
```

#### 4. MCP Server (Cursor Path Only)
```bash
tail -f ~/.versatil/mcp-server.log

# Expected:
# ✅ MCP Server running
# ✅ Startup time: <500ms
```

#### 5. Agent Auto-Activation (Both Paths)
```bash
# Create test file
echo "describe('test', () => {})" > test.spec.ts

# Check logs
tail -f ~/.versatil/logs/agent-activation.log

# Expected:
# [timestamp] 🤖 Maria-QA activated (trigger: test.spec.ts)
```

---

## Troubleshooting

### Issue: pnpm install fails

**Symptoms**: Package installation errors, network timeouts

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
pnpm install --verbose
```

---

### Issue: MCP server timeout (Cursor Path)

**Symptoms**: Claude Desktop shows "MCP server timeout"

**Solution**:
```bash
# Check server logs
tail -f ~/.versatil/mcp-server.log

# Reapply config fix
node scripts/fix-mcp-configs.cjs

# Restart clients
killall "Claude" "Cursor"
open -a "Claude"
```

**Expected**: Server should start in <500ms

---

### Issue: Agents not auto-activating

**Symptoms**: No agent activation on file save

**Solution**:
```bash
# Check daemon status
versatil-daemon status

# View logs
versatil-daemon logs

# Restart daemon
versatil-daemon restart
```

---

### Issue: Tests failing

**Symptoms**: Jest test failures, Playwright errors

**Solution**:
```bash
# Install Playwright browsers
ppnpm playwright:install

# Run tests individually
pppnpm test:unit           # Should pass
pppnpm test:integration    # May require setup
pppnpm test:e2e           # Requires Playwright
```

---

## Next Steps

### For Cursor Users

1. **Try Slash Commands** in Claude Desktop:
   ```
   /help                    # Framework help
   /plan "feature"         # Generate plan
   /work todos/xxx.md      # Execute work
   /monitor                # Health monitoring
   ```

2. **Review Your Roadmap**:
   ```bash
   cat docs/VERSATIL_ROADMAP.md
   ```

3. **Test Agent Auto-Activation**:
   - Edit a `*.test.ts` file → Maria-QA activates
   - Edit a `*.tsx` file → James-Frontend activates
   - Edit an API file → Marcus-Backend activates

### For CLI Users

1. **Generate Development Plan**:
   ```bash
   versatil plan "Add user authentication"
   ```

2. **Execute Work**:
   ```bash
   versatil work todos/001-auth.md
   ```

3. **Monitor Framework Health**:
   ```bash
   versatil monitor
   # Real-time TUI dashboard
   ```

4. **View Your Roadmap**:
   ```bash
   cat docs/VERSATIL_ROADMAP.md
   ```

---

## Additional Resources

### Documentation
- **[README.md](../README.md)** - Framework overview
- **[CLAUDE.md](../CLAUDE.md)** - OPERA methodology
- **[docs/VERSATIL_ARCHITECTURE.md](VERSATIL_ARCHITECTURE.md)** - Architecture guide
- **[docs/guides/compounding-engineering.md](guides/compounding-engineering.md)** - Compounding engineering

### Support
- **GitHub Issues**: [Report bugs](https://github.com/Nissimmiracles/versatil-sdlc-framework/issues)
- **Discussions**: [Ask questions](https://github.com/Nissimmiracles/versatil-sdlc-framework/discussions)

---

## Success Checklist

- [ ] Prerequisites installed (Node.js 18+, npm 9+)
- [ ] Repository cloned or npm package installed
- [ ] Dependencies installed successfully
- [ ] Build completed without errors
- [ ] Health check passes (`ppnpm doctor` or `versatil doctor`)
- [ ] MCP server running <500ms (Cursor path only)
- [ ] Agents can be invoked manually
- [ ] Tests pass
- [ ] Roadmap generated

**Estimated Total Time**:
- Cursor Path: ~10 minutes
- CLI Path: ~8 minutes

---

**Welcome to VERSATIL!** 🚀 Your AI-native SDLC framework is ready.
