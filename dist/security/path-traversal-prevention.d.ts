/**
 * VERSATIL SDLC Framework - Path Traversal Prevention System
 * Advanced protection against directory traversal attacks
 */
import { EventEmitter } from 'events';
import { z } from 'zod';
export declare const PathTraversalAttemptSchema: z.ZodObject<{
    id: z.ZodString;
    timestamp: z.ZodString;
    attack_type: z.ZodEnum<["basic_traversal", "encoded_traversal", "unicode_traversal", "symlink_traversal", "double_encoding", "null_byte_injection", "windows_traversal", "mixed_separators"]>;
    original_path: z.ZodString;
    normalized_path: z.ZodString;
    intended_target: z.ZodString;
    severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
    blocked: z.ZodBoolean;
    project_id: z.ZodOptional<z.ZodString>;
    user_agent: z.ZodOptional<z.ZodString>;
    source_ip: z.ZodOptional<z.ZodString>;
    evidence: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    timestamp?: string;
    severity?: "low" | "medium" | "high" | "critical";
    project_id?: string;
    evidence?: Record<string, any>;
    attack_type?: "basic_traversal" | "encoded_traversal" | "unicode_traversal" | "symlink_traversal" | "double_encoding" | "null_byte_injection" | "windows_traversal" | "mixed_separators";
    original_path?: string;
    normalized_path?: string;
    intended_target?: string;
    blocked?: boolean;
    user_agent?: string;
    source_ip?: string;
}, {
    id?: string;
    timestamp?: string;
    severity?: "low" | "medium" | "high" | "critical";
    project_id?: string;
    evidence?: Record<string, any>;
    attack_type?: "basic_traversal" | "encoded_traversal" | "unicode_traversal" | "symlink_traversal" | "double_encoding" | "null_byte_injection" | "windows_traversal" | "mixed_separators";
    original_path?: string;
    normalized_path?: string;
    intended_target?: string;
    blocked?: boolean;
    user_agent?: string;
    source_ip?: string;
}>;
export declare const SafePathSchema: z.ZodObject<{
    original_path: z.ZodString;
    sanitized_path: z.ZodString;
    is_safe: z.ZodBoolean;
    violations: z.ZodArray<z.ZodString, "many">;
    recommended_path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    original_path?: string;
    sanitized_path?: string;
    is_safe?: boolean;
    violations?: string[];
    recommended_path?: string;
}, {
    original_path?: string;
    sanitized_path?: string;
    is_safe?: boolean;
    violations?: string[];
    recommended_path?: string;
}>;
export type PathTraversalAttempt = z.infer<typeof PathTraversalAttemptSchema>;
export type SafePath = z.infer<typeof SafePathSchema>;
export declare class PathTraversalPrevention extends EventEmitter {
    private attempts;
    private logger;
    private frameworkRoot;
    private versatilHome;
    private protectedPaths;
    private allowedRoots;
    constructor(frameworkRoot: string);
    private initializeProtectedPaths;
    private initializeAllowedRoots;
    validatePath(inputPath: string, projectId?: string, operation?: 'read' | 'write'): SafePath;
    private detectAttackType;
    private isSymlinkTraversalAttempt;
    private sanitizePath;
    private normalizePath;
    private checkProtectedPaths;
    private isReadAllowedProtectedPath;
    private checkAllowedRoots;
    private isOutsideAllowedArea;
    private generateSafePath;
    private sanitizeFilename;
    private logTraversalAttempt;
    private guessIntendedTarget;
    private calculateSeverity;
    private getAttackIndicators;
    private generateAttemptId;
    getTraversalAttempts(limit?: number): PathTraversalAttempt[];
    getAttemptsByProjectId(projectId: string): PathTraversalAttempt[];
    getAttemptsBySeverity(severity: PathTraversalAttempt['severity']): PathTraversalAttempt[];
    getSecurityStatistics(): any;
    addProtectedPath(pathToProtect: string): void;
    addAllowedRoot(rootPath: string): void;
    exportSecurityReport(): any;
}
export default PathTraversalPrevention;
