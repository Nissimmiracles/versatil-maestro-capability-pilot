#!/usr/bin/env node

/**
 * VERSATIL MCP Server Binary - Lightweight Entry Point
 * Lazy-loads heavy dependencies after stdio transport connection
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { appendFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Handle --version flag before anything else
if (process.argv.includes('--version') || process.argv.includes('-v')) {
  // Read version from package.json
  import('../package.json', { assert: { type: 'json' } })
    .then(pkg => {
      console.log(`versatil-mcp ${pkg.default.version}`);
      process.exit(0);
    })
    .catch(() => {
      console.log('versatil-mcp 7.16.2');
      process.exit(0);
    });
} else {

// MCP Server Log File (for debugging without interfering with stdio)
const VERSATIL_HOME = process.env.VERSATIL_HOME || join(homedir(), '.versatil');
const LOG_FILE = join(VERSATIL_HOME, 'mcp-server.log');

// Ensure .versatil directory exists
try {
  mkdirSync(VERSATIL_HOME, { recursive: true });
} catch (err) {
  // Directory already exists, ignore
}

/**
 * Log to file without interfering with stdio protocol
 */
function log(...args) {
  const message = args.join(' ');
  const timestamp = new Date().toISOString();
  try {
    appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
  } catch (err) {
    // Silently fail - don't interfere with MCP protocol
  }
}

async function main() {
  const projectPath = process.argv[2] || process.cwd();

  log('🚀 Starting VERSATIL MCP Server (Lightweight)...');
  log(`📁 Project Path: ${projectPath}`);
  log('⚡ Using lazy-loading for fast startup');
  log('');

  try {
    // STEP 1: Import minimal dependencies first (fast)
    const { VERSATILMCPServerV2 } = await import('../dist/mcp/versatil-mcp-server-v2.js');
    const { detectContextIdentity } = await import('../dist/isolation/context-identity.js');
    const { MultiProjectManager } = await import('../dist/isolation/multi-project-manager.js');

    log('✅ MCP Server module loaded');

    // STEP 1.5: Detect context identity FIRST (Phase 7.6.0)
    let contextIdentity = null;
    let projectContext = null;
    let projectManager = null;

    try {
      contextIdentity = await detectContextIdentity(projectPath);
      log(`🔍 Context detected: ${contextIdentity.role} (${contextIdentity.audience})`);

      // Initialize project manager for isolation
      projectManager = new MultiProjectManager();
      projectContext = await projectManager.registerProject(projectPath);
      log(`📁 Project registered: ${projectContext.id} (${projectContext.type})`);
    } catch (error) {
      log(`⚠️  Context detection failed: ${error.message}`);
      log('   Defaulting to user-project mode (safest)');
      // Continue without context - server will default to most restrictive mode
    }

    // STEP 2: Create server with context-aware configuration
    // Heavy dependencies (AgentRegistry, SDLCOrchestrator) loaded on-demand
    const server = new VERSATILMCPServerV2({
      name: 'claude-opera',
      version: '7.5.1',
      projectPath,
      contextIdentity,   // NEW: Pass context identity
      projectContext,    // NEW: Pass project context
      projectManager,    // NEW: Pass project manager
      lazyInit: true,
    });

    log('✅ MCP Server instance created');
    if (contextIdentity) {
      log(`🔒 Enforcement active: ${contextIdentity.boundary} boundary`);
    }

    // STEP 3: Connect stdio transport immediately (before loading agents)
    await server.start();

    log('✅ VERSATIL MCP Server running');
    log(`📊 Log file: ${LOG_FILE}`);
    log('⚡ Heavy dependencies will load on first tool use');
    log('');

    // Log basic stats (will be updated after lazy init)
    server.on('lazy:initialized', ({ tools, resources, prompts }) => {
      log(`📦 Lazy initialization complete: ${tools} tools, ${resources} resources, ${prompts} prompts`);
      log('');
      log('MCP Integrations:');
      log('  Supabase: ' + (process.env.SUPABASE_URL ? '✓ Enabled' : '✗ Disabled'));
      log('  GitHub: ' + (process.env.GITHUB_TOKEN ? '✓ Enabled' : '✗ Disabled'));
      log('  Semgrep: ' + (process.env.SEMGREP_API_KEY ? '✓ Cloud' : '✓ Local'));
      log('  Sentry: ' + (process.env.SENTRY_DSN ? '✓ Enabled' : '✗ Disabled'));
    });

  } catch (error) {
    log('❌ MCP Server failed to start:', error);
    log(error.stack || error);
    console.error('❌ MCP Server failed to start:', error.message);
    process.exit(1);
  }
}

// Add timeout guard to prevent infinite hanging
const STARTUP_TIMEOUT = 10000; // 10 seconds max
const timeoutHandle = setTimeout(() => {
  log('⚠️  MCP Server startup timeout (10s exceeded)');
  console.error('❌ MCP Server startup timeout');
  process.exit(1);
}, STARTUP_TIMEOUT);

main()
  .then(() => {
    clearTimeout(timeoutHandle);
  })
  .catch((error) => {
    clearTimeout(timeoutHandle);
    log('❌ Fatal error:', error);
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });

} // End of else block for --version check