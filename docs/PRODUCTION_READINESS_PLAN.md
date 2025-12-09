# VERSATIL Production Readiness Plan

> **Goal**: Prepare VERSATIL SDLC Framework v8.0.0 for public release on npm

## Current State Assessment

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| **Test Pass Rate** | 78% (1999/2541) | 95%+ | 542 failing tests |
| **Test Files** | 53/149 passing | 140/149+ | 91 failing files |
| **Documentation** | 64 docs | Complete | Missing key guides |
| **npm Published** | No | Yes | Not published |
| **CI/CD Pipeline** | Partial | Full | Needs automation |

---

## Phase 1: Test Stabilization (Priority: Critical)

**Timeline Target**: First milestone

### 1.1 Fix Critical Test Infrastructure
- [ ] Fix `logger.test.ts` mock restoration errors (lines 24-26)
- [ ] Fix `mcp-health-monitor.test.ts` unhandled rejection
- [ ] Audit all `beforeEach`/`afterEach` hooks for proper cleanup

### 1.2 Categorize Failing Tests
```bash
# Run to get full failure report
pnpm test 2>&1 | grep "FAIL" > failing-tests.txt
```

Priority order:
1. **Unit tests** (`tests/unit/`) - Core functionality
2. **Integration tests** - Agent coordination
3. **MCP tests** - Server communication
4. **E2E tests** - Full workflow validation

### 1.3 Test Remediation Strategy
| Category | Failing | Action |
|----------|---------|--------|
| Mock issues | ~30% | Fix spy/mock cleanup |
| Async timing | ~25% | Add proper awaits, increase timeouts |
| Missing fixtures | ~20% | Create test data |
| Actual bugs | ~25% | Fix implementation |

---

## Phase 2: Documentation Completion

### 2.1 Missing Critical Docs
- [x] `docs/QUICK_START.md` - Created
- [ ] `docs/API.md` - Full API reference
- [ ] `docs/CONFIGURATION.md` - All config options
- [ ] `docs/COMMANDS.md` - All 33 slash commands
- [ ] `docs/ARCHITECTURE.md` - Technical deep-dive
- [ ] `docs/agents/README.md` - Agent index

### 2.2 Update Existing Docs
- [ ] Sync README.md with actual CLI output
- [ ] Update version references to 8.0.0
- [ ] Add migration guide from 7.x to 8.0

### 2.3 Developer Experience Docs
- [ ] Contributing guide with test requirements
- [ ] Local development setup
- [ ] Debugging guide

---

## Phase 3: Code Quality & Security

### 3.1 Security Audit
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Remove any hardcoded secrets/tokens
- [ ] Validate credential handling in `credentials-command.js`
- [ ] Review OWASP Top 10 compliance

### 3.2 Code Cleanup
- [ ] Remove TODO/FIXME comments or create issues
- [ ] Remove console.log debug statements
- [ ] Ensure consistent error handling
- [ ] Add input validation at boundaries

### 3.3 TypeScript Strictness
```bash
# Ensure clean build
pnpm run typecheck
pnpm run build
```
- [ ] Fix all TypeScript errors
- [ ] Enable stricter compiler options

---

## Phase 4: CI/CD Pipeline

### 4.1 GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run typecheck
      - run: pnpm run lint
      - run: pnpm run test:coverage
      - run: pnpm run build
```

### 4.2 Release Automation
- [ ] Semantic versioning enforcement
- [ ] Automated changelog generation
- [ ] npm publish on tag
- [ ] GitHub release creation

### 4.3 Quality Gates
| Gate | Requirement |
|------|-------------|
| Tests | 95%+ passing |
| Coverage | 80%+ |
| TypeScript | Zero errors |
| Lint | Zero errors |
| Build | Successful |

---

## Phase 5: npm Publication

### 5.1 Pre-Publication Checklist
- [ ] Package name available: `@versatil/sdlc-framework`
- [ ] License file present (MIT)
- [ ] README.md comprehensive
- [ ] package.json metadata complete
- [ ] .npmignore configured
- [ ] Binaries working (`versatil`, `versatil-mcp`)

### 5.2 Package.json Updates
```json
{
  "name": "@versatil/sdlc-framework",
  "version": "8.0.0",
  "publishConfig": {
    "access": "public"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/Nissimmiracles/versatil-sdlc-framework"
  },
  "bugs": {
    "url": "https://github.com/Nissimmiracles/versatil-sdlc-framework/issues"
  },
  "homepage": "https://github.com/Nissimmiracles/versatil-sdlc-framework#readme"
}
```

### 5.3 Publication Steps
```bash
# 1. Login to npm
npm login

# 2. Dry run to verify
npm publish --dry-run

# 3. Publish
npm publish --access public

# 4. Verify
npm info @versatil/sdlc-framework
```

---

## Phase 6: Post-Launch

### 6.1 Monitoring
- [ ] Set up npm download tracking
- [ ] GitHub issue templates
- [ ] Community Discord/Slack

### 6.2 Support Infrastructure
- [ ] FAQ document
- [ ] Known issues page
- [ ] Upgrade path documentation

### 6.3 Marketing
- [ ] Product Hunt launch
- [ ] Dev.to / Medium articles
- [ ] Twitter/X announcements
- [ ] Reddit r/programming, r/node

---

## Quick Wins (Do First)

1. **Fix mock cleanup in tests** - Resolves ~30% of failures
2. **Create .npmignore** - Smaller package size
3. **Run npm audit fix** - Security baseline
4. **Complete QUICK_START.md** - Done
5. **Add --yes flag to init** - Done

---

## Success Criteria for v8.0.0

| Criteria | Requirement | Status |
|----------|-------------|--------|
| Tests passing | 95%+ | 78% |
| npm published | Yes | No |
| Documentation | Complete | 80% |
| Zero security vulns | High/Critical | TBD |
| CI/CD | Automated | Partial |
| CLI working | All commands | Yes |
| MCP server | Functional | Yes |

---

## Recommended Execution Order

```
Week 1: Test Stabilization
├── Fix test infrastructure (mocks, async)
├── Run full test suite daily
└── Target: 90% pass rate

Week 2: Documentation + Security
├── Complete missing docs
├── Security audit
└── Code cleanup

Week 3: CI/CD + Polish
├── GitHub Actions setup
├── Quality gates
└── Package preparation

Week 4: Publication
├── npm dry run
├── Final testing
├── Publish v8.0.0
└── Announcement
```

---

## Commands Reference

```bash
# Development (using pnpm - required)
pnpm install            # Install deps
pnpm build              # Build TypeScript
pnpm typecheck          # Type checking only
pnpm lint               # Lint code
pnpm test               # Run tests
pnpm test:coverage      # With coverage

# Verification
node bin/versatil.js doctor   # Health check
node bin/versatil.js agents   # List agents

# Release
pnpm build:release      # Full build + test
npm publish --dry-run   # Verify package (npm for publishing)
```

> **Note**: This project uses pnpm 10.17.0. Do not use npm or yarn for development.

---

**Last Updated**: 2025-12-09
**Version**: 7.16.2 → 8.0.0 (Target)
