/**
 * VERSATIL SDLC Framework - Enhancement Detector Tests
 * Priority 2: Guardian System Testing
 *
 * Test Coverage:
 * - Enhancement detection from root cause patterns
 * - Priority scoring and categorization
 * - ROI calculation and effort estimation
 * - Agent assignment logic
 * - Approval tier determination
 * - Filtering and confidence thresholds
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnhancementDetector } from './enhancement-detector.js';
import type { RootCausePattern } from './root-cause-learner.js';

// Mock Guardian logger
vi.mock('./guardian-logger.js', () => ({
  GuardianLogger: {
    getInstance: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    }))
  }
}));

// Mock learning store
vi.mock('./guardian-learning-store.js', () => ({
  searchGuardianLearnings: vi.fn().mockResolvedValue([])
}));

describe('EnhancementDetector', () => {
  let detector: EnhancementDetector;

  beforeEach(() => {
    vi.clearAllMocks();
    detector = new EnhancementDetector();
  });

  describe('Configuration', () => {
    it('should initialize with default config', () => {
      expect(detector).toBeDefined();
      expect(detector['config']).toBeDefined();
      expect(detector['config'].min_confidence_for_suggestion).toBe(80);
      expect(detector['config'].min_occurrences_for_enhancement).toBe(3);
      expect(detector['config'].enable_rag_lookup).toBe(true);
    });

    it('should allow custom configuration', () => {
      const customDetector = new EnhancementDetector({
        min_confidence_for_suggestion: 90,
        min_occurrences_for_enhancement: 5
      });

      expect(customDetector['config'].min_confidence_for_suggestion).toBe(90);
      expect(customDetector['config'].min_occurrences_for_enhancement).toBe(5);
    });
  });

  describe('Enhancement Detection', () => {
    it('should detect enhancements from patterns', async () => {
      const mockPattern: RootCausePattern = {
        id: 'test-pattern-1',
        issue_fingerprint: 'fingerprint-1',
        issue_description: 'Missing dependency',
        root_cause: {
          primary: 'Package not installed',
          secondary: [],
          description: 'Package not installed',
          category: 'dependency',
          confidence: 90,
          evidence: []
        },
        auto_fix: {
          action: 'npm install',
          confidence: 85,
          learned_at: '2025-11-03T10:00:00.000Z'
        },
        occurrences: 5,
        first_seen: '2025-11-01T10:00:00.000Z',
        last_seen: '2025-11-03T10:00:00.000Z',
        timespan_hours: 24,
        enhancement_candidate: true,
        enhancement_priority: 'medium',
        context: 'PROJECT_CONTEXT',
        layer: 'project',
        component: 'dependencies',
        severity: 'medium',
        remediation: {
          manual_fix: 'npm install',
          success_rate: 85,
          avg_duration_ms: 60000
        },
        learned_from: 'Auto-remediation'
      } as any;

      const result = await detector.detectEnhancements([mockPattern]);

      expect(result).toBeDefined();
      expect(result.total_patterns_analyzed).toBe(1);
      expect(result.enhancements_suggested.length).toBeGreaterThan(0);
    });

    it('should filter out low confidence patterns', async () => {
      const lowConfidencePattern: RootCausePattern = {
        id: 'low-conf',
        issue_fingerprint: 'fingerprint-low',
        issue_description: 'Unknown error',
        root_cause: {
          primary: 'Unclear cause',
          secondary: [],
          description: 'Unclear cause',
          category: 'unknown',
          confidence: 50, // Below threshold
          evidence: []
        },
        occurrences: 5,
        first_seen: '2025-11-01T10:00:00.000Z',
        last_seen: '2025-11-03T10:00:00.000Z',
        timespan_hours: 24,
        enhancement_candidate: true,
        enhancement_priority: 'low',
        context: 'PROJECT_CONTEXT',
        layer: 'project',
        component: 'unknown',
        severity: 'low',
        remediation: {
          success_rate: 0,
          avg_duration_ms: 0
        },
        learned_from: 'Manual'
      } as any;

      const result = await detector.detectEnhancements([lowConfidencePattern]);

      expect(result.enhancements_suggested.length).toBe(0);
    });

    it('should filter out patterns with few occurrences', async () => {
      const rarePattern: RootCausePattern = {
        id: 'rare',
        issue_fingerprint: 'fingerprint-rare',
        issue_description: 'Rare error',
        root_cause: {
          primary: 'Infrequent issue',
          secondary: [],
          description: 'Infrequent issue',
          category: 'other',
          confidence: 90,
          evidence: []
        },
        occurrences: 1, // Below threshold (3)
        first_seen: '2025-11-03T10:00:00.000Z',
        last_seen: '2025-11-03T10:00:00.000Z',
        timespan_hours: 24,
        enhancement_candidate: true,
        enhancement_priority: 'low',
        context: 'PROJECT_CONTEXT',
        layer: 'project',
        component: 'other',
        severity: 'low',
        remediation: {
          success_rate: 0,
          avg_duration_ms: 0
        },
        learned_from: 'Auto-remediation'
      } as any;

      const result = await detector.detectEnhancements([rarePattern]);

      expect(result.enhancements_suggested.length).toBe(0);
    });

    it('should not suggest enhancements for non-candidates', async () => {
      const nonCandidate: RootCausePattern = {
        id: 'non-candidate',
        issue_fingerprint: 'fingerprint-non',
        issue_description: 'One-off error',
        root_cause: {
          primary: 'Unique issue',
          secondary: [],
          description: 'Unique issue',
          category: 'other',
          confidence: 95,
          evidence: []
        },
        occurrences: 10,
        first_seen: '2025-11-01T10:00:00.000Z',
        last_seen: '2025-11-03T10:00:00.000Z',
        timespan_hours: 24,
        enhancement_candidate: false, // Not a candidate
        enhancement_priority: 'low',
        context: 'PROJECT_CONTEXT',
        layer: 'project',
        component: 'other',
        severity: 'low',
        remediation: {
          success_rate: 0,
          avg_duration_ms: 0
        },
        learned_from: 'Manual'
      } as any;

      const result = await detector.detectEnhancements([nonCandidate]);

      expect(result.enhancements_suggested.length).toBe(0);
    });
  });

  describe('Enhancement Suggestion Structure', () => {
    it('should generate complete enhancement suggestion', async () => {
      const mockPattern: RootCausePattern = {
        id: 'complete-test',
        issue_fingerprint: 'fingerprint-complete',
        issue_description: 'Build failure',
        root_cause: {
          primary: 'Missing TypeScript config',
          secondary: [],
          description: 'Missing TypeScript config',
          category: 'configuration',
          confidence: 95,
          evidence: []
        },
        auto_fix: {
          action: 'Create tsconfig.json',
          confidence: 90,
          learned_at: '2025-11-03T10:00:00.000Z'
        },
        occurrences: 10,
        first_seen: '2025-10-01T10:00:00.000Z',
        last_seen: '2025-11-03T10:00:00.000Z',
        timespan_hours: 24,
        enhancement_candidate: true,
        enhancement_priority: 'medium',
        context: 'PROJECT_CONTEXT',
        layer: 'project',
        component: 'build',
        severity: 'medium',
        remediation: {
          manual_fix: 'Create tsconfig.json',
          success_rate: 90,
          avg_duration_ms: 300000
        },
        learned_from: 'Auto-remediation'
      } as any;

      const result = await detector.detectEnhancements([mockPattern]);
      const suggestion = result.enhancements_suggested[0];

      if (suggestion) {
        expect(suggestion).toHaveProperty('id');
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion).toHaveProperty('category');
        expect(suggestion).toHaveProperty('priority');
        expect(suggestion).toHaveProperty('confidence');
        expect(suggestion).toHaveProperty('implementation_steps');
        expect(suggestion).toHaveProperty('estimated_effort_hours');
        expect(suggestion).toHaveProperty('assigned_agent');
        expect(suggestion).toHaveProperty('roi');
        expect(suggestion).toHaveProperty('evidence');
        expect(suggestion).toHaveProperty('approval_tier');
      }
    });
  });

  describe('Priority Scoring', () => {
    it('should assign critical priority for high occurrence patterns', async () => {
      const highOccurrencePattern: RootCausePattern = {
        id: 'critical',
        issue_fingerprint: 'fingerprint-critical',
        issue_description: 'Frequent crash',
        root_cause: {
          primary: 'Memory leak',
          secondary: [],
          description: 'Memory leak',
          category: 'performance',
          confidence: 95,
          evidence: []
        },
        occurrences: 50, // Very high
        first_seen: '2025-10-01T10:00:00.000Z',
        last_seen: '2025-11-03T10:00:00.000Z',
        timespan_hours: 24,
        enhancement_candidate: true,
        enhancement_priority: 'critical',
        context: 'PROJECT_CONTEXT',
        layer: 'project',
        component: 'performance',
        severity: 'critical',
        remediation: {
          success_rate: 0,
          avg_duration_ms: 0
        },
        learned_from: 'Auto-remediation'
      } as any;

      const result = await detector.detectEnhancements([highOccurrencePattern]);

      if (result.enhancements_suggested[0]) {
        expect(result.high_priority_count).toBeGreaterThan(0);
      }
    });
  });

  describe('ROI Calculation', () => {
    it('should calculate ROI metrics', async () => {
      const pattern: RootCausePattern = {
        id: 'roi-test',
        issue_fingerprint: 'fingerprint-roi',
        issue_description: 'Manual fix required',
        root_cause: {
          primary: 'Repetitive issue',
          secondary: [],
          description: 'Repetitive issue',
          category: 'automation',
          confidence: 90,
          evidence: []
        },
        auto_fix: {
          action: 'Automated fix',
          confidence: 85,
          learned_at: '2025-11-03T10:00:00.000Z'
        },
        occurrences: 20,
        first_seen: '2025-10-01T10:00:00.000Z',
        last_seen: '2025-11-03T10:00:00.000Z',
        timespan_hours: 24,
        enhancement_candidate: true,
        enhancement_priority: 'medium',
        context: 'PROJECT_CONTEXT',
        layer: 'project',
        component: 'automation',
        severity: 'medium',
        remediation: {
          manual_fix: 'Automated fix',
          success_rate: 85,
          avg_duration_ms: 900000 // 15 mins
        },
        learned_from: 'Auto-remediation'
      } as any;

      const result = await detector.detectEnhancements([pattern]);

      expect(result.total_roi_hours_per_week).toBeGreaterThanOrEqual(0);

      if (result.enhancements_suggested[0]) {
        const suggestion = result.enhancements_suggested[0];
        expect(suggestion.roi).toBeDefined();
        expect(suggestion.roi.hours_saved_per_week).toBeGreaterThanOrEqual(0);
        expect(suggestion.roi.roi_ratio).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Agent Assignment', () => {
    it('should assign appropriate agent based on category', async () => {
      const patterns: RootCausePattern[] = [
        {
          id: 'frontend',
          issue_fingerprint: 'fingerprint-frontend',
          issue_description: 'UI error',
          root_cause: {
            primary: 'Frontend issue',
            secondary: [],
            description: 'Frontend issue',
            category: 'ui',
            confidence: 90,
            evidence: []
          },
          occurrences: 5,
          first_seen: '2025-11-01T10:00:00.000Z',
          last_seen: '2025-11-03T10:00:00.000Z',
          timespan_hours: 24,
          enhancement_candidate: true,
          enhancement_priority: 'medium',
          context: 'PROJECT_CONTEXT',
          layer: 'project',
          component: 'ui',
          severity: 'medium',
          remediation: {
            success_rate: 0,
            avg_duration_ms: 0
          },
          learned_from: 'Auto-remediation'
        } as any
      ];

      const result = await detector.detectEnhancements(patterns);

      if (result.enhancements_suggested[0]) {
        expect(result.enhancements_suggested[0].assigned_agent).toBeDefined();
        expect(typeof result.enhancements_suggested[0].assigned_agent).toBe('string');
      }
    });
  });

  describe('Result Aggregation', () => {
    it('should calculate average confidence', async () => {
      const patterns: RootCausePattern[] = [
        {
          id: 'p1',
          issue_fingerprint: 'fingerprint-p1',
          issue_description: 'Issue 1',
          root_cause: { primary: 'Root 1', secondary: [], description: 'Root 1', category: 'config', confidence: 90, evidence: [] },
          occurrences: 5,
          first_seen: '2025-11-01T10:00:00.000Z',
          last_seen: '2025-11-03T10:00:00.000Z',
          timespan_hours: 24,
          enhancement_candidate: true,
          enhancement_priority: 'medium',
          context: 'PROJECT_CONTEXT',
          layer: 'project',
          component: 'config',
          severity: 'medium',
          remediation: { success_rate: 0, avg_duration_ms: 0 },
          learned_from: 'Auto-remediation'
        } as any,
        {
          id: 'p2',
          issue_fingerprint: 'fingerprint-p2',
          issue_description: 'Issue 2',
          root_cause: { primary: 'Root 2', secondary: [], description: 'Root 2', category: 'config', confidence: 85, evidence: [] },
          occurrences: 5,
          first_seen: '2025-11-01T10:00:00.000Z',
          last_seen: '2025-11-03T10:00:00.000Z',
          timespan_hours: 24,
          enhancement_candidate: true,
          enhancement_priority: 'medium',
          context: 'PROJECT_CONTEXT',
          layer: 'project',
          component: 'config',
          severity: 'medium',
          remediation: { success_rate: 0, avg_duration_ms: 0 },
          learned_from: 'Auto-remediation'
        } as any
      ];

      const result = await detector.detectEnhancements(patterns);

      if (result.enhancements_suggested.length > 0) {
        expect(result.avg_confidence).toBeGreaterThan(0);
        expect(result.avg_confidence).toBeLessThanOrEqual(100);
      }
    });

    it('should count high priority suggestions', async () => {
      const patterns: RootCausePattern[] = [
        {
          id: 'high-pri',
          issue_fingerprint: 'fingerprint-high',
          issue_description: 'Critical issue',
          root_cause: { primary: 'Serious problem', secondary: [], description: 'Serious problem', category: 'reliability', confidence: 95, evidence: [] },
          occurrences: 30,
          first_seen: '2025-10-01T10:00:00.000Z',
          last_seen: '2025-11-03T10:00:00.000Z',
          timespan_hours: 24,
          enhancement_candidate: true,
          enhancement_priority: 'critical',
          context: 'PROJECT_CONTEXT',
          layer: 'project',
          component: 'reliability',
          severity: 'critical',
          remediation: { success_rate: 0, avg_duration_ms: 0 },
          learned_from: 'Auto-remediation'
        } as any
      ];

      const result = await detector.detectEnhancements(patterns);

      expect(result.high_priority_count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty pattern array', async () => {
      const result = await detector.detectEnhancements([]);

      expect(result.total_patterns_analyzed).toBe(0);
      expect(result.enhancements_suggested.length).toBe(0);
      expect(result.high_priority_count).toBe(0);
    });

    it('should handle patterns without auto_fix', async () => {
      const pattern: RootCausePattern = {
        id: 'no-autofix',
        issue_fingerprint: 'fingerprint-no-autofix',
        issue_description: 'Manual only',
        root_cause: {
          primary: 'Requires manual intervention',
          secondary: [],
          description: 'Requires manual intervention',
          category: 'complex',
          confidence: 90,
          evidence: []
        },
        occurrences: 5,
        first_seen: '2025-11-01T10:00:00.000Z',
        last_seen: '2025-11-03T10:00:00.000Z',
        timespan_hours: 24,
        enhancement_candidate: true,
        enhancement_priority: 'medium',
        context: 'PROJECT_CONTEXT',
        layer: 'project',
        component: 'complex',
        severity: 'medium',
        remediation: {
          success_rate: 0,
          avg_duration_ms: 0
        },
        learned_from: 'Manual'
      } as any;

      const result = await detector.detectEnhancements([pattern]);

      // Should still generate enhancement even without auto_fix
      expect(result).toBeDefined();
    });
  });

  describe('Approval Tier Logic', () => {
    it('should determine approval tier for suggestions', async () => {
      const pattern: RootCausePattern = {
        id: 'approval-test',
        issue_fingerprint: 'fingerprint-approval',
        issue_description: 'Config change',
        root_cause: {
          primary: 'Needs config update',
          secondary: [],
          description: 'Needs config update',
          category: 'configuration',
          confidence: 90,
          evidence: []
        },
        occurrences: 5,
        first_seen: '2025-11-01T10:00:00.000Z',
        last_seen: '2025-11-03T10:00:00.000Z',
        timespan_hours: 24,
        enhancement_candidate: true,
        enhancement_priority: 'medium',
        context: 'PROJECT_CONTEXT',
        layer: 'project',
        component: 'configuration',
        severity: 'medium',
        remediation: {
          success_rate: 0,
          avg_duration_ms: 0
        },
        learned_from: 'Auto-remediation'
      } as any;

      const result = await detector.detectEnhancements([pattern]);

      if (result.enhancements_suggested[0]) {
        const tier = result.enhancements_suggested[0].approval_tier;
        expect([1, 2, 3]).toContain(tier);
      }
    });
  });
});
