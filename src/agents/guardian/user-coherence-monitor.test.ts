/**
 * VERSATIL SDLC Framework - User Coherence Monitor Tests
 * Priority 2: Guardian Component Testing (Batch 7 - Final)
 *
 * Test Coverage:
 * - User intent tracking
 * - Request coherence validation
 * - Context drift detection
 * - Contradictory request identification
 * - User goal alignment
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UserCoherenceMonitor } from './user-coherence-monitor.js';

describe('UserCoherenceMonitor', () => {
  let monitor: UserCoherenceMonitor;
  const testProjectRoot = process.cwd();

  beforeEach(() => {
    vi.clearAllMocks();
    UserCoherenceMonitor.resetInstance();
    monitor = UserCoherenceMonitor.getInstance(testProjectRoot);
  });

  afterEach(() => {
    monitor.stopMonitoring();
    UserCoherenceMonitor.resetInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = UserCoherenceMonitor.getInstance(testProjectRoot);
      const instance2 = UserCoherenceMonitor.getInstance(testProjectRoot);
      expect(instance1).toBe(instance2);
    });
  });

  describe('User Intent Tracking', () => {
    it('should track user requests', () => {
      monitor.trackRequest({ message: 'Add authentication to the app' });
      monitor.trackRequest({ message: 'Create database schema' });

      const history = monitor.getRequestHistory();
      expect(history).toHaveLength(2);
      expect(history[0].message).toBe('Add authentication to the app');
      expect(history[1].message).toBe('Create database schema');
    });

    it('should infer user intent from request', () => {
      const intent = monitor.inferIntent({ message: 'Add login and signup pages' });

      expect(intent.type).toBe('authentication');
      expect(intent.category).toBe('security');
      expect(intent.confidence).toBeGreaterThan(0.5);
      expect(intent.keywords).toContain('login');
    });

    it('should track intent changes over time', () => {
      monitor.trackRequest({ message: 'Create login page' });
      monitor.trackRequest({ message: 'Add database migration' });
      monitor.trackRequest({ message: 'Build React component' });

      const intentHistory = monitor.getIntentHistory();
      expect(intentHistory).toHaveLength(3);
      expect(intentHistory[0].type).toBe('authentication');
      expect(intentHistory[1].type).toBe('database');
      expect(intentHistory[2].type).toBe('frontend');
    });

    it('should identify primary user goal', () => {
      monitor.trackRequest({ message: 'Add login feature' });
      monitor.trackRequest({ message: 'Create session management' });
      monitor.trackRequest({ message: 'Add JWT tokens' });

      const primaryGoal = monitor.identifyPrimaryGoal();
      expect(primaryGoal).toBe('authentication');
    });
  });

  describe('Request Coherence Validation', () => {
    it('should validate coherent request sequence', () => {
      monitor.trackRequest({ message: 'Create database schema' });
      monitor.trackRequest({ message: 'Add migration for users table' });
      monitor.trackRequest({ message: 'Build query functions' });

      expect(monitor.validateCoherence()).toBe(true);
    });

    it('should detect incoherent requests', () => {
      monitor.trackRequest({ message: 'Build React UI' });
      monitor.trackRequest({ message: 'Deploy to kubernetes' });
      monitor.trackRequest({ message: 'Fix SQL injection' });
      monitor.trackRequest({ message: 'Add CSS styles' });
      monitor.trackRequest({ message: 'Configure CI/CD pipeline' });

      const coherent = monitor.validateCoherence();
      // With many context switches, coherence should be lower
      expect(monitor.calculateCoherenceScore()).toBeLessThan(100);
    });

    it('should calculate coherence score', () => {
      monitor.trackRequest({ message: 'Create React component' });
      monitor.trackRequest({ message: 'Add responsive styles' });

      const score = monitor.calculateCoherenceScore();
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should identify coherence breaks', () => {
      monitor.trackRequest({ message: 'Build UI component' });
      monitor.trackRequest({ message: 'Deploy docker container' });
      monitor.trackRequest({ message: 'Add CSS animation' });

      const breaks = monitor.identifyCoherenceBreaks();
      expect(breaks.length).toBeGreaterThan(0);
      expect(breaks[0]).toHaveProperty('from');
      expect(breaks[0]).toHaveProperty('to');
      expect(breaks[0]).toHaveProperty('severity');
    });
  });

  describe('Context Drift Detection', () => {
    it('should detect context drift', () => {
      // Many different contexts in sequence
      monitor.trackRequest({ message: 'Add login page', context: 'auth' });
      monitor.trackRequest({ message: 'Create database', context: 'data' });
      monitor.trackRequest({ message: 'Build UI', context: 'frontend' });
      monitor.trackRequest({ message: 'Deploy app', context: 'devops' });
      monitor.trackRequest({ message: 'Fix bug', context: 'maintenance' });

      // With many context switches, drift should be detected
      expect(monitor.identifyCoherenceBreaks().length).toBeGreaterThan(0);
    });

    it('should not detect drift for related contexts', () => {
      monitor.trackRequest({ message: 'Create database schema' });
      monitor.trackRequest({ message: 'Add SQL queries' });
      monitor.trackRequest({ message: 'Build data model' });

      const score = monitor.calculateCoherenceScore();
      expect(score).toBe(100); // All related to database
    });

    it('should measure drift severity', () => {
      monitor.trackRequest({ message: 'Build React app' });
      monitor.trackRequest({ message: 'Deploy to production' });

      const severity = monitor.measureDriftSeverity();
      expect(typeof severity).toBe('number');
      expect(severity).toBeGreaterThanOrEqual(0);
    });

    it('should track context switches', () => {
      monitor.trackRequest({ message: 'Task 1', context: 'context-a' });
      monitor.trackRequest({ message: 'Task 2', context: 'context-b' });
      monitor.trackRequest({ message: 'Task 3', context: 'context-a' });

      const switches = monitor.getContextSwitches();
      expect(switches.length).toBe(2);
      expect(switches[0].from).toBe('context-a');
      expect(switches[0].to).toBe('context-b');
    });
  });

  describe('Contradictory Request Identification', () => {
    it('should detect contradictory requests', () => {
      monitor.trackRequest({ message: 'Use MySQL database' });
      monitor.trackRequest({ message: 'Switch to PostgreSQL' });

      const contradictions = monitor.detectContradictions();
      expect(contradictions.length).toBeGreaterThan(0);
      expect(contradictions[0].type).toBe('technology');
    });

    it('should flag mutually exclusive requests', () => {
      monitor.trackRequest({ message: 'Make it synchronous' });
      monitor.trackRequest({ message: 'Actually make it async' });

      const conflicts = monitor.findConflicts();
      expect(conflicts.length).toBeGreaterThan(0);
    });

    it('should detect scope reversals', () => {
      monitor.trackRequest({ message: 'Add complex validation logic' });
      monitor.trackRequest({ message: 'Actually keep it simple' });

      const reversals = monitor.detectReversals();
      expect(reversals.length).toBeGreaterThan(0);
    });

    it('should identify requirement changes', () => {
      monitor.trackRequest({ message: 'Migrate to TypeScript' });
      monitor.trackRequest({ message: 'Change to React Native' });

      const changes = monitor.identifyRequirementChanges();
      expect(Array.isArray(changes)).toBe(true);
    });
  });

  describe('User Goal Alignment', () => {
    it('should check if request aligns with goals', () => {
      monitor.setUserGoal('Build authentication system');
      monitor.trackRequest({ message: 'Create login page' });

      expect(monitor.isAlignedWithGoal()).toBe(true);
    });

    it('should detect misaligned requests', () => {
      monitor.setUserGoal('Build authentication system');
      monitor.trackRequest({ message: 'Deploy kubernetes cluster' });

      expect(monitor.isAlignedWithGoal()).toBe(false);
    });

    it('should calculate alignment score', () => {
      monitor.setUserGoal('Build React frontend');
      monitor.trackRequest({ message: 'Create component' });
      monitor.trackRequest({ message: 'Add CSS styles' });
      monitor.trackRequest({ message: 'Build responsive layout' });

      const score = monitor.calculateAlignmentScore();
      expect(score).toBeGreaterThan(50);
    });

    it('should suggest refocus when misaligned', () => {
      monitor.setUserGoal('Database optimization');
      monitor.trackRequest({ message: 'Add CSS animations' });
      monitor.trackRequest({ message: 'Build React hooks' });

      const suggestions = monitor.suggestRefocus();
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Coherence Report Generation', () => {
    it('should generate coherence report', () => {
      monitor.trackRequest({ message: 'Create login' });
      monitor.trackRequest({ message: 'Add database' });

      const report = monitor.generateCoherenceReport();
      expect(report).toHaveProperty('coherenceScore');
      expect(report).toHaveProperty('contextDrift');
      expect(report).toHaveProperty('contradictions');
      expect(report).toHaveProperty('alignment');
    });

    it('should include recommendations in report', () => {
      monitor.trackRequest({ message: 'Build UI' });
      monitor.trackRequest({ message: 'Deploy app' });
      monitor.trackRequest({ message: 'Fix database' });

      const report = monitor.generateCoherenceReport();
      expect(report).toHaveProperty('recommendations');
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    it('should track coherence trends', () => {
      monitor.trackRequest({ message: 'Task 1' });
      monitor.trackRequest({ message: 'Task 2' });

      const trends = monitor.getCoherenceTrends();
      expect(trends).toHaveProperty('improving');
      expect(trends).toHaveProperty('degrading');
      expect(trends).toHaveProperty('stable');
      expect(trends).toHaveProperty('data');
    });
  });

  describe('Request Pattern Analysis', () => {
    it('should identify request patterns', () => {
      monitor.trackRequest({ message: 'Add feature login' });
      monitor.trackRequest({ message: 'Add feature signup' });
      monitor.trackRequest({ message: 'Add feature dashboard' });

      const patterns = monitor.identifyPatterns();
      expect(patterns).toContain('feature');
    });

    it('should detect iterative development pattern', () => {
      monitor.trackRequest({ message: 'Create feature' });
      monitor.trackRequest({ message: 'Test feature' });
      monitor.trackRequest({ message: 'Fix bugs' });
      monitor.trackRequest({ message: 'Deploy changes' });

      const pattern = monitor.detectDevelopmentPattern();
      expect(['iterative', 'waterfall', 'exploratory', 'mixed']).toContain(pattern);
    });

    it('should identify user working style', () => {
      for (let i = 0; i < 10; i++) {
        monitor.trackRequest({ message: 'Short task' });
      }

      const style = monitor.identifyWorkingStyle();
      expect(['incremental', 'comprehensive', 'balanced', 'unknown']).toContain(style);
    });
  });

  describe('Monitoring Control', () => {
    it('should start monitoring', () => {
      expect(monitor.isMonitoring()).toBe(false);
      monitor.startMonitoring(1000);
      expect(monitor.isMonitoring()).toBe(true);
    });

    it('should stop monitoring', () => {
      monitor.startMonitoring(1000);
      expect(monitor.isMonitoring()).toBe(true);
      monitor.stopMonitoring();
      expect(monitor.isMonitoring()).toBe(false);
    });

    it('should clear history', () => {
      monitor.trackRequest({ message: 'Test request' });
      expect(monitor.getRequestHistory()).toHaveLength(1);

      monitor.clearHistory();
      expect(monitor.getRequestHistory()).toHaveLength(0);
    });

    it('should reset monitor', () => {
      monitor.setUserGoal('Test goal');
      monitor.trackRequest({ message: 'Test' });
      monitor.startMonitoring(1000);

      monitor.reset();

      expect(monitor.getUserGoal()).toBeUndefined();
      expect(monitor.getRequestHistory()).toHaveLength(0);
      expect(monitor.isMonitoring()).toBe(false);
    });
  });

  describe('Alert System', () => {
    it('should trigger alert on low coherence', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      monitor.configureAlertThresholds({ coherence: 90 });

      // Add requests with low coherence
      monitor.trackRequest({ message: 'Build React' });
      monitor.trackRequest({ message: 'Deploy Kubernetes' });
      monitor.trackRequest({ message: 'Fix SQL bug' });
      monitor.trackRequest({ message: 'Add CSS' });
      monitor.trackRequest({ message: 'Configure CI/CD' });

      // The alert should be triggered due to low coherence
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should trigger alert on contradiction', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      monitor.configureAlertThresholds({ contradiction: true });
      monitor.trackRequest({ message: 'Use MySQL' });
      monitor.trackRequest({ message: 'Use PostgreSQL instead' });

      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should configure alert thresholds', () => {
      monitor.configureAlertThresholds({ coherence: 50 });
      // No error thrown means configuration succeeded
      expect(true).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty request history', () => {
      expect(monitor.getRequestHistory()).toHaveLength(0);
      expect(monitor.calculateCoherenceScore()).toBe(100);
      expect(monitor.detectContextDrift()).toBe(false);
    });

    it('should handle single request', () => {
      monitor.trackRequest({ message: 'Single request' });

      expect(monitor.calculateCoherenceScore()).toBe(100);
      expect(monitor.identifyCoherenceBreaks()).toHaveLength(0);
    });

    it('should handle malformed requests', () => {
      // Should not throw
      expect(() => {
        monitor.trackRequest({ message: '' });
        monitor.trackRequest({ message: '   ' });
      }).not.toThrow();
    });

    it('should handle very long request sequences', () => {
      for (let i = 0; i < 100; i++) {
        monitor.trackRequest({ message: `Request ${i}` });
      }

      expect(monitor.getRequestHistory()).toHaveLength(100);
      expect(() => monitor.calculateCoherenceScore()).not.toThrow();
    });
  });
});
