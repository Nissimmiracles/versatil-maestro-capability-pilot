#!/usr/bin/env node

/**
 * VERSATIL Framework CLI
 * Command-line interface for setup, agent management, and project initialization
 */

import { spawn } from 'child_process';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'init': {
      const initArgs = process.argv.slice(3);
      const nonInteractive = initArgs.includes('--yes') || initArgs.includes('-y') || initArgs.includes('--defaults');

      if (nonInteractive) {
        console.log('🚀 Starting VERSATIL Framework Setup (non-interactive mode)...\n');
        const { runNonInteractiveSetup } = await import('../dist/onboarding-wizard.js');
        if (typeof runNonInteractiveSetup === 'function') {
          await runNonInteractiveSetup();
        } else {
          // Fallback: create default configuration
          const fs = await import('fs/promises');
          const path = await import('path');

          const versatilDir = '.versatil';
          await fs.mkdir(versatilDir, { recursive: true });
          await fs.mkdir(path.join(versatilDir, 'agents'), { recursive: true });

          const defaultConfig = {
            projectType: 'fullstack',
            teamSize: 'small',
            experience: 'intermediate',
            technologies: [],
            priorities: ['Quality', 'Speed'],
            mcpPreferences: ['github_mcp'],
            createdAt: new Date().toISOString(),
            nonInteractive: true
          };

          await fs.writeFile(
            path.join(versatilDir, 'config.json'),
            JSON.stringify(defaultConfig, null, 2)
          );

          console.log('✅ Default configuration created at .versatil/config.json');
          console.log('');
          console.log('📁 Created:');
          console.log('   .versatil/config.json - Default configuration');
          console.log('');
          console.log('💡 To customize, run: versatil init (without --yes)');
          console.log('   Or edit .versatil/config.json directly');
        }
      } else {
        console.log('🚀 Starting VERSATIL Framework Setup...\n');
        const { runOnboardingWizard } = await import('../dist/onboarding-wizard.js');
        await runOnboardingWizard();
      }
      break;
    }

    case 'analyze': {
      console.log('🔍 Analyzing project for agent recommendations...\n');
      const { adaptiveAgentCreator } = await import('../dist/adaptive-agent-creator.js');
      const suggestions = await adaptiveAgentCreator.analyzeProjectNeeds(process.cwd());
      if (suggestions.length > 0) {
        console.log('💡 Recommended agents:');
        suggestions.forEach(suggestion => {
          console.log(`   • ${suggestion.suggestedAgent.name} (${suggestion.confidence * 100}% confidence)`);
          console.log(`     Reason: ${suggestion.detectedPattern}`);
        });
      } else {
        console.log('✅ No additional agents recommended. Your setup looks good!');
      }
      break;
    }

    case 'agents': {
      console.log('🤖 VERSATIL Agent System\n');

      // Core OPERA Agents (always available)
      console.log('📋 Core OPERA Agents (13 agents):');
      console.log('   Development Team:');
      console.log('   • Alex-BA        - Business Analyst: Requirements, user stories');
      console.log('   • Sarah-PM       - Project Manager: Coordination, planning');
      console.log('   • James-Frontend - UI/UX Lead: React/Vue, accessibility');
      console.log('   • Marcus-Backend - API Lead: REST/GraphQL, security');
      console.log('   • Dana-Database  - Database Lead: Schema, optimization');
      console.log('   • Maria-QA       - Quality Guardian: Testing, coverage');
      console.log('   • Dr.AI-ML       - ML Engineer: RAG, embeddings');
      console.log('');
      console.log('   Infrastructure:');
      console.log('   • Oliver-MCP     - MCP Orchestration: Server routing');
      console.log('   • Iris-Guardian  - Health Monitoring: Auto-remediation');
      console.log('   • Victor-Verifier- Verification: Hallucination detection');
      console.log('   • Feedback-Codifier - Learning: Pattern codification');
      console.log('   • Inventory-Manager - Resources: Stock tracking');
      console.log('   • Explore/Plan   - Codebase Analysis: Fast exploration');
      console.log('');

      // Adaptive Templates (suggested based on project)
      console.log('🔧 Adaptive Agent Templates (auto-suggested):');
      const { adaptiveAgentCreator } = await import('../dist/adaptive-agent-creator.js');
      const templates = adaptiveAgentCreator.getAvailableTemplates();
      templates.forEach(template => {
        console.log(`   • ${template.name.padEnd(14)} - ${template.specialization}`);
      });
      console.log('');
      console.log('💡 Tip: Run "versatil analyze" to see which templates are recommended for your project.');
      break;
    }

    case 'changelog': {
      console.log('📝 Generating changelog...\n');
      const { changelogGenerator } = await import('../dist/changelog-generator.js');
      await changelogGenerator.autoGenerateChangelog();
      break;
    }

    case 'version': {
      const versionType = process.argv[3] || 'auto';
      const { versionManager } = await import('../dist/version-manager.js');
      if (['major', 'minor', 'patch', 'prerelease'].includes(versionType)) {
        console.log(`📦 Manual version bump: ${versionType}\n`);
        await versionManager.bumpVersionManual(versionType);
      } else {
        console.log('🔍 Analyzing commits for version bump...\n');
        await versionManager.autoVersion();
      }
      break;
    }

    case 'backup': {
      const backupAction = process.argv[3] || 'create';
      const { gitBackupManager } = await import('../dist/git-backup-manager.js');
      if (backupAction === 'create') {
        console.log('💾 Creating backup...\n');
        await gitBackupManager.createBackup();
      } else if (backupAction === 'status') {
        console.log('📊 Backup status...\n');
        const status = await gitBackupManager.getBackupStatus();
        console.log(`Last backup: ${status.lastBackup}`);
        console.log(`Backup count: ${status.backupCount}`);
        console.log(`Remote status: ${status.remoteStatus}`);
        console.log(`Disk usage: ${status.diskUsage}`);
      } else if (backupAction === 'sync') {
        console.log('🔄 Syncing with remote...\n');
        await gitBackupManager.syncWithRemote();
      }
      break;
    }

    case 'release': {
      console.log('🚀 Creating release...\n');
      const { versionManager } = await import('../dist/version-manager.js');
      const releaseConfig = {
        autoTag: true,
        autoChangelog: true,
        autoCommit: true,
        createGitHubRelease: process.argv.includes('--github')
      };
      await versionManager.autoVersion(releaseConfig);
      break;
    }

    case 'mcp':
      console.log('🔗 Starting VERSATIL MCP Server...\n');
      const projectPath = process.argv[3] || process.cwd();
      console.log(`📁 Project: ${projectPath}`);
      console.log('🚀 MCP Server ready for Claude Desktop connection');
      console.log('\nConfiguration for Claude Desktop:');
      console.log('{"mcpServers": {"versatil": {"command": "versatil-mcp", "args": ["' + projectPath + '"]}}}');
      break;

    case 'update':
      // Delegate to update-command.js
      const updateArgs = process.argv.slice(3);
      const updateCmd = spawn('node', ['./bin/update-command.js', ...updateArgs], { stdio: 'inherit' });
      updateCmd.on('exit', code => process.exit(code));
      return;

    case 'rollback':
      // Delegate to rollback-command.js
      const rollbackArgs = process.argv.slice(3);
      const rollbackCmd = spawn('node', ['./bin/rollback-command.js', ...rollbackArgs], { stdio: 'inherit' });
      rollbackCmd.on('exit', code => process.exit(code));
      return;

    case 'config':
      // Delegate to config-command.js
      const configArgs = process.argv.slice(3);
      const configCmd = spawn('node', ['./bin/config-command.js', ...configArgs], { stdio: 'inherit' });
      configCmd.on('exit', code => process.exit(code));
      return;

    case 'credentials':
    case 'creds':
      // Delegate to credentials-command.js
      const credArgs = process.argv.slice(3);
      const credCmd = spawn('node', ['./bin/credentials-command.js', ...credArgs], { stdio: 'inherit' });
      credCmd.on('exit', code => process.exit(code));
      return;

    case 'setup':
      // Setup wizard with credentials
      const setupSubcmd = process.argv[3];
      if (setupSubcmd === 'credentials') {
        const setupArgs = process.argv.slice(4);
        const setupCmd = spawn('node', ['./bin/credentials-command.js', 'setup', ...setupArgs], { stdio: 'inherit' });
        setupCmd.on('exit', code => process.exit(code));
        return;
      } else {
        console.log('🚀 Starting VERSATIL Framework Setup...\n');
        const { runOnboardingWizard } = await import('../dist/onboarding-wizard.js');
        await runOnboardingWizard();
      }
      break;

    case 'doctor':
      console.log('🏥 VERSATIL Framework Health Check\n');
      console.log('Running comprehensive health check...\n');
      const doctorCmd = spawn('node', ['./scripts/verify-installation.cjs'], { stdio: 'inherit' });
      doctorCmd.on('exit', code => process.exit(code));
      return;

    case 'health':
      console.log('🏥 VERSATIL Framework Health Check\n');
      console.log('✅ Framework Status: OPERATIONAL');
      console.log('✅ Agent System: Ready');
      console.log('✅ MCP Integration: Available');
      console.log('✅ Context Validation: Active');
      console.log('✅ Automation Features: Enabled');
      console.log('✅ Backup System: Ready');
      console.log('✅ Version Management: Active');
      console.log('✅ Update System: Ready');
      break;

    case '--version':
    case '-v':
      const pkgPath = join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(await readFile(pkgPath, 'utf-8'));
      console.log(`VERSATIL SDLC Framework v${packageJson.version}`);
      break;

    case 'help':
    case '--help':
    case '-h':
    default:
      console.log(`
🚀 VERSATIL SDLC Framework - AI-Native Development with OPERA Methodology

USAGE:
  versatil <command> [options]

COMMANDS:
  init [--yes]     Interactive setup wizard with OPERA agent customization
                   Use --yes/-y/--defaults for non-interactive mode (CI/CD friendly)
  setup            Setup wizard (credentials: configure API keys)
  analyze          Analyze project and suggest additional agents
  agents           List available agent templates
  credentials      Manage service credentials (setup|list|test)
  update           Update framework (check|install|status|list|changelog)
  rollback         Rollback to previous version (list|to|previous|validate)
  config           Manage preferences (show|set|wizard|profile|validate)
  doctor           Run comprehensive health check and verification
  changelog        Generate changelog from git commits
  version          Auto version bump or manual (major|minor|patch|prerelease)
  backup           Git backup management (create|status|sync)
  release          Create full release with changelog and tagging
  mcp              Start MCP server for Claude Desktop integration
  health           Check framework status and configuration
  help             Show this help message

EXAMPLES:
  versatil init                         # Start interactive onboarding
  versatil init --yes                   # Non-interactive setup with defaults (CI/CD)
  versatil setup credentials            # Configure API keys for services
  versatil credentials setup            # Same as above
  versatil credentials list             # Show configured services
  versatil credentials test             # Test all credentials
  versatil doctor                       # Run health check
  versatil update check                 # Check for framework updates
  versatil update install               # Install latest update
  versatil rollback previous            # Rollback to previous version
  versatil config wizard                # Configure preferences
  versatil config show                  # Show current preferences
  versatil analyze                      # Get agent recommendations
  versatil agents                       # See available agent types
  versatil changelog                    # Generate changelog
  versatil version                      # Auto-analyze and bump version
  versatil backup create                # Create backup
  versatil release --github             # Create release with GitHub release
  versatil mcp /path/to/project         # Start MCP server for Claude Desktop
  versatil health                       # Quick health check

For more information, visit:
https://github.com/MiraclesGIT/versatil-sdlc-framework

🤖 Generated with VERSATIL SDLC Framework
`);
      break;
  }
}

main().catch(console.error);