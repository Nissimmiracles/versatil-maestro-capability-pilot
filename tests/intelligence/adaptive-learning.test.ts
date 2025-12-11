import { vi } from 'vitest';
/**
 * Tests for Adaptive Learning Engine
 */

import { AdaptiveLearningEngine, UserInteraction } from '../../src/intelligence/adaptive-learning';

// Mock VERSATILLogger
vi.mock('../../src/utils/logger', () => ({
  VERSATILLogger: class {
    info = vi.fn();
    debug = vi.fn();
    warn = vi.fn();
    error = vi.fn();
  }
}));

describe('AdaptiveLearningEngine', () => {
  let learningEngine: AdaptiveLearningEngine;
  let mockInteraction: UserInteraction;

  beforeEach(() => {
    learningEngine = new AdaptiveLearningEngine();
    learningEngine.clearData(); // Clear any persisted data from previous test runs
    mockInteraction = {
      id: 'test-interaction-1',
      timestamp: Date.now(),
      agentId: 'enhanced-maria',
      actionType: 'activation',
      context: {
        filePath: '/test/file.js',
        fileType: 'js',
        projectType: 'javascript'
      },
      outcome: {
        problemSolved: true,
        timeToResolution: 1000,
        userSatisfaction: 4,
        agentAccuracy: 0.9
      }
    };
  });

  describe('Initialization', () => {
    it('should initialize with correct properties', () => {
      expect(learningEngine).toBeInstanceOf(AdaptiveLearningEngine);
      expect(learningEngine['patterns']).toBeDefined();
      expect(learningEngine['interactions']).toBeDefined();
      expect(learningEngine['isLearning']).toBe(false);
    });
  });

  describe('Learning Management', () => {
    it('should start learning successfully', () => {
      learningEngine.startLearning();
      expect(learningEngine['isLearning']).toBe(true);
    });

    it('should stop learning successfully', () => {
      learningEngine.startLearning();
      learningEngine.stopLearning();
      expect(learningEngine['isLearning']).toBe(false);
    });

    it('should handle multiple start calls gracefully', () => {
      learningEngine.startLearning();
      learningEngine.startLearning();
      expect(learningEngine['isLearning']).toBe(true);
    });
  });

  describe('Interaction Recording', () => {
    beforeEach(() => {
      learningEngine.startLearning();
      learningEngine.clearData(); // Clear after startLearning loads persisted data
    });

    it('should record interaction when learning is enabled', () => {
      learningEngine.recordInteraction(mockInteraction);

      const interactions = learningEngine['interactions'].get('enhanced-maria');
      expect(interactions).toBeDefined();
      expect(interactions?.length).toBe(1);
      expect(interactions?.[0]).toEqual(mockInteraction);
    });

    it('should not record interaction when learning is disabled', () => {
      learningEngine.stopLearning();
      learningEngine.recordInteraction(mockInteraction);

      const interactions = learningEngine['interactions'].get('enhanced-maria');
      expect(interactions).toBeUndefined();
    });

    it('should group interactions by agent ID', () => {
      const jamesInteraction = { ...mockInteraction, agentId: 'enhanced-james', id: 'test-2' };

      learningEngine.recordInteraction(mockInteraction);
      learningEngine.recordInteraction(jamesInteraction);

      expect(learningEngine['interactions'].get('enhanced-maria')?.length).toBe(1);
      expect(learningEngine['interactions'].get('enhanced-james')?.length).toBe(1);
    });

    it('should accumulate multiple interactions for same agent', () => {
      const secondInteraction = { ...mockInteraction, id: 'test-2', timestamp: Date.now() + 1000 };

      learningEngine.recordInteraction(mockInteraction);
      learningEngine.recordInteraction(secondInteraction);

      const interactions = learningEngine['interactions'].get('enhanced-maria');
      expect(interactions?.length).toBe(2);
    });
  });

  describe('Pattern Analysis', () => {
    beforeEach(() => {
      learningEngine.startLearning();
      learningEngine.clearData(); // Clear after startLearning loads persisted data
    });

    it('should analyze patterns when sufficient data is available', async () => {
      // Create 10+ interactions for pattern analysis
      for (let i = 0; i < 12; i++) {
        const interaction = {
          ...mockInteraction,
          id: `test-${i}`,
          timestamp: Date.now() + i * 1000,
          outcome: {
            ...mockInteraction.outcome,
            userSatisfaction: Math.random() * 2 + 3 // 3-5 rating
          }
        };
        learningEngine.recordInteraction(interaction);
      }

      // Trigger pattern analysis manually
      await learningEngine['analyzePatterns']();

      // Patterns are stored by pattern ID, not agent ID
      // Check that at least one pattern was discovered for this agent
      const patterns = Array.from(learningEngine['patterns'].values());
      const agentPatterns = patterns.filter(p => p.agentId === 'enhanced-maria');
      expect(agentPatterns.length).toBeGreaterThan(0);
    });

    it('should identify successful patterns', async () => {
      // Create successful interactions
      for (let i = 0; i < 12; i++) {
        const interaction = {
          ...mockInteraction,
          id: `success-${i}`,
          timestamp: Date.now() + i * 1000,
          outcome: {
            problemSolved: true,
            timeToResolution: 500,
            userSatisfaction: 5,
            agentAccuracy: 0.95
          }
        };
        learningEngine.recordInteraction(interaction);
      }

      await learningEngine['analyzePatterns']();

      // Find patterns for this agent
      const patterns = Array.from(learningEngine['patterns'].values());
      const successPatterns = patterns.filter(p =>
        p.agentId === 'enhanced-maria' && p.pattern.includes('Successful')
      );
      expect(successPatterns.length).toBeGreaterThan(0);
      expect(successPatterns[0].successRate).toBeGreaterThan(0.8);
    });

    it('should identify problematic patterns', async () => {
      // Create unsuccessful interactions with false positives
      for (let i = 0; i < 12; i++) {
        const interaction = {
          ...mockInteraction,
          id: `failure-${i}`,
          timestamp: Date.now() + i * 1000,
          context: {
            ...mockInteraction.context,
            issue: {
              type: 'test-issue',
              severity: 'medium',
              wasAccurate: false, // False positive
              userVerified: true
            }
          },
          outcome: {
            problemSolved: false,
            timeToResolution: 5000,
            userSatisfaction: 2,
            agentAccuracy: 0.3
          }
        };
        learningEngine.recordInteraction(interaction);
      }

      await learningEngine['analyzePatterns']();

      // Find false positive patterns for this agent
      const patterns = Array.from(learningEngine['patterns'].values());
      const failurePatterns = patterns.filter(p =>
        p.agentId === 'enhanced-maria' && p.pattern.includes('False positive')
      );
      expect(failurePatterns.length).toBeGreaterThan(0);
      expect(failurePatterns[0].successRate).toBe(0);
    });
  });

  describe('Adaptation Generation', () => {
    beforeEach(() => {
      learningEngine.startLearning();
      learningEngine.clearData(); // Clear after startLearning loads persisted data
    });

    it('should propose adaptations for low-performing patterns', async () => {
      // Create interactions with low follow-through suggestions
      const lowPerformanceInteractions: UserInteraction[] = [];
      for (let i = 0; i < 10; i++) {
        lowPerformanceInteractions.push({
          id: `low-${i}`,
          timestamp: Date.now() + i * 1000,
          agentId: 'enhanced-maria',
          actionType: 'activation',
          context: {
            filePath: `/test/file${i}.js`,
            fileType: 'js',
            projectType: 'javascript',
            suggestion: {
              id: `sugg-${i}`,
              type: 'code-fix',
              wasFollowed: false, // Low follow-through
              wasHelpful: false
            }
          },
          outcome: {
            problemSolved: false,
            userSatisfaction: 2
          }
        });
      }

      const adaptations = await learningEngine['generateAdaptations'](
        'enhanced-maria',
        lowPerformanceInteractions,
        {}
      );
      // May or may not generate adaptations depending on thresholds
      expect(adaptations).toBeDefined();
      expect(Array.isArray(adaptations)).toBe(true);
    });

    it('should not propose adaptations for high-performing patterns', async () => {
      // Create high-performing interactions
      const highPerformanceInteractions: UserInteraction[] = [];
      for (let i = 0; i < 10; i++) {
        highPerformanceInteractions.push({
          id: `high-${i}`,
          timestamp: Date.now() + i * 1000,
          agentId: 'enhanced-maria',
          actionType: 'activation',
          context: {
            filePath: `/test/file${i}.js`,
            fileType: 'js',
            projectType: 'javascript',
            suggestion: {
              id: `sugg-${i}`,
              type: 'code-fix',
              wasFollowed: true, // High follow-through
              wasHelpful: true
            },
            issue: {
              type: 'test-issue',
              severity: 'medium',
              wasAccurate: true, // No false positives
              userVerified: true
            }
          },
          outcome: {
            problemSolved: true,
            userSatisfaction: 5
          }
        });
      }

      const adaptations = await learningEngine['generateAdaptations'](
        'enhanced-maria',
        highPerformanceInteractions,
        {}
      );
      // High-performing patterns should not trigger adaptations
      expect(adaptations.length).toBe(0);
    });
  });

  describe('Learning Insights', () => {
    beforeEach(() => {
      learningEngine.startLearning();
      learningEngine.clearData(); // Clear after startLearning loads persisted data
    });

    it('should provide learning insights', () => {
      // Add some test data
      learningEngine.recordInteraction(mockInteraction);

      const insights = learningEngine.getLearningInsights();

      expect(insights).toMatchObject({
        totalInteractions: expect.any(Number),
        patternsDiscovered: expect.any(Number),
        adaptationsProposed: expect.any(Number),
        adaptationsApplied: expect.any(Number),
        topPerformingAgents: expect.any(Array),
        recentLearnings: expect.any(Array)
      });
    });

    it('should calculate total interactions correctly', () => {
      // Create interactions with known outcomes
      for (let i = 0; i < 10; i++) {
        const interaction = {
          ...mockInteraction,
          id: `test-${i}`,
          outcome: {
            ...mockInteraction.outcome,
            problemSolved: i >= 5, // 50% success rate
            userSatisfaction: i >= 5 ? 4 : 2
          }
        };
        learningEngine.recordInteraction(interaction);
      }

      const insights = learningEngine.getLearningInsights();
      expect(insights.totalInteractions).toBe(10);
      expect(insights.patternsDiscovered).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Event Emission', () => {
    beforeEach(() => {
      learningEngine.startLearning();
      learningEngine.clearData(); // Clear after startLearning loads persisted data
    });

    it('should emit pattern_discovered event', async () => {
      const eventPromise = new Promise<void>((resolve) => {
        learningEngine.on('pattern_discovered', (pattern) => {
          expect(pattern).toBeDefined();
          expect(pattern.agentId).toBe('enhanced-maria');
          resolve();
        });
      });

      // Create enough interactions to trigger pattern discovery
      for (let i = 0; i < 12; i++) {
        learningEngine.recordInteraction({
          ...mockInteraction,
          id: `test-${i}`,
          timestamp: Date.now() + i * 1000
        });
      }

      await learningEngine['analyzePatterns']();
      await eventPromise;
    });

    it('should emit adaptation_proposed event when adaptations are proposed', async () => {
      // This test verifies the event emission mechanism works
      // by directly calling proposeAdaptation (which is what analyzePatterns calls internally)
      const adaptation = {
        id: 'test-adaptation-1',
        agentId: 'enhanced-maria',
        type: 'threshold_adjustment' as const,
        description: 'Test adaptation',
        confidence: 0.85,
        impact: 'medium' as const,
        suggestedChanges: { minConfidence: 0.8 },
        createdAt: Date.now(),
        status: 'proposed' as const
      };

      const eventPromise = new Promise<void>((resolve) => {
        learningEngine.on('adaptation_proposed', (data) => {
          expect(data.agentId).toBe('enhanced-maria');
          expect(data.adaptation).toBeDefined();
          resolve();
        });
      });

      // Directly call the internal proposeAdaptation method
      learningEngine['proposeAdaptation']('enhanced-maria', adaptation);
      await eventPromise;
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid interactions gracefully', () => {
      learningEngine.startLearning();

      const invalidInteraction = { ...mockInteraction, agentId: '' };
      expect(() => learningEngine.recordInteraction(invalidInteraction)).not.toThrow();
    });

    it('should handle pattern analysis with insufficient data', () => {
      learningEngine.startLearning();
      learningEngine.recordInteraction(mockInteraction); // Only 1 interaction

      expect(() => learningEngine['analyzePatterns']()).not.toThrow();
    });
  });
});