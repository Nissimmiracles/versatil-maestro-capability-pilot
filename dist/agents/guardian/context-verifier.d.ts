/**
 * VERSATIL SDLC Framework - Context Layer Verifier
 *
 * Verifies issues in the Context Layer (preferences & conventions):
 * - User preferences (indentation, quotes, naming, async style)
 * - Team conventions (code style, commit format, testing policy)
 * - Project vision alignment (goals, values, priorities)
 * - Style consistency (across codebase)
 *
 * Part of Guardian's anti-hallucination system (v7.7.0+)
 *
 * Context Priority: User > Team > Project > Framework
 */
import type { HealthIssue } from './types.js';
export interface ContextVerification {
    claim: string;
    verified: boolean;
    method: string;
    confidence: number;
    evidence?: {
        user_preference?: any;
        team_convention?: any;
        project_vision?: any;
        actual_value?: any;
        expected_value?: any;
        priority_violation?: {
            expected_priority: string;
            actual_priority: string;
        };
        error_details?: string;
    };
}
export interface PriorityViolation {
    field: string;
    expected_value: string;
    actual_value: string;
    expected_priority: 'User' | 'Team' | 'Project' | 'Framework';
    actual_priority: 'User' | 'Team' | 'Project' | 'Framework';
    severity: 'critical' | 'high' | 'medium' | 'low';
    explanation: string;
}
export interface ContextVerificationResult {
    issue_id: string;
    layer: 'context';
    verified: boolean;
    confidence: number;
    verifications: ContextVerification[];
    recommended_fix?: string;
    responsible_agent?: string;
    priority_violation?: PriorityViolation;
}
/**
 * Verify context layer issue using ground truth methods
 *
 * @param resolvedContext - Optional resolved context from Context Priority Resolver (v7.8.0)
 */
export declare function verifyContextIssue(issue: HealthIssue, workingDir: string, userId?: string, teamId?: string, projectId?: string, resolvedContext?: any): Promise<ContextVerificationResult>;
/**
 * Context switch event
 */
interface ContextSwitchEvent {
    from: 'FRAMEWORK_CONTEXT' | 'PROJECT_CONTEXT';
    to: 'FRAMEWORK_CONTEXT' | 'PROJECT_CONTEXT';
    timestamp: string;
}
/**
 * Context state for persistence
 */
interface ContextState {
    currentContext: 'FRAMEWORK_CONTEXT' | 'PROJECT_CONTEXT';
    history: ContextSwitchEvent[];
    timestamp: string;
}
/**
 * File operation record
 */
interface FileOperation {
    path: string;
    operation: 'read' | 'write';
    context: 'FRAMEWORK_CONTEXT' | 'PROJECT_CONTEXT';
    isFrameworkFile: boolean;
    timestamp: string;
}
/**
 * ContextVerifier Class (Singleton)
 * Wraps the functional context verification API in a class for testing
 */
export declare class ContextVerifier {
    private static instance;
    private currentContext;
    private contextHistory;
    private contextSwitchListeners;
    private fileOperations;
    private unauthorizedAttempts;
    private contextLeakWarnings;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): ContextVerifier;
    /**
     * Get current context
     */
    getCurrentContext(): 'FRAMEWORK_CONTEXT' | 'PROJECT_CONTEXT';
    /**
     * Set current context
     */
    setContext(context: 'FRAMEWORK_CONTEXT' | 'PROJECT_CONTEXT'): void;
    /**
     * Switch context with event tracking
     */
    switchContext(context: 'FRAMEWORK_CONTEXT' | 'PROJECT_CONTEXT'): void;
    /**
     * Get context switch history
     */
    getContextHistory(): ContextSwitchEvent[];
    /**
     * Register context switch listener
     */
    onContextSwitch(listener: (event: ContextSwitchEvent) => void): void;
    /**
     * Detect context from file path
     */
    detectContextFromPath(filePath: string): 'FRAMEWORK_CONTEXT' | 'PROJECT_CONTEXT';
    /**
     * Check if file is a framework file
     */
    isFrameworkFile(filePath: string): boolean;
    /**
     * Validate file operation based on current context
     */
    validateFileOperation(filePath: string, operation: 'read' | 'write', options?: {
        allowFrameworkModification?: boolean;
    }): boolean;
    /**
     * Get unauthorized modification attempts
     */
    getUnauthorizedAttempts(): Array<{
        path: string;
        operation: string;
        timestamp: string;
    }>;
    /**
     * Detect context leak
     */
    detectContextLeak(): boolean;
    /**
     * Get mixed context operations
     */
    getMixedContextOperations(): FileOperation[];
    /**
     * Get context leak warnings
     */
    getContextLeakWarnings(): Array<{
        message: string;
        timestamp: string;
    }>;
    /**
     * Clear context leak warnings
     */
    clearContextLeakWarnings(): void;
    /**
     * Validate agent activation based on context
     */
    validateAgentActivation(agentName: string, options?: {
        taskType?: string;
    }): boolean;
    /**
     * Save context state
     */
    saveContextState(): Promise<void>;
    /**
     * Get current context state
     */
    getContextState(): ContextState;
    /**
     * Restore context state
     */
    restoreContextState(state: ContextState): Promise<void>;
    /**
     * Generate validation report
     */
    generateValidationReport(): {
        contextSwitches: number;
        violations: Array<{
            path: string;
            operation: string;
        }>;
        mixedOperations: number;
        recommendations: string[];
    };
    /**
     * Verify context issue (delegates to functional API)
     */
    verifyContextIssue(issue: HealthIssue, workingDir: string, userId?: string, teamId?: string, projectId?: string, resolvedContext?: any): Promise<ContextVerificationResult>;
    /**
     * Validate context operations
     */
    validateContextOperation(operation: string, targetContext: 'FRAMEWORK_CONTEXT' | 'PROJECT_CONTEXT'): {
        allowed: boolean;
        reason?: string;
    };
    /**
     * Reset singleton (for testing)
     */
    static resetInstance(): void;
}
export {};
