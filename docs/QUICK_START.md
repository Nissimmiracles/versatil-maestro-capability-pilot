# VERSATIL Quick Start Tutorial

> **Get your first AI-assisted feature done in 10 minutes**

## Prerequisites

- Node.js 18+ installed
- pnpm 10+ (or npm/yarn)
- Git installed
- Claude Desktop or Cursor IDE (recommended)

## Installation (2 minutes)

### Option 1: npx (Recommended)

```bash
# No installation needed - run directly
npx --yes --package=github:Nissimmiracles/versatil-sdlc-framework versatil-mcp
```

### Option 2: Clone for Development

```bash
git clone https://github.com/Nissimmiracles/versatil-sdlc-framework.git
cd versatil-sdlc-framework
pnpm install
pnpm run build
```

## Verify Installation (1 minute)

```bash
# Run the health check
node bin/versatil.js doctor
```

You should see all checks passing with green checkmarks.

## Your First Feature (7 minutes)

### Step 1: Initialize Your Project

```bash
# Start the interactive setup wizard
node bin/versatil.js init
```

The wizard will:
1. Analyze your project type (frontend/backend/fullstack)
2. Detect your technologies (React, TypeScript, etc.)
3. Configure your OPERA agents
4. Create personalized configuration files

### Step 2: Plan Your Feature

In your AI-enabled IDE (Cursor/Claude), use the `/plan` command:

```
/plan "Add user authentication with email/password"
```

VERSATIL will:
- Search RAG memory for similar implementations
- Generate a structured todo list
- Provide accurate time estimates
- Suggest the right agents for each task

### Step 3: Execute the Work

```
/work todos/001-pending-auth-setup.md
```

The appropriate agents will activate:
- **Marcus-Backend** handles API endpoints
- **Dana-Database** designs the schema
- **James-Frontend** builds the login UI
- **Maria-QA** ensures 80%+ test coverage

### Step 4: Learn and Improve

After completion, capture learnings:

```
/learn "Completed auth in 2 hours - needed bcrypt for password hashing"
```

This stores the pattern for next time, making similar features 40% faster.

## Understanding OPERA Agents

VERSATIL includes **13 specialized agents** organized by role:

### Core Development Agents (7)

| Agent | Role | Activated By |
|-------|------|--------------|
| **Alex-BA** | Business Analyst | Requirements, specs, user stories |
| **Sarah-PM** | Project Manager | Coordination, planning, docs |
| **James-Frontend** | UI/UX Lead | `.tsx`, `.jsx`, `.vue`, `.css` files |
| **Marcus-Backend** | API Lead | `.api.*`, `.service.*`, server code |
| **Dana-Database** | Database Lead | `.sql`, migrations, schemas |
| **Maria-QA** | Quality Guardian | `.test.*`, `.spec.*` files |
| **Dr.AI-ML** | ML Engineer | `.py`, `.ipynb`, ML/AI code |

### Infrastructure Agents (6)

| Agent | Role | Purpose |
|-------|------|---------|
| **Oliver-MCP** | MCP Orchestrator | Routes to 12 MCP servers |
| **Iris-Guardian** | Health Monitor | Auto-remediation, framework health |
| **Victor-Verifier** | Verification | Hallucination detection |
| **Feedback-Codifier** | Learning | Pattern codification |
| **Inventory-Manager** | Resources | Resource tracking |
| **Explore/Plan** | Analysis | Codebase exploration |

### Adaptive Agent Templates

For specialized needs, VERSATIL can suggest additional agents via `versatil agents`:

| Template | Specialization | Auto-Created When |
|----------|---------------|-------------------|
| **DevOps-Dan** | CI/CD, Docker, K8s | Dockerfile detected |
| **Security-Sam** | Security auditing | Auth patterns detected |
| **Data-Diana** | ETL, data pipelines | Data processing detected |
| **Mobile-Mike** | iOS/Android | React Native/Flutter detected |

These templates are automatically suggested based on your project patterns.

## Key Commands

| Command | Description |
|---------|-------------|
| `/plan [feature]` | Plan a new feature with RAG search |
| `/work [todo]` | Execute work with agent coordination |
| `/learn [summary]` | Store patterns for future use |
| `/review [branch]` | Multi-agent code review |
| `/assess [feature]` | Pre-work quality assessment |

## Troubleshooting

### Doctor command shows failures?

```bash
# Check specific issues
node bin/versatil.js doctor

# Common fixes:
# - Ensure ~/.versatil directory exists
# - Run pnpm install to get dependencies
# - Check Node.js version (needs 18+)
```

### Agents not auto-activating?

Ensure you've run the onboarding wizard:
```bash
node bin/versatil.js init
```

### Need more help?

- [Full Documentation](./README.md)
- [Installation Guide](./INSTALLATION.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [GitHub Issues](https://github.com/Nissimmiracles/versatil-sdlc-framework/issues)

## Next Steps

1. **Read the Features Guide**: [docs/FEATURES.md](./FEATURES.md)
2. **Explore Agents**: [docs/agents/README.md](./agents/README.md)
3. **Configure MCP Tools**: [docs/MCP_FIX_SUMMARY.md](./MCP_FIX_SUMMARY.md)
4. **Join the Community**: [GitHub Discussions](https://github.com/Nissimmiracles/versatil-sdlc-framework/discussions)

---

**Made with VERSATIL SDLC Framework**
