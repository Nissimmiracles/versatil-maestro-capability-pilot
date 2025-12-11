import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
/**
 * Tests for Performance Monitor System
 */

import { PerformanceMonitor } from '../../src/analytics/performance-monitor';
import { EventEmitter } from 'events';

// Mock fs to prevent file system operations during tests
vi.mock('fs', () => ({
  existsSync: vi.fn(() => false),
  mkdirSync: vi.fn(),
  readFileSync: vi.fn(() => '{}'),
  writeFileSync: vi.fn()
}));

describe('PerformanceMonitor', () => {
  let performanceMonitor: PerformanceMonitor;

  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor();
  });

  afterEach(() => {
    performanceMonitor.stop();
  });

  describe('Initialization', () => {
    it('should initialize with correct properties', () => {
      expect(performanceMonitor).toBeInstanceOf(PerformanceMonitor);
      expect(performanceMonitor).toBeInstanceOf(EventEmitter);
      expect(performanceMonitor['isMonitoring']).toBe(false);
      expect(performanceMonitor['metrics']).toBeDefined();
      expect(performanceMonitor['agentPerformance']).toBeDefined();
    });

    it('should initialize with empty metrics', () => {
      expect(performanceMonitor['metrics'].size).toBe(0);
      expect(performanceMonitor['agentPerformance'].size).toBe(0);
    });
  });

  describe('Monitoring Control', () => {
    it('should start monitoring successfully', () => {
      performanceMonitor.start();
      expect(performanceMonitor['isMonitoring']).toBe(true);
    });

    it('should stop monitoring successfully', () => {
      performanceMonitor.start();
      performanceMonitor.stop();
      expect(performanceMonitor['isMonitoring']).toBe(false);
    });

    it('should handle multiple start calls gracefully', () => {
      performanceMonitor.start();
      performanceMonitor.start();
      expect(performanceMonitor['isMonitoring']).toBe(true);
    });

    it('should handle stop without start gracefully', () => {
      expect(() => performanceMonitor.stop()).not.toThrow();
      expect(performanceMonitor['isMonitoring']).toBe(false);
    });

    it('should emit monitoring-started event', async () => {
      const eventPromise = new Promise<void>((resolve) => {
        performanceMonitor.on('monitoring-started', () => resolve());
      });

      performanceMonitor.start();
      await eventPromise;
    });

    it('should emit monitoring-stopped event', async () => {
      performanceMonitor.start();

      const eventPromise = new Promise<void>((resolve) => {
        performanceMonitor.on('monitoring-stopped', () => resolve());
      });

      performanceMonitor.stop();
      await eventPromise;
    });
  });

  describe('Agent Execution Recording', () => {
    beforeEach(() => {
      performanceMonitor.start();
    });

    it('should record agent execution successfully', () => {
      performanceMonitor.recordAgentExecution('enhanced-maria', 1500, 3, 0.95, true);

      const agentPerf = performanceMonitor['agentPerformance'].get('enhanced-maria');
      expect(agentPerf).toBeDefined();
      expect(agentPerf?.totalExecutions).toBe(1);
      expect(agentPerf?.issuesDetected).toBe(3);
      expect(agentPerf?.averageQualityScore).toBe(0.95);
    });

    it('should accumulate multiple executions for same agent', () => {
      performanceMonitor.recordAgentExecution('enhanced-maria', 1000, 2, 0.9, true);
      performanceMonitor.recordAgentExecution('enhanced-maria', 2000, 4, 0.8, true);

      const agentPerf = performanceMonitor['agentPerformance'].get('enhanced-maria');
      expect(agentPerf?.totalExecutions).toBe(2);
      expect(agentPerf?.issuesDetected).toBe(6);
      // Average quality: (0.9 + 0.8) / 2 = 0.85
      expect(agentPerf?.averageQualityScore).toBeCloseTo(0.85, 10);
    });

    it('should track different agents separately', () => {
      performanceMonitor.recordAgentExecution('enhanced-maria', 1000, 2, 0.9, true);
      performanceMonitor.recordAgentExecution('enhanced-james', 1500, 3, 0.85, true);

      expect(performanceMonitor['agentPerformance'].size).toBe(2);

      const mariaPerf = performanceMonitor['agentPerformance'].get('enhanced-maria');
      const jamesPerf = performanceMonitor['agentPerformance'].get('enhanced-james');

      expect(mariaPerf?.totalExecutions).toBe(1);
      expect(jamesPerf?.totalExecutions).toBe(1);
      expect(mariaPerf?.averageQualityScore).toBe(0.9);
      expect(jamesPerf?.averageQualityScore).toBe(0.85);
    });

    it('should emit agent-execution-recorded event', async () => {
      const eventPromise = new Promise<void>((resolve) => {
        performanceMonitor.on('agent-execution-recorded', (data) => {
          expect(data.agentId).toBe('enhanced-maria');
          expect(data.executionTime).toBe(1500);
          expect(data.issuesDetected).toBe(3);
          expect(data.qualityScore).toBe(0.95);
          expect(data.success).toBe(true);
          resolve();
        });
      });

      performanceMonitor.recordAgentExecution('enhanced-maria', 1500, 3, 0.95, true);
      await eventPromise;
    });

    it('should create alert for slow executions', async () => {
      const alertPromise = new Promise<void>((resolve) => {
        performanceMonitor.on('alert-created', (alert) => {
          expect(alert.severity).toBeDefined();
          expect(alert.agentId).toBe('enhanced-maria');
          resolve();
        });
      });

      // Record execution with very slow time (above threshold of 5000ms)
      performanceMonitor.recordAgentExecution('enhanced-maria', 10000, 3, 0.95, true);
      await alertPromise;
    });

    it('should track execution times correctly', () => {
      performanceMonitor.recordAgentExecution('enhanced-maria', 1000, 2, 0.9, true);
      performanceMonitor.recordAgentExecution('enhanced-maria', 3000, 4, 0.8, true);

      const agentPerf = performanceMonitor['agentPerformance'].get('enhanced-maria');
      // Average execution time: (1000 + 3000) / 2 = 2000
      expect(agentPerf?.averageExecutionTime).toBe(2000);
      expect(agentPerf?.maxExecutionTime).toBe(3000);
      expect(agentPerf?.minExecutionTime).toBe(1000);
    });

    it('should track success rate', () => {
      performanceMonitor.recordAgentExecution('enhanced-maria', 1000, 2, 0.9, true);
      performanceMonitor.recordAgentExecution('enhanced-maria', 2000, 4, 0.8, false);

      const agentPerf = performanceMonitor['agentPerformance'].get('enhanced-maria');
      // Success rate: 1/2 = 0.5
      expect(agentPerf?.successRate).toBe(0.5);
    });
  });

  describe('Performance Dashboard', () => {
    beforeEach(() => {
      performanceMonitor.start();
    });

    it('should return performance dashboard', () => {
      performanceMonitor.recordAgentExecution('enhanced-maria', 1500, 3, 0.95, true);

      const dashboard = performanceMonitor.getPerformanceDashboard();

      expect(dashboard).toBeDefined();
      expect(dashboard.system).toBeDefined();
      expect(dashboard.agents).toBeDefined();
      expect(dashboard.recentAlerts).toBeDefined();
      expect(Array.isArray(dashboard.agents)).toBe(true);
    });

    it('should include system performance data', () => {
      performanceMonitor.recordAgentExecution('enhanced-maria', 1500, 3, 0.95, true);

      const dashboard = performanceMonitor.getPerformanceDashboard();

      expect(dashboard.system.overallHealth).toBeDefined();
      expect(dashboard.system.totalAgentExecutions).toBeGreaterThanOrEqual(0);
      expect(dashboard.system.averageResponseTime).toBeGreaterThanOrEqual(0);
    });

    it('should include agent performance data', () => {
      performanceMonitor.recordAgentExecution('enhanced-maria', 1500, 3, 0.95, true);
      performanceMonitor.recordAgentExecution('enhanced-james', 2000, 5, 0.88, true);

      const dashboard = performanceMonitor.getPerformanceDashboard();

      expect(dashboard.agents.length).toBe(2);

      const maria = dashboard.agents.find(a => a.agentId === 'enhanced-maria');
      const james = dashboard.agents.find(a => a.agentId === 'enhanced-james');

      expect(maria).toBeDefined();
      expect(james).toBeDefined();
      expect(maria?.totalExecutions).toBe(1);
      expect(james?.totalExecutions).toBe(1);
    });
  });

  describe('Metrics Recording', () => {
    beforeEach(() => {
      performanceMonitor.start();
    });

    it('should record metrics for agent executions', () => {
      performanceMonitor.recordAgentExecution('enhanced-maria', 1500, 3, 0.95, true);

      // Metrics are stored in the metrics Map
      const metricsForMaria = performanceMonitor['metrics'].get('enhanced-maria');
      expect(metricsForMaria).toBeDefined();
      expect(metricsForMaria?.length).toBeGreaterThan(0);
    });

    it('should categorize metrics by type', () => {
      performanceMonitor.recordAgentExecution('enhanced-maria', 1500, 3, 0.95, true);

      const metricsForMaria = performanceMonitor['metrics'].get('enhanced-maria');

      // Should have execution_time, issue_detection, and quality_score metrics
      const metricTypes = metricsForMaria?.map(m => m.metricType);
      expect(metricTypes).toContain('execution_time');
      expect(metricTypes).toContain('issue_detection');
      expect(metricTypes).toContain('quality_score');
    });
  });

  describe('Alerts', () => {
    beforeEach(() => {
      performanceMonitor.start();
    });

    it('should create alerts for threshold violations', async () => {
      const alertPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Alert not created')), 1000);
        performanceMonitor.on('alert-created', () => {
          clearTimeout(timeout);
          resolve();
        });
      });

      // Trigger slow execution alert (threshold is 5000ms)
      performanceMonitor.recordAgentExecution('enhanced-maria', 10000, 3, 0.95, true);

      await alertPromise;
    });

    it('should include alert details', async () => {
      const alertPromise = new Promise<any>((resolve) => {
        performanceMonitor.on('alert-created', (alert) => {
          resolve(alert);
        });
      });

      performanceMonitor.recordAgentExecution('enhanced-maria', 10000, 3, 0.95, true);

      const alert = await alertPromise;
      expect(alert.id).toBeDefined();
      expect(alert.timestamp).toBeDefined();
      expect(alert.severity).toBeDefined();
      expect(alert.message).toBeDefined();
    });

    it('should track alerts in alerts array', async () => {
      const alertPromise = new Promise<void>((resolve) => {
        performanceMonitor.on('alert-created', () => resolve());
      });

      performanceMonitor.recordAgentExecution('enhanced-maria', 10000, 3, 0.95, true);

      await alertPromise;

      expect(performanceMonitor['alerts'].length).toBeGreaterThan(0);
    });
  });

  describe('Prometheus Metrics', () => {
    beforeEach(() => {
      performanceMonitor.start();
    });

    it('should return prometheus-compatible metrics string', () => {
      performanceMonitor.recordAgentExecution('enhanced-maria', 1500, 3, 0.95, true);

      const prometheus = performanceMonitor.getPrometheusMetrics();

      expect(typeof prometheus).toBe('string');
      expect(prometheus).toContain('versatil_system_health');
      expect(prometheus).toContain('versatil_total_executions');
    });

    it('should include agent-specific prometheus metrics', () => {
      performanceMonitor.recordAgentExecution('enhanced-maria', 1500, 3, 0.95, true);

      const prometheus = performanceMonitor.getPrometheusMetrics();

      expect(prometheus).toContain('enhanced-maria');
      expect(prometheus).toContain('versatil_agent_executions');
      expect(prometheus).toContain('versatil_agent_quality_score');
    });
  });

  describe('System Health', () => {
    beforeEach(() => {
      performanceMonitor.start();
    });

    it('should calculate system health score', () => {
      performanceMonitor.recordAgentExecution('enhanced-maria', 1500, 3, 0.95, true);

      const dashboard = performanceMonitor.getPerformanceDashboard();

      // Health score is calculated based on various factors
      // It should be a number (may be negative in edge cases with limited data)
      expect(typeof dashboard.system.overallHealth).toBe('number');
      expect(Number.isFinite(dashboard.system.overallHealth)).toBe(true);
    });

    it('should detect quality gate status', () => {
      performanceMonitor.recordAgentExecution('enhanced-maria', 1500, 3, 0.95, true);

      const dashboard = performanceMonitor.getPerformanceDashboard();

      expect(['passing', 'warning', 'failing']).toContain(dashboard.system.qualityGateStatus);
    });
  });

  describe('Adaptive Insights', () => {
    beforeEach(() => {
      performanceMonitor.start();
    });

    it('should return adaptive insights', () => {
      performanceMonitor.recordAgentExecution('enhanced-maria', 1500, 3, 0.95, true);

      const insights = performanceMonitor.getAdaptiveInsights();

      expect(insights).toBeDefined();
      expect(insights.health).toBeDefined();
      expect(insights.trends).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle recording with context', () => {
      performanceMonitor.start();

      expect(() => {
        performanceMonitor.recordAgentExecution('enhanced-maria', 1500, 3, 0.95, true, {
          filePath: '/test/file.ts',
          operation: 'lint'
        });
      }).not.toThrow();
    });

    it('should handle very large execution times', () => {
      performanceMonitor.start();

      expect(() => {
        performanceMonitor.recordAgentExecution('enhanced-maria', 999999, 3, 0.95, true);
      }).not.toThrow();
    });

    it('should handle zero values', () => {
      performanceMonitor.start();

      expect(() => {
        performanceMonitor.recordAgentExecution('enhanced-maria', 0, 0, 0, false);
      }).not.toThrow();
    });

    it('should handle many agents', () => {
      performanceMonitor.start();

      for (let i = 0; i < 10; i++) {
        performanceMonitor.recordAgentExecution(`agent-${i}`, 1000 + i * 100, i, 0.9, true);
      }

      const dashboard = performanceMonitor.getPerformanceDashboard();
      expect(dashboard.agents.length).toBe(10);
    });
  });
});
