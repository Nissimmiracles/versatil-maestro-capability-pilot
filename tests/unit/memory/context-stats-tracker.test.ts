/**
 * Unit Tests: Context Stats Tracker
 *
 * Coverage Target: 85%+
 *
 * Test Coverage:
 * - Initialization and singleton pattern
 * - Event tracking (context clears, memory operations)
 * - Statistics calculation
 * - Report generation
 * - Cleanup operations
 * - Error handling and resilience
 * - Concurrent operations
 * - Session management
 * - Pre-clear hooks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import {
  ContextStatsTracker,
  getGlobalContextTracker,
  ContextClearEvent,
  MemoryOperation,
  ContextStatistics
} from '../../../src/memory/context-stats-tracker.js';

describe('ContextStatsTracker', () => {
  let tracker: ContextStatsTracker;
  let testStatsDir: string;

  beforeEach(async () => {
    // Create temporary test directory
    testStatsDir = path.join(os.tmpdir(), `versatil-test-${Date.now()}`);
    await fs.mkdir(testStatsDir, { recursive: true });

    // Create tracker with test directory
    tracker = new ContextStatsTracker(testStatsDir);
    await tracker.initialize();
  });

  afterEach(async () => {
    // Cleanup test directory
    try {
      await fs.rm(testStatsDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Initialization', () => {
    it('should create stats directory on initialization', async () => {
      const stats = await fs.stat(testStatsDir);
      expect(stats.isDirectory()).toBe(true);
    });

    it('should handle missing stats directory gracefully', async () => {
      const newTracker = new ContextStatsTracker(path.join(testStatsDir, 'nonexistent'));
      await expect(newTracker.initialize()).resolves.not.toThrow();
    });

    it('should load existing data on initialization', async () => {
      // Create initial event
      await tracker.trackClearEvent({
        agentId: 'maria-qa',
        inputTokens: 100000,
        toolUsesCleared: 5,
        tokensSaved: 60000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      });

      // Create new tracker instance (should load existing data)
      const newTracker = new ContextStatsTracker(testStatsDir);
      await newTracker.initialize();

      const stats = newTracker.getStatistics();
      expect(stats.totalClearEvents).toBe(1);
    });

    it('should handle corrupted data files gracefully', async () => {
      // Write corrupted JSON
      const eventsPath = path.join(testStatsDir, 'clear-events.json');
      await fs.writeFile(eventsPath, 'not valid json\n', 'utf-8');

      const newTracker = new ContextStatsTracker(testStatsDir);
      await expect(newTracker.initialize()).resolves.not.toThrow();
    });
  });

  describe('Context Clear Event Tracking', () => {
    it('should track context clear event', async () => {
      const clearEvent: Omit<ContextClearEvent, 'timestamp'> = {
        agentId: 'james-frontend',
        inputTokens: 120000,
        toolUsesCleared: 5,
        tokensSaved: 75000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      };

      await tracker.trackClearEvent(clearEvent);

      const stats = tracker.getStatistics();
      expect(stats.totalClearEvents).toBe(1);
      expect(stats.avgTokensPerClear).toBe(75000);
      expect(stats.totalTokensSaved).toBe(75000);
    });

    it('should track multiple clear events', async () => {
      await tracker.trackClearEvent({
        agentId: 'marcus-backend',
        inputTokens: 100000,
        toolUsesCleared: 3,
        tokensSaved: 60000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      });

      await tracker.trackClearEvent({
        agentId: 'james-frontend',
        inputTokens: 110000,
        toolUsesCleared: 4,
        tokensSaved: 65000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      });

      const stats = tracker.getStatistics();
      expect(stats.totalClearEvents).toBe(2);
      expect(stats.avgTokensPerClear).toBe(62500); // (60000 + 65000) / 2
      expect(stats.totalTokensSaved).toBe(125000); // 60000 + 65000
    });

    it('should limit clear events to last 1000', async () => {
      // Add 1100 events
      for (let i = 0; i < 1100; i++) {
        await tracker.trackClearEvent({
          agentId: 'maria-qa',
          inputTokens: 100000,
          toolUsesCleared: 5,
          tokensSaved: 60000,
          triggerType: 'input_tokens',
          triggerValue: 100000
        });
      }

      const stats = tracker.getStatistics();
      expect(stats.totalClearEvents).toBe(1000); // Should cap at 1000
    });

    it('should track clear events by agent', async () => {
      await tracker.trackClearEvent({
        agentId: 'marcus-backend',
        inputTokens: 100000,
        toolUsesCleared: 3,
        tokensSaved: 60000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      });

      await tracker.trackClearEvent({
        agentId: 'marcus-backend',
        inputTokens: 110000,
        toolUsesCleared: 4,
        tokensSaved: 65000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      });

      await tracker.trackClearEvent({
        agentId: 'james-frontend',
        inputTokens: 105000,
        toolUsesCleared: 5,
        tokensSaved: 63000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      });

      const stats = tracker.getStatistics();
      expect(stats.clearEventsByAgent['marcus-backend']).toBe(2);
      expect(stats.clearEventsByAgent['james-frontend']).toBe(1);
    });

    it('should persist clear events to disk', async () => {
      await tracker.trackClearEvent({
        agentId: 'maria-qa',
        inputTokens: 100000,
        toolUsesCleared: 5,
        tokensSaved: 60000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      });

      // Verify file exists (implementation uses clear-events.json, not jsonl)
      const eventsPath = path.join(testStatsDir, 'clear-events.json');
      const fileExists = await fs.access(eventsPath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);

      // Verify file content
      const content = await fs.readFile(eventsPath, 'utf-8');
      const events = JSON.parse(content);
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBe(1);
      expect(events[0].agentId).toBe('maria-qa');
      expect(events[0].tokensSaved).toBe(60000);
    });
  });

  describe('Memory Operation Tracking', () => {
    it('should track memory operation', async () => {
      await tracker.trackMemoryOperation({
        agentId: 'alex-ba',
        operation: 'create',
        path: 'requirements/user-auth.md',
        success: true,
        tokensUsed: 500
      });

      const stats = tracker.getStatistics();
      expect(stats.totalMemoryOperations).toBe(1);
      expect(stats.memoryOperationsByType['create']).toBe(1);
    });

    it('should track multiple memory operations', async () => {
      const operations = [
        { agentId: 'maria-qa', operation: 'create' as const, path: 'test-patterns.md', success: true, tokensUsed: 300 },
        { agentId: 'maria-qa', operation: 'str_replace' as const, path: 'test-patterns.md', success: true, tokensUsed: 150 },
        { agentId: 'james-frontend', operation: 'view' as const, path: 'ui-components.md', success: true, tokensUsed: 200 }
      ];

      for (const op of operations) {
        await tracker.trackMemoryOperation(op);
      }

      const stats = tracker.getStatistics();
      expect(stats.totalMemoryOperations).toBe(3);
      expect(stats.memoryOperationsByType['create']).toBe(1);
      expect(stats.memoryOperationsByType['str_replace']).toBe(1);
      expect(stats.memoryOperationsByType['view']).toBe(1);
    });

    it('should track failed operations', async () => {
      await tracker.trackMemoryOperation({
        agentId: 'marcus-backend',
        operation: 'str_replace',
        path: 'api-patterns.md',
        success: false,
        tokensUsed: 0
      });

      const stats = tracker.getStatistics();
      expect(stats.totalMemoryOperations).toBe(1);
      expect(stats.memoryOperationsByType['str_replace']).toBe(1);
    });

    it('should limit memory operations to last 5000', async () => {
      // Add operations in batches to speed up the test
      // First add 5000 operations to hit the limit
      const batchSize = 100;
      const totalOperations = 5100;

      for (let batch = 0; batch < totalOperations / batchSize; batch++) {
        const promises = Array(batchSize).fill(null).map((_, i) =>
          tracker.trackMemoryOperation({
            agentId: 'maria-qa',
            operation: 'view',
            path: `test-${batch * batchSize + i}.md`,
            success: true,
            tokensUsed: 100
          })
        );
        await Promise.all(promises);
      }

      const stats = tracker.getStatistics();
      expect(stats.totalMemoryOperations).toBe(5000); // Should cap at 5000
    }, 60000); // 60 second timeout for this heavy test

    it('should persist memory operations to disk', async () => {
      await tracker.trackMemoryOperation({
        agentId: 'dana-database',
        operation: 'create',
        path: 'schema-patterns.md',
        success: true,
        tokensUsed: 400
      });

      const opsPath = path.join(testStatsDir, 'memory-ops.json');
      const fileExists = await fs.access(opsPath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);

      const content = await fs.readFile(opsPath, 'utf-8');
      const ops = JSON.parse(content);
      expect(Array.isArray(ops)).toBe(true);
      expect(ops.length).toBe(1);
      expect(ops[0].agentId).toBe('dana-database');
      expect(ops[0].operation).toBe('create');
    });
  });

  describe('Session Management', () => {
    it('should start a session', () => {
      const sessionId = tracker.startSession('maria-qa');
      expect(sessionId).toBeDefined();
      expect(sessionId).toContain('session-');
    });

    it('should track token usage in session', async () => {
      tracker.startSession('james-frontend');
      tracker.updateTokenUsage(5000, 1000);

      const metrics = await tracker.getSessionMetrics();
      expect(metrics).toBeDefined();
      expect(metrics?.totalInputTokens).toBe(5000);
      expect(metrics?.totalOutputTokens).toBe(1000);
    });

    it('should track peak tokens in session', async () => {
      tracker.startSession('marcus-backend');
      tracker.updateTokenUsage(5000, 1000);
      tracker.updateTokenUsage(10000, 2000);
      tracker.updateTokenUsage(3000, 500);

      const metrics = await tracker.getSessionMetrics();
      expect(metrics?.peakTokens).toBe(10000);
    });

    it('should end session and persist', async () => {
      tracker.startSession('dana-database');
      tracker.updateTokenUsage(5000, 1000);

      const endedSession = await tracker.endSession();
      expect(endedSession).toBeDefined();
      expect(endedSession?.endTime).toBeDefined();
    });

    it('should return null when ending non-existent session', async () => {
      const result = await tracker.endSession();
      expect(result).toBeNull();
    });

    it('should track clear events in session', async () => {
      tracker.startSession('maria-qa');

      await tracker.trackClearEvent({
        agentId: 'maria-qa',
        inputTokens: 100000,
        toolUsesCleared: 5,
        tokensSaved: 60000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      });

      const metrics = await tracker.getSessionMetrics();
      expect(metrics?.clearEvents).toBe(1);
      expect(metrics?.tokensSaved).toBe(60000);
    });

    it('should track memory operations in session', async () => {
      tracker.startSession('alex-ba');

      await tracker.trackMemoryOperation({
        agentId: 'alex-ba',
        operation: 'create',
        path: 'test.md',
        success: true,
        tokensUsed: 100
      });

      const metrics = await tracker.getSessionMetrics();
      expect(metrics?.memoryOperations).toBe(1);
    });
  });

  describe('Statistics Calculation', () => {
    it('should return default statistics when no data', () => {
      const stats = tracker.getStatistics();

      expect(stats.totalClearEvents).toBe(0);
      expect(stats.totalMemoryOperations).toBe(0);
      expect(stats.avgTokensPerClear).toBe(0);
      expect(stats.totalTokensSaved).toBe(0);
    });

    it('should calculate correct averages', async () => {
      // Add clear events with different values
      await tracker.trackClearEvent({
        agentId: 'maria-qa',
        inputTokens: 100000,
        toolUsesCleared: 5,
        tokensSaved: 60000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      });

      await tracker.trackClearEvent({
        agentId: 'james-frontend',
        inputTokens: 120000,
        toolUsesCleared: 6,
        tokensSaved: 70000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      });

      const stats = tracker.getStatistics();
      expect(stats.avgTokensPerClear).toBe(65000); // (60000 + 70000) / 2
    });

    it('should group events by type correctly', async () => {
      await tracker.trackMemoryOperation({
        agentId: 'alex-ba',
        operation: 'create',
        path: 'req1.md',
        success: true,
        tokensUsed: 100
      });

      await tracker.trackMemoryOperation({
        agentId: 'alex-ba',
        operation: 'create',
        path: 'req2.md',
        success: true,
        tokensUsed: 150
      });

      await tracker.trackMemoryOperation({
        agentId: 'alex-ba',
        operation: 'str_replace',
        path: 'req1.md',
        success: true,
        tokensUsed: 80
      });

      const stats = tracker.getStatistics();
      expect(stats.memoryOperationsByType['create']).toBe(2);
      expect(stats.memoryOperationsByType['str_replace']).toBe(1);
    });

    it('should calculate uptime', async () => {
      // Wait a small amount of time
      await new Promise(resolve => setTimeout(resolve, 100));
      const stats = tracker.getStatistics();
      expect(stats.uptime).toBeGreaterThan(0);
    });

    it('should track total tokens processed', async () => {
      await tracker.trackClearEvent({
        agentId: 'maria-qa',
        inputTokens: 100000,
        toolUsesCleared: 5,
        tokensSaved: 60000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      });

      await tracker.trackClearEvent({
        agentId: 'james-frontend',
        inputTokens: 120000,
        toolUsesCleared: 6,
        tokensSaved: 70000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      });

      const stats = tracker.getStatistics();
      expect(stats.totalTokensProcessed).toBe(220000); // 100000 + 120000
    });
  });

  describe('Report Generation', () => {
    it('should generate comprehensive report', async () => {
      // Add sample data
      await tracker.trackClearEvent({
        agentId: 'maria-qa',
        inputTokens: 100000,
        toolUsesCleared: 5,
        tokensSaved: 60000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      });

      await tracker.trackMemoryOperation({
        agentId: 'maria-qa',
        operation: 'create',
        path: 'test-patterns.md',
        success: true,
        tokensUsed: 300
      });

      const report = await tracker.generateReport();

      expect(report).toContain('Context Management Report');
      expect(report).toContain('Total Clear Events');
      expect(report).toContain('Total Memory Operations');
      expect(report).toContain('maria-qa');
    });

    it('should handle empty data in report', async () => {
      const report = await tracker.generateReport();

      expect(report).toContain('Context Management Report');
      expect(report).toContain('Total Clear Events');
      expect(report).toContain('Total Memory Operations');
    });

    it('should include efficiency metrics in report', async () => {
      await tracker.trackClearEvent({
        agentId: 'maria-qa',
        inputTokens: 100000,
        toolUsesCleared: 5,
        tokensSaved: 60000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      });

      const report = await tracker.generateReport();
      expect(report).toContain('Efficiency Metrics');
    });
  });

  describe('Cleanup Operations', () => {
    it('should cleanup old data', async () => {
      await tracker.trackClearEvent({
        agentId: 'maria-qa',
        inputTokens: 100000,
        toolUsesCleared: 5,
        tokensSaved: 60000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      });

      const stats = tracker.getStatistics();
      expect(stats.totalClearEvents).toBe(1);

      // Cleanup (keep last 30 days)
      await tracker.cleanup(30);

      // Recent events should remain
      const statsAfterCleanup = tracker.getStatistics();
      expect(statsAfterCleanup.totalClearEvents).toBe(1);
    });

    it('should persist cleaned data', async () => {
      await tracker.trackMemoryOperation({
        agentId: 'maria-qa',
        operation: 'create',
        path: 'test.md',
        success: true,
        tokensUsed: 100
      });

      await tracker.cleanup(30);

      // Verify files still exist and are valid
      const opsPath = path.join(testStatsDir, 'memory-ops.json');
      const fileExists = await fs.access(opsPath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);
    });
  });

  describe('Pre-Clear Hooks', () => {
    it('should register pre-clear hook', () => {
      const hookId = tracker.registerPreClearHook(async () => 5);
      expect(hookId).toBe(0);
      expect(tracker.getPreClearHookCount()).toBe(1);
    });

    it('should execute pre-clear hooks on clear event', async () => {
      const hookFn = vi.fn().mockResolvedValue(3);
      tracker.registerPreClearHook(hookFn);

      await tracker.trackClearEvent({
        agentId: 'maria-qa',
        inputTokens: 100000,
        toolUsesCleared: 5,
        tokensSaved: 60000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      });

      expect(hookFn).toHaveBeenCalledWith(100000, 'maria-qa');
    });

    it('should unregister pre-clear hook', () => {
      const hookId = tracker.registerPreClearHook(async () => 5);
      expect(tracker.getPreClearHookCount()).toBe(1);

      tracker.unregisterPreClearHook(hookId);
      expect(tracker.getPreClearHookCount()).toBe(0);
    });

    it('should clear all pre-clear hooks', () => {
      tracker.registerPreClearHook(async () => 1);
      tracker.registerPreClearHook(async () => 2);
      tracker.registerPreClearHook(async () => 3);
      expect(tracker.getPreClearHookCount()).toBe(3);

      tracker.clearPreClearHooks();
      expect(tracker.getPreClearHookCount()).toBe(0);
    });

    it('should handle hook errors gracefully', async () => {
      tracker.registerPreClearHook(async () => {
        throw new Error('Hook failed');
      });

      await expect(tracker.trackClearEvent({
        agentId: 'maria-qa',
        inputTokens: 100000,
        toolUsesCleared: 5,
        tokensSaved: 60000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      })).resolves.not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle file write errors gracefully', async () => {
      // Make directory read-only to trigger write error
      await fs.chmod(testStatsDir, 0o444);

      // Should not throw, just warn
      await tracker.trackClearEvent({
        agentId: 'maria-qa',
        inputTokens: 100000,
        toolUsesCleared: 5,
        tokensSaved: 60000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      }).catch(() => {
        // Expected to fail with permission error
      });

      // Restore permissions
      await fs.chmod(testStatsDir, 0o755);
    });

    it('should handle concurrent operations', async () => {
      // Simulate concurrent tracking
      const promises = Array(100).fill(null).map((_, i) =>
        tracker.trackMemoryOperation({
          agentId: 'maria-qa',
          operation: 'view',
          path: `test-${i}.md`,
          success: true,
          tokensUsed: 100
        })
      );

      await expect(Promise.all(promises)).resolves.not.toThrow();

      const stats = tracker.getStatistics();
      expect(stats.totalMemoryOperations).toBe(100);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance from getGlobalContextTracker', () => {
      const instance1 = getGlobalContextTracker();
      const instance2 = getGlobalContextTracker();

      expect(instance1).toBe(instance2);
    });

    it('should initialize singleton automatically', async () => {
      const instance = getGlobalContextTracker();

      // Should be able to use immediately
      await expect(
        instance.trackClearEvent({
          agentId: 'maria-qa',
          inputTokens: 100000,
          toolUsesCleared: 5,
          tokensSaved: 60000,
          triggerType: 'input_tokens',
          triggerValue: 100000
        })
      ).resolves.not.toThrow();
    });
  });

  describe('Clear Events Query', () => {
    it('should get clear events within time range', async () => {
      await tracker.trackClearEvent({
        agentId: 'maria-qa',
        inputTokens: 100000,
        toolUsesCleared: 5,
        tokensSaved: 60000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      });

      const since = new Date(Date.now() - 1000);
      const until = new Date(Date.now() + 1000);
      const events = tracker.getClearEvents(since, until);

      expect(events.length).toBe(1);
    });

    it('should filter events by time range', async () => {
      await tracker.trackClearEvent({
        agentId: 'maria-qa',
        inputTokens: 100000,
        toolUsesCleared: 5,
        tokensSaved: 60000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      });

      const futureDate = new Date(Date.now() + 10000);
      const events = tracker.getClearEvents(futureDate);

      expect(events.length).toBe(0);
    });
  });

  describe('Memory Operations Query', () => {
    it('should get memory operations within time range', async () => {
      await tracker.trackMemoryOperation({
        agentId: 'maria-qa',
        operation: 'create',
        path: 'test.md',
        success: true,
        tokensUsed: 100
      });

      const since = new Date(Date.now() - 1000);
      const until = new Date(Date.now() + 1000);
      const ops = tracker.getMemoryOperations(since, until);

      expect(ops.length).toBe(1);
    });

    it('should filter operations by time range', async () => {
      await tracker.trackMemoryOperation({
        agentId: 'maria-qa',
        operation: 'create',
        path: 'test.md',
        success: true,
        tokensUsed: 100
      });

      const futureDate = new Date(Date.now() + 10000);
      const ops = tracker.getMemoryOperations(futureDate);

      expect(ops.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero tokens saved', async () => {
      await tracker.trackClearEvent({
        agentId: 'maria-qa',
        inputTokens: 100000,
        toolUsesCleared: 0,
        tokensSaved: 0,
        triggerType: 'manual',
        triggerValue: 0
      });

      const stats = tracker.getStatistics();
      expect(stats.avgTokensPerClear).toBe(0);
    });

    it('should handle very long paths', async () => {
      const longPath = 'a/'.repeat(100) + 'test.md';

      await expect(
        tracker.trackMemoryOperation({
          agentId: 'maria-qa',
          operation: 'create',
          path: longPath,
          success: true,
          tokensUsed: 100
        })
      ).resolves.not.toThrow();
    });

    it('should handle special characters in paths', async () => {
      const specialPath = 'test with spaces & symbols #$%.md';

      await expect(
        tracker.trackMemoryOperation({
          agentId: 'maria-qa',
          operation: 'create',
          path: specialPath,
          success: true,
          tokensUsed: 100
        })
      ).resolves.not.toThrow();
    });

    it('should handle very large token counts', async () => {
      await tracker.trackClearEvent({
        agentId: 'maria-qa',
        inputTokens: 1000000,
        toolUsesCleared: 100,
        tokensSaved: 900000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      });

      const stats = tracker.getStatistics();
      expect(stats.avgTokensPerClear).toBe(900000);
    });

    it('should handle manual trigger type', async () => {
      await tracker.trackClearEvent({
        agentId: 'maria-qa',
        inputTokens: 50000,
        toolUsesCleared: 3,
        tokensSaved: 30000,
        triggerType: 'manual',
        triggerValue: 0
      });

      const stats = tracker.getStatistics();
      expect(stats.totalClearEvents).toBe(1);
    });

    it('should track last clear event', async () => {
      await tracker.trackClearEvent({
        agentId: 'first-agent',
        inputTokens: 100000,
        toolUsesCleared: 5,
        tokensSaved: 60000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      });

      await tracker.trackClearEvent({
        agentId: 'second-agent',
        inputTokens: 110000,
        toolUsesCleared: 6,
        tokensSaved: 70000,
        triggerType: 'input_tokens',
        triggerValue: 100000
      });

      const stats = tracker.getStatistics();
      expect(stats.lastClearEvent?.agentId).toBe('second-agent');
    });
  });
});
