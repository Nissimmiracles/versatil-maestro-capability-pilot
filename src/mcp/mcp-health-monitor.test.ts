/**
 * VERSATIL Framework - MCP Health Monitor Tests
 * Test suite for MCP health monitoring, circuit breaker, and retry logic
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MCPHealthMonitor } from './mcp-health-monitor';

describe('MCPHealthMonitor', () => {
  let monitor: MCPHealthMonitor;

  beforeEach(() => {
    vi.clearAllMocks();
    monitor = new MCPHealthMonitor();
  });

  afterEach(() => {
    if (monitor) {
      monitor.stopMonitoring();
    }
  });

  // ============================================================================
  // Health Check Management
  // ============================================================================
  describe('Health Check Management', () => {
    it('should initialize health monitor', () => {
      expect(monitor).toBeDefined();
      expect(monitor instanceof MCPHealthMonitor).toBe(true);
    });

    it('should initialize all 11 MCPs as healthy', () => {
      const allHealth = monitor.getAllHealthStatus();
      expect(allHealth.size).toBe(11);

      for (const [mcpId, health] of allHealth) {
        expect(health.status).toBe('healthy');
        expect(health.consecutiveFailures).toBe(0);
        expect(health.successRate).toBe(100);
        expect(health.circuitOpen).toBe(false);
      }
    });

    it('should start monitoring MCP servers', () => {
      const intervalMs = 5000;
      monitor.startMonitoring(intervalMs);

      expect(monitor.isMonitoring()).toBe(true);
    });

    it('should stop monitoring', () => {
      monitor.startMonitoring(5000);
      expect(monitor.isMonitoring()).toBe(true);

      monitor.stopMonitoring();
      expect(monitor.isMonitoring()).toBe(false);
    });

    it('should not start duplicate monitoring', () => {
      monitor.startMonitoring(5000);
      const firstInterval = monitor['monitoringInterval'];

      monitor.startMonitoring(5000); // Try to start again
      const secondInterval = monitor['monitoringInterval'];

      expect(firstInterval).toBe(secondInterval);
    });

    it('should configure health check interval', () => {
      const customInterval = 30000; // 30 seconds
      monitor.startMonitoring(customInterval);

      expect(monitor.isMonitoring()).toBe(true);
    });

    it('should emit monitoring_started event', () => {
      return new Promise<void>((resolve) => {
        monitor.on('monitoring_started', (data) => {
          expect(data).toHaveProperty('intervalMs');
          resolve();
        });

        monitor.startMonitoring(5000);
      });
    });

    it('should emit monitoring_stopped event', () => {
      return new Promise<void>((resolve) => {
        monitor.on('monitoring_stopped', () => {
          resolve();
        });

        monitor.startMonitoring(5000);
        monitor.stopMonitoring();
      });
    });
  });

  // ============================================================================
  // Server Health Tracking
  // ============================================================================
  describe('Server Health Tracking', () => {
    it('should get health status by MCP ID', () => {
      const health = monitor.getHealthStatus('semgrep_mcp');

      expect(health).toBeDefined();
      expect(health?.mcpId).toBe('semgrep_mcp');
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('lastCheck');
    });

    it('should return undefined for unknown MCP ID', () => {
      const health = monitor.getHealthStatus('unknown_mcp');
      expect(health).toBeUndefined();
    });

    it('should track health status for all MCPs', () => {
      const allHealth = monitor.getAllHealthStatus();

      expect(allHealth.size).toBe(11);
      expect(allHealth.has('chrome_mcp')).toBe(true);
      expect(allHealth.has('github_mcp')).toBe(true);
      expect(allHealth.has('versatil_mcp')).toBe(true);
    });

    it('should get unhealthy MCPs', () => {
      // All start healthy
      const unhealthy = monitor.getUnhealthyMCPs();
      expect(unhealthy).toHaveLength(0);
    });

    it('should calculate system health percentage', () => {
      const percentage = monitor.getSystemHealthPercentage();
      expect(percentage).toBe(100); // All healthy
    });

    it('should get overall health status', () => {
      const overall = monitor.getOverallHealth();

      expect(overall).toHaveProperty('chrome_mcp');
      expect(overall['chrome_mcp']).toHaveProperty('healthy');
      expect(overall['chrome_mcp'].healthy).toBe(true);
    });
  });

  // ============================================================================
  // Circuit Breaker Pattern
  // ============================================================================
  describe('Circuit Breaker Pattern', () => {
    it('should track circuit breaker state', () => {
      const mcpId = 'shadcn_mcp';

      let health = monitor.getHealthStatus(mcpId);
      expect(health?.circuitOpen).toBe(false);

      // Open circuit manually for testing
      monitor.openCircuit(mcpId);

      health = monitor.getHealthStatus(mcpId);
      expect(health?.circuitOpen).toBe(true);
    });

    it('should emit circuit-opened event', () => {
      return new Promise<void>((resolve) => {
        monitor.on('circuit-opened', (data) => {
          expect(data).toHaveProperty('mcpId');
          expect(data).toHaveProperty('health');
          resolve();
        });

        monitor.openCircuit('vertex_ai_mcp');
      });
    });

    it('should emit circuit-closed event', () => {
      return new Promise<void>((resolve) => {
        const mcpId = 'supabase_mcp';

        monitor.on('circuit-closed', (data) => {
          expect(data.mcpId).toBe(mcpId);
          resolve();
        });

        // Open then close
        monitor.openCircuit(mcpId);
        monitor.closeCircuit(mcpId);
      });
    });

    it('should close circuit and reset failures', () => {
      const mcpId = 'semgrep_mcp';

      // Open circuit
      monitor.openCircuit(mcpId);
      let health = monitor.getHealthStatus(mcpId);
      expect(health?.circuitOpen).toBe(true);

      // Close circuit
      monitor.closeCircuit(mcpId);

      health = monitor.getHealthStatus(mcpId);
      expect(health?.consecutiveFailures).toBe(0);
      expect(health?.circuitOpen).toBe(false);
    });

    it('should maintain independent circuit state per MCP', () => {
      // Open chrome_mcp circuit
      monitor.openCircuit('chrome_mcp');

      const chromeHealth = monitor.getHealthStatus('chrome_mcp');
      const githubHealth = monitor.getHealthStatus('github_mcp');

      expect(chromeHealth?.circuitOpen).toBe(true);
      expect(githubHealth?.circuitOpen).toBe(false);
    });

    it('should half-open circuit for recovery testing', () => {
      const mcpId = 'github_mcp';

      // Open circuit
      monitor.openCircuit(mcpId);
      let health = monitor.getHealthStatus(mcpId);
      expect(health?.circuitOpen).toBe(true);

      // Half-open
      monitor.halfOpenCircuit(mcpId);

      health = monitor.getHealthStatus(mcpId);
      expect(health?.circuitOpen).toBe(false);
      expect(health?.status).toBe('degraded');
    });

    it('should get circuit breaker statistics', () => {
      const stats = monitor.getCircuitBreakerStats();

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('open');
      expect(stats).toHaveProperty('closed');
      expect(stats).toHaveProperty('halfOpen');
      expect(stats.total).toBe(11);
    });
  });

  // ============================================================================
  // Execute with Retry
  // ============================================================================
  describe('Execute with Retry', () => {
    it('should execute MCP action successfully', async () => {
      const result = await monitor.executeMCPWithRetry('chrome_mcp', 'test_action', {});

      // May succeed or fail based on simulated random behavior
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('latency');
      expect(result).toHaveProperty('retriesUsed');
    });

    it('should include retries used in result', async () => {
      const result = await monitor.executeMCPWithRetry('github_mcp', 'test_action', {});

      expect(result).toHaveProperty('retriesUsed');
      expect(typeof result.retriesUsed).toBe('number');
    });

    it('should use fallback when circuit is open', async () => {
      const mcpId = 'playwright_mcp';

      // Open circuit
      monitor.openCircuit(mcpId);

      const result = await monitor.executeMCPWithRetry(mcpId, 'test_action', {});

      expect(result.usedFallback).toBe(true);
    });
  });

  // ============================================================================
  // Health Report Generation
  // ============================================================================
  describe('Health Report Generation', () => {
    it('should generate comprehensive health report', () => {
      const report = monitor.generateHealthReport();

      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('overallHealth');
      expect(report).toHaveProperty('mcps');
      expect(report).toHaveProperty('circuitBreakers');
      expect(report).toHaveProperty('recommendations');
    });

    it('should include recommendations in report', () => {
      // Open a circuit to trigger recommendation
      monitor.openCircuit('chrome_mcp');

      const report = monitor.generateHealthReport();

      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it('should calculate overall health correctly', () => {
      const report = monitor.generateHealthReport();

      expect(report.overallHealth).toBe(100); // All healthy initially
    });

    it('should detect unhealthy MCPs in report', () => {
      // Make one MCP unhealthy
      monitor.openCircuit('github_mcp');

      const report = monitor.generateHealthReport();
      const unhealthy = report.mcps.filter(m => m.status === 'unhealthy');

      expect(unhealthy.length).toBe(1);
      expect(unhealthy[0].mcpId).toBe('github_mcp');
    });
  });

  // ============================================================================
  // Configuration
  // ============================================================================
  describe('Configuration', () => {
    it('should accept custom retry configuration', () => {
      const customMonitor = new MCPHealthMonitor({
        maxRetries: 5,
        baseDelay: 500,
        maxDelay: 10000,
        backoffMultiplier: 3
      });

      expect(customMonitor).toBeDefined();
      customMonitor.stopMonitoring();
    });

    it('should use default configuration when not specified', () => {
      const defaultMonitor = new MCPHealthMonitor();

      expect(defaultMonitor).toBeDefined();
      defaultMonitor.stopMonitoring();
    });
  });

  // ============================================================================
  // Event Emissions
  // ============================================================================
  describe('Event Emissions', () => {
    it('should emit mcp:fallback event when using fallback', async () => {
      return new Promise<void>(async (resolve) => {
        monitor.on('mcp:fallback', (data) => {
          expect(data).toHaveProperty('mcpId');
          expect(data).toHaveProperty('action');
          expect(data).toHaveProperty('fallbackData');
          resolve();
        });

        // Open circuit to trigger fallback
        monitor.openCircuit('chrome_mcp');
        await monitor.executeMCPWithRetry('chrome_mcp', 'test_action', {});
      });
    });

    it('should emit circuit-half-open event', () => {
      return new Promise<void>((resolve) => {
        monitor.on('circuit-half-open', (data) => {
          expect(data).toHaveProperty('mcpId');
          expect(data).toHaveProperty('health');
          resolve();
        });

        monitor.halfOpenCircuit('exa_mcp');
      });
    });
  });
});
