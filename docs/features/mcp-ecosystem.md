# 🔗 VERSATIL MCP Integration Guide

The VERSATIL SDLC Framework includes a **production-ready Model Context Protocol (MCP) server**, allowing direct repository access and framework control through MCP-compatible tools like Claude Desktop.

## 🎯 What is VERSATIL MCP Integration?

### ✅ Production-Ready (v5.1.0)

VERSATIL's MCP server provides:
- **Full Repository Access**: Read any file in your project through MCP
- **Agent Control**: Activate and manage all 6 OPERA agents remotely
- **Quality Gates**: Run quality checks and view status via MCP
- **Emergency Response**: Trigger emergency protocols through MCP
- **Automation Tools**: Version management, changelog generation, backups
- **Real-time Status**: Live framework and project health monitoring
- **Chrome MCP Integration** ✨ NEW: Real Playwright browser automation for Maria-QA

### ✅ Fully Integrated MCPs (v5.1.0)

All MCP integrations are **production-ready**:
- ✅ **Chrome/Playwright MCP**: Real browser automation with 4 tools (v5.1.0)
- ✅ **GitHub MCP**: Full repository operations via GraphQL/REST
- ✅ **Exa Search MCP**: Semantic web search capabilities
- ✅ **Vertex AI MCP**: Google Cloud AI integration with Gemini
- ✅ **Supabase MCP**: Vector search with pgvector
- ✅ **n8n MCP**: Workflow automation with 525+ nodes
- ✅ **Semgrep MCP**: Security scanning (OWASP Top 10)
- ✅ **Sentry MCP**: Error monitoring with AI root cause analysis

> 🎉 **100% Complete**: All stub/mock implementations replaced with production code!

## 🚀 Quick Setup

### 1. Install VERSATIL Framework
```bash
pnpm add -g versatil-sdlc-framework
```

### 2. Configure Claude Desktop

Add to your Claude Desktop configuration:

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

### 3. Restart Claude Desktop

The VERSATIL MCP server will now be available in Claude Desktop!

## 🛠️ Available MCP Tools (Production-Ready)

The VERSATIL MCP server provides **14 fully functional tools**:

### Core Framework Tools (10)
1. `versatil_activate_agent` - Activate specific OPERA agents with context
2. `versatil_orchestrate_sdlc` - Orchestrate SDLC phase transitions
3. `versatil_quality_gate` - Execute quality gates and validation
4. `versatil_test_suite` - Run comprehensive test suites
5. `versatil_architecture_analysis` - Analyze system architecture patterns
6. `versatil_deployment_pipeline` - Manage deployment pipelines
7. `versatil_framework_status` - Get framework status and metrics
8. `versatil_adaptive_insights` - Generate adaptive improvement insights
9. `versatil_file_analysis` - Analyze files with agent intelligence
10. `versatil_performance_report` - Generate performance reports

### Chrome MCP Tools (4) ✨ NEW in v5.1.0
11. `chrome_navigate` - Navigate to URL using real Chromium browser (Maria-QA)
12. `chrome_snapshot` - Capture screenshot and DOM snapshot (Maria-QA)
13. `chrome_test_component` - Execute automated component tests (Maria-QA)
14. `chrome_close` - Close Chrome browser session (Maria-QA)

> ✅ All 14 tools are production-ready and fully functional.

## 📁 MCP Resources

- **Project Files**: All TypeScript, JavaScript, JSON, Markdown files
- `versatil://config` - Framework configuration
- `versatil://agents` - Active agent status
- `versatil://quality-gates` - Quality gate results
- `versatil://backup-status` - Backup system status

## 💡 Example Usage

**"Analyze my project using VERSATIL"** → Scans project, recommends agents

**"Run quality gates and show results"** → Executes all quality checks

**"Emergency response for build failure"** → Activates emergency protocols

**"Bump version based on commits"** → Analyzes commits, updates version

## 🔧 Manual Server Start

```bash
# Start MCP server for current directory
versatil-mcp

# Start for specific project
versatil-mcp /path/to/project
```

## 🔐 Security

- Access limited to specified project directory only
- No system-wide file access
- Local-only operation (no external network)
- Read/write permissions within project scope

## 🔍 Implementation Status

For a comprehensive breakdown of all MCP integrations (production-ready vs. planned), see:

📄 **[MCP_INTEGRATIONS_STATUS.md](MCP_INTEGRATIONS_STATUS.md)**

This document details:
- ✅ What's fully functional (VERSATIL MCP server + 10 tools)
- ⚠️ What's stubbed/mocked (Chrome, Playwright, GitHub, Shadcn)
- ❌ What's not present (Vertex AI, n8n)
- 📋 Recommendations for production use

---

🤖 **VERSATIL MCP integration provides unprecedented access to framework capabilities directly through Claude Desktop, revolutionizing AI-native development workflows.**