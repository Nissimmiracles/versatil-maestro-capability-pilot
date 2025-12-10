# OPERA Commands Reference

**VERSATIL SDLC Framework v5.0** - Complete Command Reference

OPERA (Orchestrated Project Evaluation & Recognition Algorithm) represents the VERSATIL 6-agent + 5-rule automation system. This document provides a complete reference for all framework commands, slash commands, and automation features.

---

## 📖 Table of Contents

1. [Core CLI Commands](#core-cli-commands)
2. [OPERA Slash Commands](#opera-slash-commands)
3. [Agent Commands](#agent-commands)
4. [Quality Gate Commands](#quality-gate-commands)
5. [MCP Integration Commands](#mcp-integration-commands)
6. [Configuration Commands](#configuration-commands)
7. [Diagnostic Commands](#diagnostic-commands)
8. [Git Workflow Commands](#git-workflow-commands)
9. [Command Output Examples](#command-output-examples)

---

## Core CLI Commands

### `versatil init`

**Description**: Interactive setup wizard with OPERA agent customization

**Usage**:
```bash
versatil init

# Advanced options:
versatil init --force                # Overwrite existing configuration
versatil init --template=enterprise  # Use enterprise template
versatil init --no-git-hooks        # Skip Git hooks installation
```

**What It Does**:
1. Detects your project type and tech stack
2. Creates `.versatil-project.json` configuration
3. Generates `.cursorrules` template (for Cursor IDE users)
4. Sets up `.cursor/settings.json` with agent auto-activation
5. Installs Git hooks for quality gates
6. Configures RAG memory system
7. Tests agent activation

**Output Example**:
```
🚀 VERSATIL Framework Setup Wizard

📁 Analyzing project structure...
   ✅ Detected: Full-stack project
   ✅ Frontend: React + TypeScript + Tailwind CSS
   ✅ Backend: Node.js + Express + PostgreSQL
   ✅ Testing: Jest + Playwright

🤖 Configuring agents...
   ✅ Maria-QA: Enabled (test coverage threshold: 80%)
   ✅ James-Frontend: Enabled (WCAG 2.1 AA)
   ✅ Marcus-Backend: Enabled (OWASP Top 10 2023)
   ✅ Sarah-PM: Enabled (14-day sprints)
   ✅ Alex-BA: Enabled (user story format)
   ✅ Dr.AI-ML: Disabled (not an AI/ML project)

📝 Creating configuration files...
   ✅ .versatil-project.json
   ✅ .cursorrules
   ✅ .cursor/settings.json

🔐 Setting up quality gates...
   ✅ Pre-commit hook installed
   ✅ Pre-push hook installed
   ✅ Coverage threshold: 80%

🧪 Testing agent activation...
   ✅ Maria-QA: Ready
   ✅ James-Frontend: Ready
   ✅ Marcus-Backend: Ready

✅ Setup complete! Start coding - agents will activate automatically.

Next steps:
  1. Edit a test file to verify Maria-QA activation
  2. Run: versatil test-activation
  3. Read: docs/CURSOR_INTEGRATION.md
```

---

### `versatil doctor`

**Description**: Run comprehensive health check and verification

**Usage**:
```bash
versatil doctor

# Options:
versatil doctor --fix                # Auto-fix issues
versatil doctor:install              # Diagnose installation issues
versatil doctor --verbose            # Detailed output
```

**What It Checks**:
- ✅ Framework installation and PATH
- ✅ Configuration files (.versatil-project.json, .cursorrules)
- ✅ Agent activation status
- ✅ Git hooks installation
- ✅ MCP server connection
- ✅ RAG memory system
- ✅ Dependencies and versions
- ✅ Quality gate configuration

**Output Example**:
```
🏥 VERSATIL Framework Health Check

Installation:
  ✅ Framework version: 4.1.0
  ✅ Node.js version: 20.10.0
  ✅ npm global bin: /usr/local/bin
  ✅ Command in PATH: versatil

Configuration:
  ✅ .versatil-project.json found
  ✅ .cursorrules found
  ✅ .cursor/settings.json found
  ⚠️  Warning: RAG memory not initialized (run: versatil init --force)

Agents:
  ✅ Maria-QA: Operational
  ✅ James-Frontend: Operational
  ✅ Marcus-Backend: Operational
  ✅ Sarah-PM: Operational
  ✅ Alex-BA: Operational
  ❌ Dr.AI-ML: Disabled (expected)

Quality Gates:
  ✅ Pre-commit hook: Installed
  ✅ Pre-push hook: Installed
  ✅ Coverage threshold: 80%

MCP Integration:
  ✅ MCP server: Running
  ✅ Claude Desktop: Connected
  ✅ Memory persistence: Active

Overall Health Score: 95/100 (Excellent)

Issues found: 1
  ⚠️  RAG memory not initialized

Suggested fixes:
  versatil init --force
```

---

### `versatil analyze`

**Description**: Analyze project and suggest additional agents

**Usage**:
```bash
versatil analyze

# Options:
versatil analyze --deep              # Deep code analysis
versatil analyze --output=json       # JSON output
```

**Output Example**:
```
🔍 Analyzing project for agent recommendations...

📊 Project Analysis Results:

File Types Detected:
  - TypeScript: 89 files
  - React Components: 45 files
  - Test Files: 67 files
  - API Routes: 23 files
  - Python: 0 files

💡 Recommended agents:

   • Maria-QA (95% confidence)
     Reason: 67 test files detected, current coverage: 72%
     Action: Enable comprehensive test coverage analysis

   • James-Frontend (92% confidence)
     Reason: 45 React components, accessibility checks needed
     Action: Enable WCAG 2.1 AA validation

   • Marcus-Backend (88% confidence)
     Reason: 23 API routes, security validation recommended
     Action: Enable OWASP Top 10 security scans

Agents NOT recommended:
   ✗ Dr.AI-ML (No ML code detected)

Current Setup: Optimal for your project ✅
```

---

### `versatil agents`

**Description**: List available agent templates and status

**Usage**:
```bash
versatil agents                      # List all agents
versatil agents --status            # Show activation status
versatil agents --watch             # Real-time monitoring
versatil agents --stats             # Performance statistics
```

**Output Example** (`versatil agents --status`):
```
🤖 VERSATIL Agent Status

┌─────────────────┬──────────┬───────────┬──────────────┐
│ Agent           │ Status   │ Active    │ Last Action  │
├─────────────────┼──────────┼───────────┼──────────────┤
│ Maria-QA        │ Ready    │ No        │ 5m ago       │
│ James-Frontend  │ Ready    │ No        │ 12m ago      │
│ Marcus-Backend  │ Running  │ Yes       │ 2s ago       │
│ Sarah-PM        │ Ready    │ No        │ 1h ago       │
│ Alex-BA         │ Ready    │ No        │ 3h ago       │
│ Dr.AI-ML        │ Disabled │ No        │ Never        │
└─────────────────┴──────────┴───────────┴──────────────┘

Currently Running Tasks:
🤖 Marcus-Backend: Running stress test on /api/auth/login (1000 requests)

Press Ctrl+C to exit
```

---

### `versatil config`

**Description**: Manage framework preferences and configuration

**Usage**:
```bash
versatil config show                 # Show current configuration
versatil config set <key>=<value>    # Set configuration value
versatil config wizard              # Interactive configuration
versatil config profile <name>      # Load configuration profile
versatil config validate            # Validate configuration
```

**Examples**:
```bash
# Show current config
versatil config show

# Set coverage threshold
versatil config set maria-qa.coverage_threshold=85

# Set accessibility standard
versatil config set james-frontend.accessibility_standard="WCAG 2.1 AAA"

# Enable proactive mode
versatil config set proactive_agents.enabled=true

# Load enterprise profile
versatil config profile enterprise
```

---

### `versatil update`

**Description**: Update framework to latest version

**Usage**:
```bash
versatil update check               # Check for updates
versatil update install             # Install latest update
versatil update status              # Show update status
versatil update list                # List available versions
versatil update changelog           # Show changelog
```

**Output Example** (`versatil update check`):
```
🔍 Checking for updates...

Current version: 4.1.0
Latest version: 4.2.0

📝 What's New in 4.2.0:
  ✨ New: Visual regression testing integration
  ✨ Enhanced: RAG memory performance (+40%)
  🐛 Fixed: MCP connection timeout issues
  🐛 Fixed: Quality gate enforcement on Windows

Do you want to update? (y/N)
```

---

### `versatil rollback`

**Description**: Rollback to previous framework version

**Usage**:
```bash
versatil rollback list              # List available versions
versatil rollback to <version>      # Rollback to specific version
versatil rollback previous          # Rollback to previous version
versatil rollback validate          # Validate rollback safety
```

---

### `versatil mcp`

**Description**: Start MCP server for Claude Desktop integration

**Usage**:
```bash
versatil mcp                        # Start with current directory
versatil mcp /path/to/project       # Start with specific project
versatil mcp:test                   # Test MCP connection
```

**Claude Desktop Configuration**:
```json
{
  "mcpServers": {
    "versatil": {
      "command": "versatil-mcp",
      "args": ["/path/to/your/project"]
    }
  }
}
```

---

## OPERA Slash Commands

OPERA slash commands are used within Cursor IDE or Claude Desktop for real-time agent control.

### `/opera:audit` - Comprehensive Health Audit (Rule 3)

**Description**: Run the VERSATIL Daily Audit and Health Check System

**Usage**:
```bash
/opera:audit                         # Run full audit
/opera:audit --security             # Security audit only
/opera:audit --performance          # Performance audit only
/opera:audit --quick                # Quick health check
```

**What Gets Checked**:
- 🏥 **System Health**: CPU, memory, disk, network utilization
- 📊 **Application Performance**: Response times, throughput, error rates
- 🔒 **Security**: OWASP Top 10, access control, compliance (SOC 2, ISO 27001)
- ✅ **Code Quality**: 85%+ test coverage, standards, technical debt
- 🏗️ **Infrastructure**: Service availability, dependency health
- 📈 **Business Intelligence**: Metrics and KPI tracking

**Audit Categories**:
1. **System**: Resource utilization, process health, uptime
2. **Performance**: Response times, throughput, error rates
3. **Security**: Vulnerability scans, access control
4. **Quality**: Test coverage, code standards, technical debt
5. **Infrastructure**: Service availability, dependencies
6. **Compliance**: SOC 2, ISO 27001, GDPR

**Auto-Remediation**:
- ✨ Performance optimization (memory cleanup, auto-scaling)
- ✨ Security patch application for critical vulnerabilities
- ✨ Quality gate enforcement with automatic blocking
- ✨ Resource optimization based on usage patterns
- ✨ Alert escalation with intelligent routing

**Schedule**:
- **Daily**: Comprehensive audit at 2 AM (configurable)
- **Hourly**: Critical system health checks
- **Real-time**: Performance monitoring and alerting

**Output Example**:
```
🏥 VERSATIL Comprehensive Audit Report

System Health:
  ✅ CPU Usage: 45% (Normal)
  ✅ Memory: 8.2GB / 16GB (51%)
  ✅ Disk Space: 120GB / 500GB (24%)
  ⚠️  Network Latency: 250ms (High)

Performance:
  ✅ API Response Time: 185ms (Target: < 200ms)
  ✅ Throughput: 1,200 req/min
  ❌ Error Rate: 2.3% (Target: < 1%)

Security:
  ✅ OWASP Top 10: Compliant
  ✅ Access Control: Configured
  ⚠️  Dependency Vulnerabilities: 3 low severity

Quality:
  ✅ Test Coverage: 87% (Target: 85%)
  ✅ Code Standards: Passing
  ⚠️  Technical Debt: 12 issues

Overall Health Score: 88/100 (Good)

⚠️  3 Issues Require Attention:
  1. High network latency (investigate DNS/routing)
  2. Error rate above threshold (check logs)
  3. 3 dependency vulnerabilities (run: ppnpm audit fix)

Auto-Remediation Actions:
  ✅ Triggered cache cleanup (freed 2.1GB)
  ✅ Scaled API workers +2 instances
  ⏳ Dependency update scheduled (tonight 2 AM)
```

---

### `/opera:parallel` - Parallel Task Execution (Rule 1)

**Description**: Enable VERSATIL Rule 1 for parallel task execution with collision detection

**Usage**:
```bash
/opera:parallel                      # Check status
/opera:parallel enable               # Enable parallel execution
/opera:parallel disable              # Disable parallel execution
/opera:parallel configure            # Configure max tasks
/opera:parallel stats                # Show statistics
```

**What This Does**:
Activates parallel execution of development tasks with:
- **Global max tasks**: 20 concurrent operations (configurable)
- **Agent workload balancing**: Max 3 tasks per agent
- **Resource contention prevention**: File system/database locks
- **SDLC-aware orchestration**: Respects development phases
- **Real-time optimization**: Auto-scaling based on load

**Tasks That Run in Parallel**:
- ✅ File pattern changes (component builds)
- ✅ Test execution across modules
- ✅ Security scans
- ✅ Documentation generation
- ✅ Build processes
- ✅ Code quality checks

**Collision Detection**:
- 🛡️ Resource conflicts (file system, database, network)
- 🛡️ SDLC phase violations (testing before implementation)
- 🛡️ Agent overload prevention
- 🛡️ Dependency cycle detection

**Performance Impact**:
- **3x faster** development cycles
- **Zero** resource conflicts
- **Optimal** agent utilization

**Output Example**:
```
🔄 VERSATIL Parallel Execution Status

Configuration:
  Status: Enabled ✅
  Max Concurrent Tasks: 20
  Max Tasks Per Agent: 3
  Collision Detection: Active

Currently Running (8 tasks):
  🤖 Maria-QA (2 tasks):
    - Test coverage analysis: src/auth/**
    - Visual regression: Button component

  🤖 James-Frontend (3 tasks):
    - Accessibility check: LoginForm.tsx
    - Performance audit: UserProfile.tsx
    - Responsive validation: Dashboard.tsx

  🤖 Marcus-Backend (3 tasks):
    - Security scan: /api/auth/login
    - Stress test: /api/users (1000 req)
    - Query optimization: UserRepository

Completed Today: 247 tasks
Average Completion Time: 12.3s
Conflicts Prevented: 34

Performance Gain: 3.2x faster than sequential
```

---

### `/opera:stress-test` - Automated Stress Testing (Rule 2)

**Description**: Generate and run automated stress tests

**Usage**:
```bash
/opera:stress-test                   # Run all stress tests
/opera:stress-test api               # Stress test APIs only
/opera:stress-test ui                # Stress test UI components
/opera:stress-test --generate        # Generate new test scenarios
/opera:stress-test --baseline        # Establish performance baseline
```

**What This Does**:
Creates comprehensive stress test scenarios:
- **Load Testing**: Normal traffic patterns (1,000 users)
- **Stress Testing**: Beyond capacity to breaking point (10,000+ users)
- **Spike Testing**: Sudden traffic surges (0 → 5,000 in 10s)
- **Volume Testing**: Large data sets (1M+ records)
- **Chaos Engineering**: Network failures, service outages
- **Security Stress**: Authentication attacks, rate limiting

**Auto-Generation Triggers**:
- 🎯 Code changes in critical paths (API endpoints, components)
- 🎯 New feature deployment
- 🎯 Performance regression thresholds breached
- 🎯 Security vulnerability patterns detected
- 🎯 Integration point modifications

**Test Output**:
- Performance baselines and regression detection
- Security vulnerability reports
- Scalability bottleneck identification
- Real-time results feed into quality gates

**Benefits**:
- **85% reduction** in production issues
- Automated performance regression detection
- Proactive scalability issue identification

**Output Example**:
```
🧪 VERSATIL Automated Stress Test Report

Test Suite: API Endpoints
Started: 2025-10-05 14:32:15
Duration: 3m 45s

Load Test (1,000 concurrent users):
  ✅ /api/auth/login
     Response Time: 145ms (p95: 198ms)
     Throughput: 1,200 req/s
     Error Rate: 0.02%

  ✅ /api/users
     Response Time: 89ms (p95: 142ms)
     Throughput: 2,400 req/s
     Error Rate: 0.01%

Stress Test (10,000 concurrent users):
  ⚠️  /api/auth/login
     Response Time: 425ms (p95: 892ms)
     Throughput: 4,200 req/s
     Error Rate: 1.2%
     Issue: Database connection pool saturation at 8,000 users

Spike Test (0 → 5,000 in 10s):
  ✅ /api/users
     Recovery Time: 3.2s
     Auto-scaling: +4 instances triggered

Recommendations:
  1. Increase database connection pool: 100 → 200
  2. Add Redis caching for /api/auth/login
  3. Implement rate limiting: 100 req/min per IP

Performance Baseline Established:
  - /api/auth/login: 200ms @ 1,000 users
  - /api/users: 100ms @ 1,000 users

Quality Gate: ⚠️  WARNING
  - /api/auth/login exceeded 200ms threshold under stress
  - Review required before deployment
```

---

## Agent Commands

### `/maria` - Activate Maria-QA

**Description**: Manually activate Maria-QA for quality assurance

**Usage**:
```bash
/maria review test coverage for authentication
/maria analyze component tests
/maria suggest missing tests for UserProfile
/maria run visual regression tests
```

**Auto-Activation Triggers**:
- File patterns: `*.test.*`, `**/__tests__/**`, `*.spec.*`
- Code patterns: `describe(`, `it(`, `expect(`, `test(`

---

### `/james` - Activate James-Frontend

**Description**: Manually activate James-Frontend for UI/UX review

**Usage**:
```bash
/james optimize React component performance
/james check accessibility for LoginForm
/james review responsive design
/james analyze bundle size
```

**Auto-Activation Triggers**:
- File patterns: `*.tsx`, `*.jsx`, `*.vue`, `*.css`, `*.scss`
- Code patterns: `useState`, `useEffect`, `component`, `className`

---

### `/marcus` - Activate Marcus-Backend

**Description**: Manually activate Marcus-Backend for API/security review

**Usage**:
```bash
/marcus review API security implementation
/marcus optimize database queries
/marcus generate stress tests for /api/auth
/marcus check OWASP compliance
```

**Auto-Activation Triggers**:
- File patterns: `*.api.*`, `**/routes/**`, `**/controllers/**`
- Code patterns: `router.`, `app.`, `express.`, `async function`

---

### `/sarah` - Activate Sarah-PM

**Description**: Manually activate Sarah-PM for project management

**Usage**:
```bash
/sarah update project timeline
/sarah generate sprint report
/sarah analyze team velocity
/sarah create milestone plan
```

---

### `/alex` - Activate Alex-BA

**Description**: Manually activate Alex-BA for requirements analysis

**Usage**:
```bash
/alex refine user story acceptance criteria
/alex extract requirements from feature request
/alex create traceability matrix
/alex validate business rules
```

---

### `/dr-ai-ml` - Activate Dr.AI-ML

**Description**: Manually activate Dr.AI-ML for AI/ML work

**Usage**:
```bash
/dr-ai-ml deploy ML model to production
/dr-ai-ml validate model accuracy
/dr-ai-ml optimize inference performance
/dr-ai-ml analyze training metrics
```

---

## Quality Gate Commands

### `versatil quality-gate`

**Description**: Run quality gate checks

**Usage**:
```bash
versatil quality-gate pre-commit     # Pre-commit checks
versatil quality-gate pre-push       # Pre-push checks
versatil quality-gate pre-deploy     # Pre-deployment checks
versatil quality-gate:setup          # Install Git hooks
```

**Pre-Commit Gate** (runs before `git commit`):
- ✅ Lint check (ESLint, Prettier)
- ✅ Type check (TypeScript)
- ✅ Unit tests (must pass)
- ✅ Coverage threshold (80%+)
- ✅ Security scan (basic SAST)

**Pre-Push Gate** (runs before `git push`):
- ✅ Full test suite
- ✅ Integration tests
- ✅ Coverage threshold (85%+)
- ✅ Visual regression (if configured)
- ✅ Security scan (OWASP)

**Pre-Deploy Gate** (runs before deployment):
- ✅ E2E tests (Playwright + Chrome MCP)
- ✅ Security audit (OWASP ZAP, Snyk)
- ✅ Performance validation (Lighthouse 90+)
- ✅ Accessibility audit (axe, pa11y 95+)
- ✅ API contract validation

---

## MCP Integration Commands

### `versatil-mcp`

**Description**: Start VERSATIL MCP server for Claude Desktop

**Usage**:
```bash
versatil-mcp                        # Start with current directory
versatil-mcp /path/to/project       # Start with specific project
```

**Claude Desktop Configuration**:
Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "versatil": {
      "command": "versatil-mcp",
      "args": ["/absolute/path/to/your/project"]
    }
  }
}
```

**Available MCP Tools**:
- `read_file` - Read file contents
- `write_file` - Write file contents
- `search_files` - Search for files by pattern
- `run_command` - Execute shell command
- `activate_agent` - Activate specific VERSATIL agent
- `run_quality_gate` - Run quality gate checks
- `analyze_coverage` - Analyze test coverage
- `security_scan` - Run security audit

---

## Configuration Commands

### `versatil cursor:init`

**Description**: Initialize Cursor IDE integration

**Usage**:
```bash
versatil cursor:init                # Create .cursorrules template
versatil cursor:init --force        # Overwrite existing configuration
```

**Creates**:
- `.cursorrules` - Cursor-specific agent configuration
- `.cursor/settings.json` - Auto-activation rules
- `.versatil-project.json` - Project-specific config

---

## Diagnostic Commands

### `versatil test-activation`

**Description**: Test agent auto-activation

**Usage**:
```bash
versatil test-activation             # Test with current project
versatil test-activation --file=src/LoginForm.test.tsx
versatil test-activation --verbose   # Detailed output
```

**Output Example**:
```
🧪 Testing Agent Activation

✅ Cursor IDE detected: Version 0.40.1
✅ .cursorrules found
✅ .cursor/settings.json found
✅ Agent triggers configured: 6 agents

Testing file: src/LoginForm.test.tsx

Matching Agents:
  ✅ Maria-QA (95% confidence)
     Matched patterns:
       - File pattern: *.test.*
       - Code pattern: describe(
       - Code pattern: it(
       - Code pattern: expect(

     Proactive actions configured:
       - test_coverage_analysis
       - missing_test_detection
       - assertion_validation

Testing file: src/components/Button.tsx

Matching Agents:
  ✅ James-Frontend (92% confidence)
     Matched patterns:
       - File pattern: *.tsx
       - Code pattern: useState
       - Code pattern: component

     Proactive actions configured:
       - accessibility_check_wcag
       - component_structure_validation

✅ Agent activation working correctly!

Recommendations:
  - Edit a test file to verify real-time activation
  - Check statusline for agent activity
  - Run: versatil agents --watch
```

---

### `versatil agents --watch`

**Description**: Real-time agent monitoring

**Usage**:
```bash
versatil agents --watch              # Monitor all agents
versatil agents --watch maria        # Monitor specific agent
```

**Output Example**:
```
🤖 VERSATIL Agent Real-Time Monitor
Press Ctrl+C to exit

[14:32:15] 🤖 Maria-QA activated
           File: src/LoginForm.test.tsx
           Action: test_coverage_analysis

[14:32:17] 📊 Maria-QA analysis complete
           Coverage: 85% (↑ 5% from baseline)
           Missing tests: 2
           Suggestions: Added inline comments

[14:33:02] 🤖 James-Frontend activated
           File: src/components/Button.tsx
           Action: accessibility_check_wcag

[14:33:05] ✅ James-Frontend validation complete
           Accessibility: WCAG 2.1 AA compliant
           Issues: 0
           Suggestions: None

[14:33:45] 🤖 Marcus-Backend activated
           File: src/api/auth/login.ts
           Action: security_pattern_validation_owasp

[14:33:50] ⚠️  Marcus-Backend security scan complete
           OWASP Status: 1 warning
           Issue: Missing rate limiting on login endpoint
           Suggestion: Add express-rate-limit middleware
```

---

## Git Workflow Commands

### `versatil backup`

**Description**: Git backup management

**Usage**:
```bash
versatil backup create               # Create backup
versatil backup status               # Show backup status
versatil backup sync                 # Sync with remote
```

---

### `versatil changelog`

**Description**: Generate changelog from git commits

**Usage**:
```bash
versatil changelog                   # Generate changelog
versatil changelog --format=markdown # Markdown output
versatil changelog --since=v4.0.0    # Since specific version
```

---

### `versatil version`

**Description**: Auto version bump or manual versioning

**Usage**:
```bash
versatil version                     # Auto-analyze and bump
versatil version major               # Manual major bump
versatil version minor               # Manual minor bump
versatil version patch               # Manual patch bump
versatil version prerelease          # Prerelease version
```

---

### `versatil release`

**Description**: Create full release with changelog and tagging

**Usage**:
```bash
versatil release                     # Create release
versatil release --github            # Create GitHub release
versatil release --dry-run           # Preview release
```

---

## Command Output Examples

### Example 1: Full Quality Gate Run

```bash
$ versatil quality-gate pre-deploy

🔐 VERSATIL Pre-Deploy Quality Gate

Running comprehensive checks...

1. E2E Tests (Playwright + Chrome MCP)
   ✅ Authentication flow: 12 tests passed
   ✅ User management: 8 tests passed
   ✅ API integration: 15 tests passed
   Time: 2m 34s

2. Security Audit (OWASP ZAP + Snyk)
   ✅ OWASP Top 10: Compliant
   ✅ Dependency vulnerabilities: 0 high, 2 low
   ⚠️  Rate limiting: Missing on 1 endpoint
   Time: 1m 12s

3. Performance Validation (Lighthouse)
   ✅ Performance: 94/100 (target: 90)
   ✅ Accessibility: 98/100 (target: 95)
   ✅ Best Practices: 100/100
   ✅ SEO: 92/100
   Time: 45s

4. Accessibility Audit (axe + pa11y)
   ✅ WCAG 2.1 AA: 100% compliant
   ✅ Color contrast: All checks passed
   ✅ Keyboard navigation: Verified
   Time: 23s

5. API Contract Validation
   ✅ OpenAPI schema: Valid
   ✅ Breaking changes: None detected
   ✅ Backward compatibility: Maintained
   Time: 8s

Overall Result: ⚠️  WARNING
  - Quality score: 94/100 (target: 90) ✅
  - 1 issue requires review:
    * Add rate limiting to /api/auth/login

Recommendation: Review security issue before deployment

Do you want to proceed with deployment? (y/N)
```

---

### Example 2: Agent Statistics

```bash
$ versatil agents --stats

📊 VERSATIL Agent Performance (Last 7 Days)

Maria-QA (Quality Guardian):
  - Activations: 247
  - Avg Response Time: 1.8s
  - Tests Generated: 89
  - Bugs Detected: 12
  - Coverage Improvement: +15%
  - Quality Gate Blocks: 7

  Top Actions:
    1. test_coverage_analysis (124 times)
    2. missing_test_detection (89 times)
    3. assertion_validation (67 times)

James-Frontend (UI/UX Expert):
  - Activations: 183
  - Avg Response Time: 2.1s
  - Accessibility Fixes: 34
  - Performance Improvements: 21
  - Components Optimized: 67

  Top Actions:
    1. accessibility_check_wcag (98 times)
    2. component_structure_validation (76 times)
    3. performance_optimization_suggestions (54 times)

Marcus-Backend (API Architect):
  - Activations: 156
  - Avg Response Time: 3.2s
  - Security Issues Found: 8
  - APIs Optimized: 23
  - Stress Tests Generated: 45

  Top Actions:
    1. security_pattern_validation_owasp (87 times)
    2. stress_test_generation (45 times)
    3. database_query_optimization (34 times)

Overall Metrics:
  - Total Agent Activations: 586
  - Avg Response Time: 2.1s
  - Code Quality Improvement: +27%
  - Bugs Prevented: 23
  - Development Velocity: +3.2x
```

---

## 💡 Tips & Best Practices

### When to Use CLI vs Slash Commands

**CLI Commands** (in terminal):
```bash
# Use for:
- Initial setup (versatil init)
- Health checks (versatil doctor)
- Configuration (versatil config)
- Updates (versatil update)
```

**Slash Commands** (in Cursor/Claude):
```bash
# Use for:
- Real-time agent activation (/maria, /james, /marcus)
- Framework health checks (/framework:doctor, /framework:validate)
```

### Proactive vs Manual Activation

**Proactive Mode** (recommended):
- Agents activate automatically based on file patterns
- Real-time feedback in statusline
- Best for: Day-to-day development

**Manual Mode** (fallback):
- Use slash commands to activate agents
- More control over when agents run
- Best for: Complex scenarios, debugging

### Quality Gate Strategy

**Recommended Setup**:
```bash
Pre-Commit:   Lint + Type Check + Unit Tests (fast, local)
Pre-Push:     Full Test Suite + Coverage (comprehensive)
Pre-Deploy:   E2E + Security + Performance (thorough)
```

---

## 🚨 Troubleshooting Commands

### Command Not Found

```bash
# Check installation
which versatil

# Reinstall if needed
pnpm add -g @versatil/sdlc-framework

# Diagnose PATH issues
versatil doctor:install
```

### Agents Not Activating

```bash
# Test activation
versatil test-activation

# Check agent status
versatil agents --status

# Watch agent activity
versatil agents --watch

# Enable debug mode
VERSATIL_DEBUG=true versatil agents --watch
```

### Quality Gates Not Enforcing

```bash
# Verify Git hooks
ls -la .git/hooks/

# Reinstall hooks
versatil quality-gate:setup

# Test pre-commit gate
versatil quality-gate pre-commit
```

---

## 📚 Related Documentation

- [Cursor Integration Guide](CURSOR_INTEGRATION.md)
- [Agent Activation Troubleshooting](AGENT_ACTIVATION_TROUBLESHOOTING.md)
- [Quality Gates Documentation](QUALITY_GATES.md)
- [MCP Integration Guide](mcp-integration.md)
- [Installation Troubleshooting](INSTALLATION_TROUBLESHOOTING.md)

---

**Framework Version**: 4.1.0
**Last Updated**: 2025-10-05
**Maintained By**: VERSATIL Development Team
**Community Support**: [GitHub Discussions](https://github.com/versatil-sdlc-framework/discussions)
