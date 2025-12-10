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
export declare enum LogLevel {
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
export declare class VERSATILLogger {
    private component?;
    private static instance;
    private logs;
    private maxEntries;
    constructor(component?: string);
    static getInstance(component?: string): VERSATILLogger;
    /**
     * Reset singleton instance (for testing)
     */
    static resetInstance(): void;
    trace(message: string, context?: any, component?: string): void;
    debug(message: string, context?: any, component?: string): void;
    info(message: string, context?: any, component?: string): void;
    warn(message: string, context?: any, component?: string): void;
    warning(message: string, context?: any, component?: string): void;
    error(message: string, context?: any, component?: string): void;
    /**
     * Log agent-specific messages
     */
    agent(agentId: string, message: string, context?: any): void;
    /**
     * Log performance metrics
     */
    performance(metric: string, value: number, unit: string, context?: any): void;
    /**
     * Log quality metrics
     */
    quality(metric: string, value: number, threshold?: number, context?: any): void;
    /**
     * Log security events
     */
    security(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: any): void;
    /**
     * Log configuration changes
     */
    config(setting: string, oldValue: any, newValue: any, context?: any): void;
    private log;
    private outputToConsole;
    private formatMessage;
    private sanitizeContext;
    /**
     * Get recent log entries
     */
    getRecentLogs(count?: number): LogEntry[];
    /**
     * Get all logs
     */
    getAllLogs(): LogEntry[];
    /**
     * Filter logs by criteria
     */
    filterLogs(filter: LogFilter): LogEntry[];
    /**
     * Get logs by level
     */
    getLogsByLevel(level: LogLevel): LogEntry[];
    /**
     * Get logs by component
     */
    getLogsByComponent(component: string): LogEntry[];
    /**
     * Get logs by agent
     */
    getLogsByAgent(agentId: string): LogEntry[];
    /**
     * Clear all logs
     */
    clearLogs(): void;
    /**
     * Set maximum log entries
     */
    setMaxEntries(max: number): void;
    /**
     * Get current log count
     */
    getLogCount(): number;
    /**
     * Export logs to JSON string
     */
    exportJSON(filter?: LogFilter): string;
    /**
     * Export logs to CSV string
     */
    exportCSV(filter?: LogFilter): string;
    /**
     * Export logs (defaults to JSON)
     */
    export(format?: 'json' | 'csv', filter?: LogFilter): string;
}
export declare const log: Console;
