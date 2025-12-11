/**
 * VERSATIL SDLC Framework - Framework Layer Verifier
 *
 * Verifies issues in the Framework Layer (infrastructure):
 * - Build system (TypeScript compilation, npm scripts)
 * - Agent system (agent definitions, handoff contracts)
 * - Hook system (lifecycle hooks, event handlers)
 * - MCP server (tool definitions, server health)
 * - RAG system (GraphRAG, Vector store, RAG Router)
 * - Flywheel orchestration (SDLC phases, state machine)
 *
 * Part of Guardian's anti-hallucination system (v7.7.0+)
 */
import type { HealthIssue } from './types.js';
export interface FrameworkVerification {
    claim: string;
    verified: boolean;
    method: string;
    confidence: number;
    evidence?: {
        command?: string;
        exit_code?: number;
        output?: string;
        file_exists?: boolean;
        error_details?: string;
    };
}
export interface FrameworkVerificationResult {
    issue_id: string;
    layer: 'framework';
    verified: boolean;
    confidence: number;
    verifications: FrameworkVerification[];
    recommended_fix?: string;
}
/**
 * Verify framework layer issue using ground truth methods
 */
export declare function verifyFrameworkIssue(issue: HealthIssue, workingDir: string): Promise<FrameworkVerificationResult>;
/**
 * FrameworkVerifier class - Singleton wrapper for framework verification
 * Provides methods for validating framework integrity, dependencies, and configuration
 */
export declare class FrameworkVerifier {
    private static instance;
    private projectRoot;
    private previousVersion;
    private constructor();
    static getInstance(projectRoot?: string): FrameworkVerifier;
    static resetInstance(): void;
    validateCoreFiles(): Promise<{
        valid: boolean;
        missingFiles: string[];
    }>;
    validateAgentFiles(): Promise<{
        valid: boolean;
        agents: {
            missing: string[];
            present: string[];
        };
    }>;
    validatePackageJson(): Promise<{
        valid: boolean;
        version: string;
        dependencies: string[];
    }>;
    checkDependencies(requiredDeps: string[]): Promise<{
        allPresent: boolean;
        missing: string[];
        present: string[];
    }>;
    validateDependencyVersions(): Promise<{
        valid: boolean;
        conflicts: Array<{
            package: string;
            required: string;
            actual: string;
        }>;
    }>;
    checkOutdatedDependencies(): Promise<{
        outdated: Array<{
            package: string;
            current: string;
            latest: string;
        }>;
    }>;
    validatePeerDependencies(): Promise<{
        compatible: boolean;
        warnings: string[];
    }>;
    checkSecurityVulnerabilities(): Promise<{
        vulnerabilities: number;
        severity: 'none' | 'low' | 'moderate' | 'high' | 'critical';
    }>;
    validateTsConfig(): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    validateVitestConfig(): Promise<{
        valid: boolean;
        coverageThreshold: number;
    }>;
    validateRagConfig(): Promise<{
        valid: boolean;
        stores: string[];
    }>;
    validateAgentConfigs(): Promise<{
        valid: boolean;
        invalidConfigs: string[];
    }>;
    verifyAgentRegistration(expectedAgents: string[]): Promise<{
        allRegistered: boolean;
        missing: string[];
        registered: string[];
    }>;
    verifyGuardianRegistration(): Promise<{
        registered: boolean;
        health: 'healthy' | 'degraded' | 'unhealthy';
    }>;
    validateActivationHooks(): Promise<{
        valid: boolean;
        missingHooks: string[];
    }>;
    validateAgentDependencies(): Promise<{
        valid: boolean;
        circularDeps: string[];
    }>;
    detectVersionChange(): Promise<{
        changed: boolean;
        previousVersion: string;
        currentVersion: string;
    }>;
    checkMigrationRequired(fromVersion: string, toVersion: string): Promise<{
        required: boolean;
        migrationSteps: string[];
    }>;
    detectBreakingChanges(fromVersion: string, toVersion: string): Promise<{
        hasBreakingChanges: boolean;
        changes: string[];
    }>;
    checkForUpdates(): Promise<{
        updateAvailable: boolean;
        latestVersion: string;
        currentVersion: string;
    }>;
    performHealthCheck(): Promise<{
        overall_health: string;
        health_score: number;
        components: Record<string, {
            status: string;
            score: number;
        }>;
        timestamp: string;
    }>;
    validateCriticalPaths(): Promise<{
        allAccessible: boolean;
        inaccessible: string[];
    }>;
    checkFilePermissions(): Promise<{
        valid: boolean;
        permissionErrors: string[];
    }>;
    validateEnvironmentVariables(): Promise<{
        valid: boolean;
        missing: string[];
    }>;
    validateTypeScriptBuild(): Promise<{
        compiles: boolean;
        errors: string[];
    }>;
    validateDistDirectory(): Promise<{
        valid: boolean;
        missingFiles: string[];
    }>;
    validateSourceMaps(): Promise<{
        valid: boolean;
        invalidMaps: string[];
    }>;
    validateBuildArtifacts(): Promise<{
        valid: boolean;
        outdated: string[];
    }>;
    validateReadme(): Promise<{
        complete: boolean;
        missingSections: string[];
    }>;
    checkDocumentationFiles(requiredDocs: string[]): Promise<{
        allPresent: boolean;
        missing: string[];
    }>;
    validateAgentDocumentation(): Promise<{
        valid: boolean;
        undocumentedAgents: string[];
    }>;
    checkDocumentationLinks(): Promise<{
        valid: boolean;
        brokenLinks: string[];
    }>;
    validateTestCoverage(threshold?: number): Promise<{
        meetsThreshold: boolean;
        currentCoverage: number;
        threshold: number;
    }>;
    identifyUntestedFiles(): Promise<{
        untestedFiles: string[];
        totalFiles: number;
    }>;
    checkMissingTestFiles(): Promise<{
        missingTests: string[];
    }>;
    suggestRepairActions(): Promise<Array<{
        issue: string;
        action: string;
        priority: string;
    }>>;
    validateRepairAction(action: string): Promise<{
        valid: boolean;
        risks: string[];
    }>;
    createBackup(): Promise<{
        created: boolean;
        path: string;
    }>;
    generateVerificationReport(): Promise<{
        overall_score: number;
        sections: Record<string, {
            score: number;
            issues: string[];
        }>;
        recommendations: string[];
        timestamp: string;
    }>;
    calculateHealthScore(): Promise<number>;
}
