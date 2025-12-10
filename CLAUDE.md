# VERSATIL SDLC Framework

**Version**: 7.16.2
**Purpose**: AI-powered software development framework with 13 specialized OPERA agents

## Quick Reference

### Core Commands
```bash
/plan [feature]     # Plan feature with RAG search
/work [todo]        # Execute work with agents
/learn [summary]    # Store patterns for reuse
/review [branch]    # Multi-agent code review
/assess [feature]   # Pre-work quality check
```

### Package Manager
This project uses **pnpm** (not npm):
```bash
pnpm install                    # Install dependencies
pnpm build                      # Build TypeScript
pnpm test                       # Run all tests
pnpm monitor                    # Health check
pnpm dashboard                  # Interactive monitoring
```

---

## OPERA Agent System

### 7 Core Development Agents

| Agent | Role | Auto-Activates On |
|-------|------|-------------------|
| **Alex-BA** | Business Analyst | Requirements, user stories, specs |
| **Sarah-PM** | Project Manager | Coordination, planning, docs |
| **James-Frontend** | UI/UX Lead | `.tsx`, `.jsx`, `.vue`, `.css` |
| **Marcus-Backend** | API Lead | `.api.*`, `.service.*`, server code |
| **Dana-Database** | Database Lead | `.sql`, migrations, schemas |
| **Maria-QA** | Quality Guardian | `.test.*`, `.spec.*` files |
| **Dr.AI-ML** | ML Engineer | `.py`, `.ipynb`, ML/AI code |

### 6 Infrastructure Agents

| Agent | Role | Purpose |
|-------|------|---------|
| **Oliver-MCP** | MCP Orchestrator | Routes to 12 MCP servers |
| **Iris-Guardian** | Health Monitor | Auto-remediation, framework health |
| **Victor-Verifier** | Verification | Hallucination detection |
| **Feedback-Codifier** | Learning | Pattern codification |
| **Inventory-Manager** | Resources | Resource tracking |
| **Explore/Plan** | Analysis | Codebase exploration |

---

## 5 Framework Rules

### Rule 1: Parallel Agent Execution
Launch multiple agents simultaneously for research phases. Use `Task` tool with independent agents in parallel.

### Rule 2: Auto-Generate Stress Tests
Create stress tests during implementation for:
- Context overflow scenarios
- Multi-agent isolation
- Cache efficiency
- Long conversation handling

### Rule 3: Daily Health Audits
Run `/monitor` at session start. Ensure health score >= 80%.

### Rule 4: Zero-Config Agent Activation
Agents auto-activate based on file patterns:
- `.tsx` files → James-Frontend
- `.sql` files → Dana-Database
- `.test.ts` files → Maria-QA

### Rule 5: Automated Release Orchestration
After Maria-QA approval:
1. Run quality gates (`pnpm test`)
2. Build (`pnpm build`)
3. Create release notes
4. Tag version

---

## Three-Tier Handoff Pattern

For multi-tier features (e.g., user authentication):

```
Dana-Database (Tier 1)
    ↓ Schema + migrations ready
Marcus-Backend (Tier 2)
    ↓ API endpoints ready
James-Frontend (Tier 3)
    ↓ UI components ready
Maria-QA (Validation)
    ↓ 80%+ coverage achieved
✅ Production Ready
```

**Contract Requirements**:
- Each tier validates input from previous tier
- Minimum 90+ score for handoff approval
- Add work items to contracts (at least one per tier)

---

## Quality Gates

### Pre-Commit (Maria-QA)
- ESLint passes
- TypeScript compiles
- Unit tests pass
- Security audit clean

### Pre-PR (Full Suite)
- 80%+ test coverage
- No high/critical vulnerabilities
- Build artifacts present
- E2E tests pass (if configured)

---

## File Structure

```
.
├── src/
│   ├── agents/           # OPERA agent implementations
│   │   ├── opera/        # Core agents (maria-qa, james-frontend, etc.)
│   │   ├── core/         # Base classes and utilities
│   │   └── contracts/    # Three-tier handoff contracts
│   ├── mcp/              # MCP server implementations
│   ├── memory/           # RAG and context management
│   └── utils/            # Shared utilities
├── .claude/
│   ├── commands/         # Slash command definitions
│   ├── hooks/            # Lifecycle hooks
│   └── skills/           # Skill definitions
├── tests/                # Test suites
├── docs/                 # Documentation
└── templates/            # Project templates
```

---

## Development Guidelines

### DO
- Use `VERSATILLogger` for all logging (not console.log)
- Extend `BaseAgent` for new agents
- Use `ThreeTierHandoffBuilder` for multi-tier features
- Run `pnpm test` before commits
- Keep CLAUDE.md under 20K lines

### DON'T
- Use npm (use pnpm)
- Skip contract validation
- Hardcode tech stacks (use TechStackDetector)
- Create agents without systemPrompt
- Mutate AgentActivationContext

---

## Troubleshooting

### Health Score < 70%
```bash
pnpm monitor          # Check health
node bin/versatil.js doctor  # Run diagnostics
pnpm install          # Reinstall dependencies
```

### Tests Failing
```bash
pnpm test             # Run full suite
pnpm test:unit        # Run unit tests only
pnpm test -- --watch  # Watch mode
```

### Agent Not Activating
1. Check `.cursorrules` has agent triggers
2. Verify file pattern matches agent
3. Run `/monitor agents` to check status

---

## Links

- **Documentation**: [docs/README.md](docs/README.md)
- **Quick Start**: [docs/QUICK_START.md](docs/QUICK_START.md)
- **Installation**: [docs/INSTALLATION.md](docs/INSTALLATION.md)
- **Agents Guide**: [docs/agents/README.md](docs/agents/README.md)
- **GitHub**: https://github.com/Nissimmiracles/versatil-sdlc-framework

---

**Made with VERSATIL SDLC Framework v7.16.2**
