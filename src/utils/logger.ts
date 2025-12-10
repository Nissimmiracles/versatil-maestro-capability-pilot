/**
 * VERSATIL SDLC Framework - Advanced Logger System
 *
 * Features:
 * - Log storage with configurable limits
 * - Filtering by level, component, and agent
 * - Export to JSON and CSV formats
 * - Performance metrics logging
 * - Security event logging
 * - Circular reference handling
 */

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  message: string;
  context?: Record<string, any>;
  component?: string;
  agentId?: string;
}

export interface LogFilter {
  level?: LogLevel;
  component?: string;
  agentId?: string;
  startTime?: Date;
  endTime?: Date;
}

const MAX_LOG_ENTRIES = 10000;
const MAX_CONTEXT_SIZE = 100000; // 100KB max for context

export class VERSATILLogger {
  private static instance: VERSATILLogger;
  private logs: LogEntry[] = [];
  private maxEntries: number = MAX_LOG_ENTRIES;

  constructor(private component?: string) {}

  static getInstance(component?: string): VERSATILLogger {
    if (!VERSATILLogger.instance) {
      VERSATILLogger.instance = new VERSATILLogger(component);
    }
    return VERSATILLogger.instance;
  }

  /**
   * Reset singleton instance (for testing)
   */
  static resetInstance(): void {
    VERSATILLogger.instance = undefined as any;
  }

  // ============================================================================
  // Basic Logging Methods
  // ============================================================================

  trace(message: string, context?: any, component?: string): void {
    this.log(LogLevel.TRACE, message, context, component);
  }

  debug(message: string, context?: any, component?: string): void {
    this.log(LogLevel.DEBUG, message, context, component);
  }

  info(message: string, context?: any, component?: string): void {
    this.log(LogLevel.INFO, message, context, component);
  }

  warn(message: string, context?: any, component?: string): void {
    this.log(LogLevel.WARN, message, context, component);
  }

  warning(message: string, context?: any, component?: string): void {
    this.warn(message, context, component);
  }

  error(message: string, context?: any, component?: string): void {
    this.log(LogLevel.ERROR, message, context, component);
  }

  // ============================================================================
  // Specialized Logging Methods
  // ============================================================================

  /**
   * Log agent-specific messages
   */
  agent(agentId: string, message: string, context?: any): void {
    this.log(LogLevel.INFO, message, { ...context, agentId }, `agent:${agentId}`);
  }

  /**
   * Log performance metrics
   */
  performance(metric: string, value: number, unit: string, context?: any): void {
    this.log(LogLevel.INFO, `Performance: ${metric} = ${value}${unit}`, {
      ...context,
      metric,
      value,
      unit,
      type: 'performance'
    }, 'performance');
  }

  /**
   * Log quality metrics
   */
  quality(metric: string, value: number, threshold?: number, context?: any): void {
    const status = threshold !== undefined ? (value >= threshold ? 'PASS' : 'FAIL') : 'N/A';
    this.log(LogLevel.INFO, `Quality: ${metric} = ${value} (${status})`, {
      ...context,
      metric,
      value,
      threshold,
      status,
      type: 'quality'
    }, 'quality');
  }

  /**
   * Log security events
   */
  security(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: any): void {
    const level = severity === 'critical' || severity === 'high' ? LogLevel.ERROR : LogLevel.WARN;
    this.log(level, `Security: ${event}`, {
      ...context,
      event,
      severity,
      type: 'security'
    }, 'security');
  }

  /**
   * Log configuration changes
   */
  config(setting: string, oldValue: any, newValue: any, context?: any): void {
    this.log(LogLevel.INFO, `Config: ${setting} changed`, {
      ...context,
      setting,
      oldValue,
      newValue,
      type: 'config'
    }, 'config');
  }

  // ============================================================================
  // Core Logging Implementation
  // ============================================================================

