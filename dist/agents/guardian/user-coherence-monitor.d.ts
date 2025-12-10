/**
 * User Coherence Monitor - Guardian Module for User Projects
 *
 * Proactive health monitoring and user request coherence tracking.
 *
 * Features:
 * - User request tracking and intent inference
 * - Request coherence validation
 * - Context drift detection
 * - Contradictory request identification
 * - User goal alignment
 * - Framework health monitoring
 *
 * @version 7.16.2
 */
export interface UserCoherenceMonitorConfig {
    check_interval_hours: number;
    notify_on_updates: boolean;
    notify_on_issues: boolean;
    auto_fix_threshold: number;
    enable_trend_analysis: boolean;
    coherence_threshold: number;
    alert_on_low_coherence: boolean;
    alert_on_contradiction: boolean;
}
export interface UserRequest {
    message: string;
    timestamp?: string;
    context?: string;
}
export interface UserIntent {
    type: string;
    confidence: number;
    keywords: string[];
    category: string;
}
export interface CoherenceBreak {
    index: number;
    from: string;
    to: string;
    severity: number;
}
export interface ContextSwitch {
    index: number;
    from: string;
    to: string;
    timestamp: string;
}
export interface Contradiction {
    request1: UserRequest;
    request2: UserRequest;
    type: string;
    description: string;
}
export interface Conflict {
    request1: UserRequest;
    request2: UserRequest;
    nature: string;
}
export interface Reversal {
    original: UserRequest;
    reversal: UserRequest;
    type: string;
}
export interface RequirementChange {
    from: string;
    to: string;
    request: UserRequest;
}
export interface CoherenceReport {
    coherenceScore: number;
    contextDrift: boolean;
    contradictions: Contradiction[];
    alignment: number;
    recommendations: string[];
}
export interface CoherenceTrend {
    timestamp: string;
    overall_health: number;
    issues_detected: number;
    issues_fixed: number;
    version_behind_by: number;
}
export interface CoherenceTrends {
    improving: boolean;
    degrading: boolean;
    stable: boolean;
    data: CoherenceTrend[];
}
export declare class UserCoherenceMonitor {
    private static instance;
    private logger;
    private projectRoot;
    private config;
    private lastCheckFile;
    private trendsFile;
    private requestHistory;
    private intentHistory;
    private userGoal;
    private isMonitoringActive;
    private monitoringInterval;
    private constructor();
    static getInstance(projectRoot?: string): UserCoherenceMonitor;
    static resetInstance(): void;
    configure(config: Partial<UserCoherenceMonitorConfig>): void;
    configureAlertThresholds(thresholds: {
        coherence?: number;
        contradiction?: boolean;
    }): void;
    trackRequest(request: UserRequest): void;
    getRequestHistory(): UserRequest[];
    inferIntent(request: UserRequest): UserIntent;
    getIntentHistory(): UserIntent[];
    identifyPrimaryGoal(): string;
    validateCoherence(): boolean;
    calculateCoherenceScore(): number;
    private areRelatedCategories;
    identifyCoherenceBreaks(): CoherenceBreak[];
    detectContextDrift(): boolean;
    measureDriftSeverity(): number;
    getContextSwitches(): ContextSwitch[];
    detectContradictions(): Contradiction[];
    findConflicts(): Conflict[];
    detectReversals(): Reversal[];
    identifyRequirementChanges(): RequirementChange[];
    setUserGoal(goal: string): void;
    getUserGoal(): string | undefined;
    isAlignedWithGoal(): boolean;
    calculateAlignmentScore(): number;
    suggestRefocus(): string[];
    generateCoherenceReport(): CoherenceReport;
    private generateRecommendations;
    getCoherenceTrends(): CoherenceTrends;
    private getStoredTrends;
    identifyPatterns(): string[];
    detectDevelopmentPattern(): string;
    identifyWorkingStyle(): string;
    startMonitoring(intervalMs?: number): void;
    stopMonitoring(): void;
    isMonitoring(): boolean;
    clearHistory(): void;
    reset(): void;
    private checkAlerts;
    private triggerAlert;
}
/**
 * Get User Coherence Monitor instance
 */
export declare function getUserCoherenceMonitor(projectRoot: string): UserCoherenceMonitor;
