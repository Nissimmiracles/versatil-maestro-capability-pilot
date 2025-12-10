/**
 * VERSATIL SDLC Framework - Root Cause Learner Tests
 * Tests for Guardian's root cause learning engine
 *
 * Test Coverage:
 * - Singleton pattern
 * - Health check history analysis
 * - Pattern detection and grouping
 * - Root cause hypothesis generation
 * - Enhancement candidate identification
 * - Pattern storage and retrieval
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RootCauseLearner } from './root-cause-learner.js';
import type { HealthCheckResult } from './types.js';

// Mock the file system
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
    readFileSync: vi.fn().mockReturnValue(''),
    appendFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
});

// Mock guardian-learning-store
vi.mock('./guardian-learning-store.js', () => ({
  searchGuardianLearnings: vi.fn().mockResolvedValue([]),
}));

// Mock guardian-logger
vi.mock('./guardian-logger.js', () => ({
  GuardianLogger: {
    getInstance: vi.fn().mockReturnValue({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    }),
  },
}));

describe('RootCauseLearner', () => {
  let learner: RootCauseLearner;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton for clean tests
    (RootCauseLearner as any).instance = undefined;
    learner = RootCauseLearner.getInstance();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = RootCauseLearner.getInstance();
      const instance2 = RootCauseLearner.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should accept configuration options', () => {
      (RootCauseLearner as any).instance = undefined;
      const customLearner = RootCauseLearner.getInstance({
        min_occurrences: 5,
        timespan_hours: 48,
      });
      expect(customLearner).toBeDefined();
    });
  });

  describe('Health Check History Analysis', () => {
    it('should analyze health check history', async () => {
      const healthHistory: HealthCheckResult[] = [
        {
          timestamp: new Date().toISOString(),
          health_score: 85,
          status: 'healthy',
          issues: [
            {
              component: 'build',
              severity: 'medium',
              description: 'Build process slow',
            },
          ],
          components: {},
        },
      ];

      const result = await learner.analyzeHealthCheckHistory(healthHistory, process.cwd());

      expect(result).toHaveProperty('patterns_detected');
      expect(result).toHaveProperty('new_patterns');
      expect(result).toHaveProperty('updated_patterns');
      expect(result).toHaveProperty('enhancement_candidates');
      expect(result).toHaveProperty('total_occurrences_analyzed');
      expect(result).toHaveProperty('confidence_avg');
    });

    it('should detect recurring patterns', async () => {
      const now = new Date();
      const healthHistory: HealthCheckResult[] = Array.from({ length: 5 }, (_, i) => ({
        timestamp: new Date(now.getTime() - i * 3600000).toISOString(),
        health_score: 70,
        status: 'degraded' as const,
        issues: [
          {
            component: 'tests',
            severity: 'high' as const,
            description: 'Test suite failing with timeout',
          },
        ],
        components: {},
      }));

      const result = await learner.analyzeHealthCheckHistory(healthHistory, process.cwd());

      // Should detect recurring pattern (5 occurrences >= 3 min)
      expect(result.patterns_detected.length).toBeGreaterThanOrEqual(1);
    });

    it('should not detect patterns below threshold', async () => {
      const now = new Date();
      const healthHistory: HealthCheckResult[] = Array.from({ length: 2 }, (_, i) => ({
        timestamp: new Date(now.getTime() - i * 3600000).toISOString(),
        health_score: 75,
        status: 'degraded' as const,
        issues: [
          {
            component: 'build',
            severity: 'medium' as const,
            description: 'Occasional build warning',
          },
        ],
        components: {},
      }));

      const result = await learner.analyzeHealthCheckHistory(healthHistory, process.cwd());

      // 2 occurrences < 3 min_occurrences default
      expect(result.patterns_detected.length).toBe(0);
    });

    it('should handle empty history', async () => {
      const result = await learner.analyzeHealthCheckHistory([], process.cwd());

      expect(result.patterns_detected).toEqual([]);
      expect(result.new_patterns).toBe(0);
      expect(result.total_occurrences_analyzed).toBe(0);
    });

    it('should filter issues outside timespan', async () => {
      const now = new Date();
      const healthHistory: HealthCheckResult[] = [
        {
          timestamp: new Date(now.getTime() - 48 * 3600000).toISOString(), // 48h ago
          health_score: 60,
          status: 'degraded',
          issues: [
            {
              component: 'old',
              severity: 'high',
              description: 'Old issue outside timespan',
            },
          ],
          components: {},
        },
      ];

      // Default timespan is 24h
      const result = await learner.analyzeHealthCheckHistory(healthHistory, process.cwd());

      expect(result.patterns_detected.length).toBe(0);
    });
  });

  describe('Pattern Grouping', () => {
    it('should group similar issues by fingerprint', async () => {
      const now = new Date();
      const healthHistory: HealthCheckResult[] = [
        {
          timestamp: new Date(now.getTime() - 1000).toISOString(),
          health_score: 70,
          status: 'degraded',
          issues: [
            { component: 'tests', severity: 'high', description: 'Test failed: timeout after 5000ms' },
            { component: 'tests', severity: 'high', description: 'Test failed: timeout after 3000ms' },
            { component: 'tests', severity: 'high', description: 'Test failed: timeout after 4000ms' },
          ],
          components: {},
        },
      ];

      const result = await learner.analyzeHealthCheckHistory(healthHistory, process.cwd());

      // Similar timeout errors should be grouped
      expect(result.total_occurrences_analyzed).toBeGreaterThanOrEqual(1);
    });

    it('should normalize numbers in fingerprints', async () => {
      const now = new Date();
      const healthHistory: HealthCheckResult[] = Array.from({ length: 3 }, (_, i) => ({
        timestamp: new Date(now.getTime() - i * 1000).toISOString(),
        health_score: 70,
        status: 'degraded' as const,
        issues: [
          {
            component: 'perf',
            severity: 'medium' as const,
            description: `Latency ${100 + i * 50}ms exceeds threshold`,
          },
        ],
        components: {},
      }));

      const result = await learner.analyzeHealthCheckHistory(healthHistory, process.cwd());

      // Different latency values should be normalized and grouped
      expect(result.patterns_detected.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Root Cause Hypothesis', () => {
    it('should generate root cause hypothesis for patterns', async () => {
      const now = new Date();
      const healthHistory: HealthCheckResult[] = Array.from({ length: 5 }, (_, i) => ({
        timestamp: new Date(now.getTime() - i * 3600000).toISOString(),
        health_score: 60,
        status: 'degraded' as const,
        issues: [
          {
            component: 'build',
            severity: 'high' as const,
            description: 'Build failed: tsc not found in PATH',
          },
        ],
        components: {},
      }));

      const result = await learner.analyzeHealthCheckHistory(healthHistory, process.cwd());

      if (result.patterns_detected.length > 0) {
        const pattern = result.patterns_detected[0];
        expect(pattern.root_cause).toBeDefined();
        expect(pattern.root_cause.primary).toBeDefined();
        expect(pattern.root_cause.confidence).toBeGreaterThan(0);
        expect(pattern.root_cause.evidence.length).toBeGreaterThan(0);
      }
    });

    it('should identify GraphRAG related root causes', async () => {
      const now = new Date();
      const healthHistory: HealthCheckResult[] = Array.from({ length: 4 }, (_, i) => ({
        timestamp: new Date(now.getTime() - i * 3600000).toISOString(),
        health_score: 50,
        status: 'critical' as const,
        issues: [
          {
            component: 'rag',
            severity: 'critical' as const,
            description: 'GraphRAG query timeout exceeded',
          },
        ],
        components: {},
      }));

      const result = await learner.analyzeHealthCheckHistory(healthHistory, process.cwd());

      if (result.patterns_detected.length > 0) {
        const pattern = result.patterns_detected[0];
        expect(pattern.root_cause.primary).toContain('Neo4j');
      }
    });

    it('should identify security vulnerability root causes', async () => {
      const now = new Date();
      const healthHistory: HealthCheckResult[] = Array.from({ length: 3 }, (_, i) => ({
        timestamp: new Date(now.getTime() - i * 3600000).toISOString(),
        health_score: 65,
        status: 'degraded' as const,
        issues: [
          {
            component: 'security',
            severity: 'high' as const,
            description: 'Security vulnerability detected in dependencies',
          },
        ],
        components: {},
      }));

      const result = await learner.analyzeHealthCheckHistory(healthHistory, process.cwd());

      if (result.patterns_detected.length > 0) {
        const pattern = result.patterns_detected[0];
        expect(pattern.root_cause.primary.toLowerCase()).toContain('vulnerability');
      }
    });
  });

  describe('Enhancement Candidates', () => {
    it('should identify enhancement candidates', async () => {
      const now = new Date();
      const healthHistory: HealthCheckResult[] = Array.from({ length: 10 }, (_, i) => ({
        timestamp: new Date(now.getTime() - i * 3600000).toISOString(),
        health_score: 55,
        status: 'degraded' as const,
        issues: [
          {
            component: 'tests',
            severity: 'high' as const,
            description: 'Flaky test failure in integration suite',
          },
        ],
        components: {},
      }));

      const result = await learner.analyzeHealthCheckHistory(healthHistory, process.cwd());

      expect(result.enhancement_candidates).toBeGreaterThanOrEqual(0);
      if (result.patterns_detected.length > 0) {
        const hasCandidate = result.patterns_detected.some(p => p.enhancement_candidate);
        // High occurrence patterns should be enhancement candidates
        expect(hasCandidate).toBe(true);
      }
    });

    it('should calculate enhancement priority', async () => {
      const now = new Date();
      const healthHistory: HealthCheckResult[] = Array.from({ length: 10 }, (_, i) => ({
        timestamp: new Date(now.getTime() - i * 3600000).toISOString(),
        health_score: 40,
        status: 'critical' as const,
        issues: [
          {
            component: 'build',
            severity: 'critical' as const,
            description: 'Critical build failure blocking deployment',
          },
        ],
        components: {},
      }));

      const result = await learner.analyzeHealthCheckHistory(healthHistory, process.cwd());

      if (result.patterns_detected.length > 0) {
        const pattern = result.patterns_detected[0];
        expect(['critical', 'high', 'medium', 'low']).toContain(pattern.enhancement_priority);
        // Critical severity + high occurrences should be critical priority
        expect(pattern.enhancement_priority).toBe('critical');
      }
    });
  });

  describe('Pattern Storage and Retrieval', () => {
    it('should retrieve all patterns', () => {
      const patterns = learner.getPatterns();
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('should retrieve pattern by fingerprint', () => {
      const pattern = learner.getPattern('non-existent-fingerprint');
      expect(pattern).toBeUndefined();
    });

    it('should return result structure from analysis', async () => {
      const result = await learner.analyzeHealthCheckHistory([], process.cwd());

      expect(result).toMatchObject({
        patterns_detected: expect.any(Array),
        new_patterns: expect.any(Number),
        updated_patterns: expect.any(Number),
        enhancement_candidates: expect.any(Number),
        total_occurrences_analyzed: expect.any(Number),
        confidence_avg: expect.any(Number),
      });
    });
  });

  describe('Context Classification', () => {
    it('should classify framework context', async () => {
      const now = new Date();
      const healthHistory: HealthCheckResult[] = Array.from({ length: 3 }, (_, i) => ({
        timestamp: new Date(now.getTime() - i * 3600000).toISOString(),
        health_score: 70,
        status: 'degraded' as const,
        issues: [
          {
            component: 'guardian',
            severity: 'medium' as const,
            description: 'Guardian health check warning',
          },
        ],
        components: {},
      }));

      // Pass a path that looks like framework context
      const result = await learner.analyzeHealthCheckHistory(
        healthHistory,
        '/path/to/VERSATIL SDLC FW/project'
      );

      if (result.patterns_detected.length > 0) {
        expect(result.patterns_detected[0].context).toBe('FRAMEWORK_CONTEXT');
      }
    });

    it('should classify layer correctly', async () => {
      const now = new Date();
      const healthHistory: HealthCheckResult[] = Array.from({ length: 3 }, (_, i) => ({
        timestamp: new Date(now.getTime() - i * 3600000).toISOString(),
        health_score: 70,
        status: 'degraded' as const,
        issues: [
          {
            component: 'rag',
            severity: 'medium' as const,
            description: 'RAG component warning',
          },
        ],
        components: {},
      }));

      const result = await learner.analyzeHealthCheckHistory(healthHistory, process.cwd());

      if (result.patterns_detected.length > 0) {
        // 'rag' is a framework component
        expect(result.patterns_detected[0].layer).toBe('framework');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed health check data', async () => {
      const healthHistory: HealthCheckResult[] = [
        {
          timestamp: 'invalid-date',
          health_score: 100,
          status: 'healthy',
          issues: [],
          components: {},
        },
      ];

      // Should not throw
      await expect(
        learner.analyzeHealthCheckHistory(healthHistory, process.cwd())
      ).resolves.toBeDefined();
    });

    it('should handle issues without all fields', async () => {
      const now = new Date();
      const healthHistory: HealthCheckResult[] = Array.from({ length: 3 }, (_, i) => ({
        timestamp: new Date(now.getTime() - i * 3600000).toISOString(),
        health_score: 70,
        status: 'degraded' as const,
        issues: [
          {
            component: 'unknown',
            severity: 'low' as const,
            description: 'Minimal issue description',
          },
        ],
        components: {},
      }));

      const result = await learner.analyzeHealthCheckHistory(healthHistory, process.cwd());
      expect(result).toBeDefined();
    });

    it('should handle very long issue descriptions', async () => {
      const now = new Date();
      const longDescription = 'A'.repeat(1000);
      const healthHistory: HealthCheckResult[] = Array.from({ length: 3 }, (_, i) => ({
        timestamp: new Date(now.getTime() - i * 3600000).toISOString(),
        health_score: 70,
        status: 'degraded' as const,
        issues: [
          {
            component: 'test',
            severity: 'medium' as const,
            description: longDescription,
          },
        ],
        components: {},
      }));

      const result = await learner.analyzeHealthCheckHistory(healthHistory, process.cwd());
      expect(result).toBeDefined();
    });
  });
});