  private log(level: LogLevel, message: string, context?: any, component?: string): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      levelName: LogLevel[level],
      message,
      context: this.sanitizeContext(context),
      component: component || this.component || 'VERSATIL',
      agentId: context?.agentId
    };

    // Store log entry
    this.logs.push(entry);

    // Enforce max entries limit
    if (this.logs.length > this.maxEntries) {
      this.logs = this.logs.slice(-this.maxEntries);
    }

    // Output to console
    this.outputToConsole(entry);
  }

  private outputToConsole(entry: LogEntry): void {
    const logMessage = this.formatMessage(entry);
    const isMcpMode = process.env.VERSATIL_MCP_MODE === 'true';

    if (isMcpMode) {
      // In MCP mode, use stderr to avoid interfering with stdio JSON-RPC protocol
      console.error(logMessage);
    } else {
      switch (entry.level) {
        case LogLevel.ERROR:
          console.error(logMessage);
          break;
        case LogLevel.WARN:
          console.warn(logMessage);
          break;
        case LogLevel.DEBUG:
        case LogLevel.TRACE:
        case LogLevel.INFO:
        default:
          console.log(logMessage);
          break;
      }
    }
  }

  private formatMessage(entry: LogEntry): string {
    let formatted = `[${entry.component}] ${entry.levelName}: ${entry.message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      formatted += ` ${JSON.stringify(entry.context)}`;
    }

    return formatted;
  }

  private sanitizeContext(context: any): Record<string, any> | undefined {
    if (context === null || context === undefined) {
      return undefined;
    }

    try {
      // Handle circular references
      const seen = new WeakSet();
      const sanitized = JSON.parse(JSON.stringify(context, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      }));

      // Check size limit
      const size = JSON.stringify(sanitized).length;
      if (size > MAX_CONTEXT_SIZE) {
        return { _truncated: true, _originalSize: size, _message: 'Context too large' };
      }

      return sanitized;
    } catch (error) {
      return { _error: 'Failed to serialize context', _type: typeof context };
    }
  }

  // ============================================================================
  // Log Retrieval and Filtering
  // ============================================================================

  /**
   * Get recent log entries
   */
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Get all logs
   */
  getAllLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Filter logs by criteria
   */
  filterLogs(filter: LogFilter): LogEntry[] {
    return this.logs.filter(entry => {
      if (filter.level !== undefined && entry.level < filter.level) {
        return false;
      }
      if (filter.component && entry.component !== filter.component) {
        return false;
      }
      if (filter.agentId && entry.agentId !== filter.agentId) {
        return false;
      }
      if (filter.startTime && new Date(entry.timestamp) < filter.startTime) {
        return false;
      }
      if (filter.endTime && new Date(entry.timestamp) > filter.endTime) {
        return false;
      }
      return true;
    });
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.filterLogs({ level });
  }

  /**
   * Get logs by component
   */
  getLogsByComponent(component: string): LogEntry[] {
    return this.filterLogs({ component });
  }

  /**
   * Get logs by agent
   */
  getLogsByAgent(agentId: string): LogEntry[] {
    return this.filterLogs({ agentId });
  }

  // ============================================================================
  // Log Management
  // ============================================================================

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Set maximum log entries
   */
  setMaxEntries(max: number): void {
    this.maxEntries = max;
    if (this.logs.length > max) {
      this.logs = this.logs.slice(-max);
    }
  }

  /**
   * Get current log count
   */
  getLogCount(): number {
    return this.logs.length;
  }

  // ============================================================================
  // Log Export
  // ============================================================================

  /**
   * Export logs to JSON string
   */
  exportJSON(filter?: LogFilter): string {
    const logs = filter ? this.filterLogs(filter) : this.logs;
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Export logs to CSV string
   */
  exportCSV(filter?: LogFilter): string {
    const logs = filter ? this.filterLogs(filter) : this.logs;
    const headers = ['timestamp', 'level', 'levelName', 'message', 'component', 'agentId', 'context'];
    const rows = logs.map(entry => [
      entry.timestamp,
      entry.level.toString(),
      entry.levelName,
      `"${entry.message.replace(/"/g, '""')}"`,
      entry.component || '',
      entry.agentId || '',
      entry.context ? `"${JSON.stringify(entry.context).replace(/"/g, '""')}"` : ''
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Export logs (defaults to JSON)
   */
  export(format: 'json' | 'csv' = 'json', filter?: LogFilter): string {
    return format === 'csv' ? this.exportCSV(filter) : this.exportJSON(filter);
  }
}

export const log = console;
