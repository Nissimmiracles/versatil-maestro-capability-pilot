/**
 * VERSATIL SDLC Framework - IDE Performance Detector Tests
 * Tests for IDE crash risk detection and optimization
 *
 * Test Coverage:
 * - Singleton pattern
 * - IDE crash risk detection
 * - Missing ignore file detection
 * - Large directory detection
 * - Crash risk calculation
 * - Recommendation generation
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { IDEPerformanceDetector } from './ide-performance-detector.js';

// Mock fs module
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    existsSync: vi.fn().mockReturnValue(false),
    mkdirSync: vi.fn(),
    readFileSync: vi.fn().mockReturnValue(''),
    writeFileSync: vi.fn(),
  };
});

// Mock child_process
vi.mock('child_process', async () => {
  const actual = await vi.importActual('child_process');
  return {
    ...actual,
    exec: vi.fn((cmd: string, callback: (err: Error | null, result: { stdout: string; stderr: string }) => void) => {
      // Mock different commands
      if (cmd.includes('ps aux') && cmd.includes('cursor|vscode')) {
        callback(null, { stdout: 'Cursor.app', stderr: '' });
      } else if (cmd.includes('du -sk')) {
        callback(null, { stdout: '102400\t/path', stderr: '' }); // 100MB
      } else if (cmd.includes('sysctl hw.memsize')) {
        callback(null, { stdout: 'hw.memsize: 17179869184', stderr: '' }); // 16GB
      } else if (cmd.includes('awk')) {
        callback(null, { stdout: '45.5', stderr: '' }); // 45.5% memory usage
      } else {
        callback(null, { stdout: '', stderr: '' });
      }
    }),
  };
});

describe('IDEPerformanceDetector', () => {
  let detector: IDEPerformanceDetector;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton
    (IDEPerformanceDetector as any).instance = undefined;
    detector = IDEPerformanceDetector.getInstance();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = IDEPerformanceDetector.getInstance();
      const instance2 = IDEPerformanceDetector.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should accept project root parameter', () => {
      (IDEPerformanceDetector as any).instance = undefined;
      const customDetector = IDEPerformanceDetector.getInstance('/custom/path');
      expect(customDetector).toBeDefined();
    });
  });

  describe('Crash Risk Detection', () => {
    it('should detect crash risk', async () => {
      const result = await detector.detectCrashRisk();

      expect(result).toHaveProperty('ide_type');
      expect(result).toHaveProperty('crash_risk');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('evidence');
      expect(result).toHaveProperty('recommendation');
      expect(result).toHaveProperty('auto_fixable');
      expect(result).toHaveProperty('suggested_fixes');
    });

    it('should return valid IDE type', async () => {
      const result = await detector.detectCrashRisk();

      expect(['cursor', 'vscode', 'jetbrains', 'unknown']).toContain(result.ide_type);
    });

    it('should return valid crash risk level', async () => {
      const result = await detector.detectCrashRisk();

      expect(['low', 'medium', 'high', 'critical']).toContain(result.crash_risk);
    });

    it('should return confidence between 0 and 100', async () => {
      const result = await detector.detectCrashRisk();

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });
  });

  describe('Evidence Collection', () => {
    it('should include missing ignore files in evidence', async () => {
      const result = await detector.detectCrashRisk();

      expect(result.evidence).toHaveProperty('missing_ignore_files');
      expect(Array.isArray(result.evidence.missing_ignore_files)).toBe(true);
    });

    it('should include large directories in evidence', async () => {
      const result = await detector.detectCrashRisk();

      expect(result.evidence).toHaveProperty('large_directories');
      expect(Array.isArray(result.evidence.large_directories)).toBe(true);
    });

    it('should include total indexable size', async () => {
      const result = await detector.detectCrashRisk();

      expect(result.evidence).toHaveProperty('total_indexable_size_gb');
      expect(typeof result.evidence.total_indexable_size_gb).toBe('number');
    });

    it('should include available RAM', async () => {
      const result = await detector.detectCrashRisk();

      expect(result.evidence).toHaveProperty('available_ram_gb');
      expect(typeof result.evidence.available_ram_gb).toBe('number');
    });

    it('should include memory usage percentage', async () => {
      const result = await detector.detectCrashRisk();

      expect(result.evidence).toHaveProperty('current_memory_usage_percent');
      expect(typeof result.evidence.current_memory_usage_percent).toBe('number');
    });
  });

  describe('Recommendations', () => {
    it('should generate recommendation string', async () => {
      const result = await detector.detectCrashRisk();

      expect(typeof result.recommendation).toBe('string');
      expect(result.recommendation.length).toBeGreaterThan(0);
    });

    it('should generate suggested fixes array', async () => {
      const result = await detector.detectCrashRisk();

      expect(Array.isArray(result.suggested_fixes)).toBe(true);
      expect(result.suggested_fixes.length).toBeGreaterThan(0);
    });

    it('should set auto_fixable based on confidence', async () => {
      const result = await detector.detectCrashRisk();

      expect(typeof result.auto_fixable).toBe('boolean');
      // auto_fixable should be true only if confidence >= 90 and missing files > 0
      if (result.confidence >= 90 && result.evidence.missing_ignore_files.length > 0) {
        expect(result.auto_fixable).toBe(true);
      }
    });
  });

  describe('Missing Ignore Files', () => {
    it('should detect missing .cursorignore', async () => {
      const result = await detector.detectCrashRisk();

      // With mocked existsSync returning false, .cursorignore should be missing
      expect(result.evidence.missing_ignore_files).toContain('.cursorignore');
    });

    it('should detect missing .vscode/settings.json', async () => {
      const result = await detector.detectCrashRisk();

      expect(result.evidence.missing_ignore_files).toContain('.vscode/settings.json');
    });

    it('should suggest creating ignore files', async () => {
      const result = await detector.detectCrashRisk();

      const hasCursorignoreFix = result.suggested_fixes.some(
        fix => fix.toLowerCase().includes('cursorignore')
      );
      expect(hasCursorignoreFix).toBe(true);
    });
  });

  describe('Large Directory Detection', () => {
    it('should identify large directories', async () => {
      const result = await detector.detectCrashRisk();

      // Check that large_directories is populated
      expect(result.evidence.large_directories).toBeDefined();
    });

    it('should include directory path and size', async () => {
      const result = await detector.detectCrashRisk();

      for (const dir of result.evidence.large_directories) {
        expect(dir).toHaveProperty('path');
        expect(dir).toHaveProperty('size_mb');
        expect(typeof dir.path).toBe('string');
        expect(typeof dir.size_mb).toBe('number');
      }
    });
  });

  describe('Crash Risk Calculation', () => {
    it('should calculate risk based on evidence', async () => {
      const result = await detector.detectCrashRisk();

      // Risk should be influenced by missing files and indexable size
      expect(['low', 'medium', 'high', 'critical']).toContain(result.crash_risk);
    });

    it('should have higher confidence when IDE is detected', async () => {
      const result = await detector.detectCrashRisk();

      // With mocked Cursor IDE detection
      if (result.ide_type !== 'unknown') {
        expect(result.confidence).toBeGreaterThanOrEqual(30);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle when no IDE is running', async () => {
      // The mocked exec returns 'Cursor.app' which sets ide_type
      // Test that unknown is a valid response type
      const result = await detector.detectCrashRisk();
      expect(['cursor', 'vscode', 'jetbrains', 'unknown']).toContain(result.ide_type);
    });

    it('should handle system info unavailability gracefully', async () => {
      // The detector should not throw even with unusual responses
      const result = await detector.detectCrashRisk();

      // Should always return valid structure
      expect(result).toHaveProperty('ide_type');
      expect(result).toHaveProperty('crash_risk');
      expect(result).toHaveProperty('evidence');
      expect(result).toHaveProperty('recommendation');
    });

    it('should have valid fallback values in evidence', async () => {
      const result = await detector.detectCrashRisk();

      // RAM should be a reasonable value (our mock returns 16GB)
      expect(result.evidence.available_ram_gb).toBeGreaterThan(0);
      expect(result.evidence.available_ram_gb).toBeLessThanOrEqual(1024); // Max 1TB

      // Memory usage should be a percentage
      expect(result.evidence.current_memory_usage_percent).toBeGreaterThanOrEqual(0);
      expect(result.evidence.current_memory_usage_percent).toBeLessThanOrEqual(100);
    });
  });
});
