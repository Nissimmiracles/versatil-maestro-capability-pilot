/**
 * Tests for VERSATIL Logger System
 */

import { describe, it, expect, beforeEach, afterEach, vi, type MockInstance } from 'vitest';
import { VERSATILLogger, LogLevel, LogEntry } from '../../src/utils/logger';

describe('VERSATILLogger', () => {
  let logger: VERSATILLogger;
  let consoleLogSpy: MockInstance;
  let consoleErrorSpy: MockInstance;
  let consoleWarnSpy: MockInstance;

  beforeEach(() => {
    // Reset singleton before each test
    VERSATILLogger.resetInstance();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logger = new VERSATILLogger();
  });

  afterEach(() => {
    if (consoleLogSpy) consoleLogSpy.mockRestore();
    if (consoleErrorSpy) consoleErrorSpy.mockRestore();
    if (consoleWarnSpy) consoleWarnSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with correct properties', () => {
      expect(logger).toBeInstanceOf(VERSATILLogger);
      expect(logger.getLogCount()).toBe(0);
    });

    it('should be a singleton', () => {
      const logger1 = VERSATILLogger.getInstance();
      const logger2 = VERSATILLogger.getInstance();
      expect(logger1).toBe(logger2);
    });
  });

  describe('Basic Logging Methods', () => {
    it('should log info messages with storage', () => {
      logger.info('Test info message');
      const logs = logger.getRecentLogs(1);
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        level: LogLevel.INFO,
        message: 'Test info message'
      });
    });

    it('should log debug messages with storage', () => {
      logger.debug('Test debug message');
      const logs = logger.getRecentLogs(1);
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.DEBUG);
    });

    it('should log warning messages with storage', () => {
      logger.warn('Test warning message');
      const logs = logger.getRecentLogs(1);
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.WARN);
    });

    it('should log error messages with storage', () => {
      logger.error('Test error message');
      const logs = logger.getRecentLogs(1);
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.ERROR);
    });

    it('should log trace messages', () => {
      logger.trace('Test trace message');
      const logs = logger.getRecentLogs(1);
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.TRACE);
    });
  });

  describe('Context and Component Logging', () => {
    it('should include context in log entries', () => {
      logger.info('Test message', { key: 'value' });
      const logs = logger.getRecentLogs(1);
      expect(logs[0].context).toEqual({ key: 'value' });
    });

    it('should include component in log entries', () => {
      logger.info('Test message', {}, 'test-component');
      const logs = logger.getRecentLogs(1);
      expect(logs[0].component).toBe('test-component');
    });

    it('should include agent ID in log entries', () => {
      logger.info('Test message', { agentId: 'maria-qa' });
      const logs = logger.getRecentLogs(1);
      expect(logs[0].agentId).toBe('maria-qa');
    });

    it('should handle both context and component', () => {
      logger.info('Test message', { key: 'value' }, 'test-component');
      const logs = logger.getRecentLogs(1);
      expect(logs[0].context).toEqual({ key: 'value' });
      expect(logs[0].component).toBe('test-component');
    });
  });

  describe('Specialized Logging Methods', () => {
    it('should log agent-specific messages', () => {
      logger.agent('maria-qa', 'Agent activated');
      const logs = logger.getRecentLogs(1);
      expect(logs[0].component).toBe('agent:maria-qa');
      expect(logs[0].context?.agentId).toBe('maria-qa');
    });

    it('should log performance metrics', () => {
      logger.performance('response_time', 150, 'ms');
      const logs = logger.getRecentLogs(1);
      expect(logs[0].context?.metric).toBe('response_time');
      expect(logs[0].context?.value).toBe(150);
      expect(logs[0].context?.unit).toBe('ms');
      expect(logs[0].context?.type).toBe('performance');
    });

    it('should log quality metrics', () => {
      logger.quality('coverage', 85, 80);
      const logs = logger.getRecentLogs(1);
      expect(logs[0].context?.metric).toBe('coverage');
      expect(logs[0].context?.value).toBe(85);
      expect(logs[0].context?.status).toBe('PASS');
    });

    it('should log security events', () => {
      logger.security('unauthorized_access', 'high');
      const logs = logger.getRecentLogs(1);
      expect(logs[0].context?.event).toBe('unauthorized_access');
      expect(logs[0].context?.severity).toBe('high');
      expect(logs[0].level).toBe(LogLevel.ERROR);
    });

    it('should log configuration changes', () => {
      logger.config('maxRetries', 3, 5);
      const logs = logger.getRecentLogs(1);
      expect(logs[0].context?.setting).toBe('maxRetries');
      expect(logs[0].context?.oldValue).toBe(3);
      expect(logs[0].context?.newValue).toBe(5);
    });
  });

  describe('Warning Method Alias', () => {
    it('should provide warning method as alias for warn', () => {
      logger.warning('Test warning via alias', {}, 'test-component');
      expect(consoleWarnSpy).toHaveBeenCalled();
      const logs = logger.getRecentLogs(1);
      expect(logs[0].level).toBe(LogLevel.WARN);
    });
  });

  describe('Log Retrieval and Filtering', () => {
    it('should retrieve recent logs', () => {
      logger.info('Message 1');
      logger.info('Message 2');
      logger.info('Message 3');
      const logs = logger.getRecentLogs(2);
      expect(logs).toHaveLength(2);
      expect(logs[0].message).toBe('Message 2');
      expect(logs[1].message).toBe('Message 3');
    });

    it('should filter logs by level', () => {
      logger.debug('Debug message');
      logger.info('Info message');
      logger.error('Error message');
      const errorLogs = logger.getLogsByLevel(LogLevel.ERROR);
      expect(errorLogs.every(log => log.level >= LogLevel.ERROR)).toBe(true);
    });

    it('should filter logs by component', () => {
      logger.info('Message 1', {}, 'component-a');
      logger.info('Message 2', {}, 'component-b');
      logger.info('Message 3', {}, 'component-a');
      const logs = logger.getLogsByComponent('component-a');
      expect(logs).toHaveLength(2);
      expect(logs.every(log => log.component === 'component-a')).toBe(true);
    });

    it('should filter logs by agent', () => {
      logger.info('Message 1', { agentId: 'maria-qa' });
      logger.info('Message 2', { agentId: 'james-frontend' });
      logger.info('Message 3', { agentId: 'maria-qa' });
      const logs = logger.getLogsByAgent('maria-qa');
      expect(logs).toHaveLength(2);
      expect(logs.every(log => log.agentId === 'maria-qa')).toBe(true);
    });
  });

  describe('Log Management', () => {
    it('should limit log entries to prevent memory issues', () => {
      logger.setMaxEntries(5);
      for (let i = 0; i < 10; i++) {
        logger.info(`Message ${i}`);
      }
      expect(logger.getLogCount()).toBe(5);
      const logs = logger.getAllLogs();
      expect(logs[0].message).toBe('Message 5');
    });

    it('should clear logs', () => {
      logger.info('Message 1');
      logger.info('Message 2');
      expect(logger.getLogCount()).toBe(2);
      logger.clearLogs();
      expect(logger.getLogCount()).toBe(0);
    });
  });

  describe('Log Export', () => {
    it('should export logs as JSON', () => {
      logger.info('Test message', { key: 'value' });
      const json = logger.exportJSON();
      const parsed = JSON.parse(json);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0].message).toBe('Test message');
    });

    it('should export logs as CSV', () => {
      logger.info('Test message', { key: 'value' }, 'test-component');
      const csv = logger.exportCSV();
      expect(csv).toContain('timestamp,level,levelName,message,component,agentId,context');
      expect(csv).toContain('Test message');
    });

    it('should default to JSON export', () => {
      logger.info('Test message');
      const exported = logger.export();
      expect(() => JSON.parse(exported)).not.toThrow();
    });
  });

  describe('Console Output', () => {
    it('should output to console for different levels', () => {
      logger.info('Info message', {}, 'test');
      expect(consoleLogSpy).toHaveBeenCalled();

      logger.warn('Warn message', {}, 'test');
      expect(consoleWarnSpy).toHaveBeenCalled();

      logger.error('Error message', {}, 'test');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle null context gracefully', () => {
      expect(() => logger.info('Test message', null as any, 'test')).not.toThrow();
    });

    it('should handle undefined context gracefully', () => {
      expect(() => logger.info('Test message', undefined, 'test')).not.toThrow();
    });

    it('should handle circular references in context', () => {
      const obj: any = { name: 'test' };
      obj.self = obj; // Circular reference
      expect(() => logger.info('Test message', obj)).not.toThrow();
      const logs = logger.getRecentLogs(1);
      expect(logs[0].context).toBeDefined();
    });

    it('should handle large context objects', () => {
      const largeContext = { data: 'x'.repeat(200000) }; // 200KB
      expect(() => logger.info('Test message', largeContext)).not.toThrow();
      const logs = logger.getRecentLogs(1);
      expect(logs[0].context?._truncated).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should handle high-frequency logging efficiently', () => {
      const startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        logger.info(`Message ${i}`, { iteration: i }, 'perf-test');
      }
      const duration = Date.now() - startTime;
      // Should complete 100 logs in under 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should maintain performance with large log history', () => {
      // Fill up logs
      for (let i = 0; i < 1000; i++) {
        logger.info(`Message ${i}`);
      }

      // Time retrieval operations
      const startTime = Date.now();
      logger.getRecentLogs(100);
      logger.filterLogs({ level: LogLevel.INFO });
      const duration = Date.now() - startTime;

      // Should complete in under 50ms
      expect(duration).toBeLessThan(50);
    });
  });
});
