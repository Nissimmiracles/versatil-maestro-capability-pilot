/**
 * Gotchas Search Service
 *
 * Searches .versatil/gotchas/ directory for relevant anti-patterns
 * and common mistakes based on technology, pattern, and severity.
 *
 * Used by /plan command with --with-gotchas or --full-context flags
 * to prevent agents from repeating known mistakes (-50% errors).
 */
export type GotchaSeverity = 'low' | 'medium' | 'high' | 'critical';
export interface GotchaEntry {
    id: string;
    title: string;
    severity: GotchaSeverity;
    frequency: string;
    technology: string;
    pattern?: string;
    mistake: string;
    correctPattern: string;
    detection: string;
    historicalExample?: string;
    lessonLearned?: string;
    file_path: string;
    relative_path: string;
}
export interface GotchaSearchQuery {
    technologies?: string[];
    patterns?: string[];
    severity?: GotchaSeverity[];
    agent?: string;
}
export interface GotchaSearchResult {
    backend: GotchaEntry[];
    frontend: GotchaEntry[];
    database: GotchaEntry[];
    testing: GotchaEntry[];
    all: GotchaEntry[];
}
export declare class GotchasSearchService {
    private gotchasDir;
    private cache;
    constructor(gotchasDir?: string);
    /**
     * Search gotchas library for relevant anti-patterns
     */
    search(query: GotchaSearchQuery): Promise<GotchaSearchResult>;
    /**
     * Get all gotchas from .versatil/gotchas/ directory
     */
    private getAllGotchas;
    /**
     * Scan directory for gotcha markdown files
     */
    private scanDirectory;
    /**
     * Parse gotcha markdown file into structured entries
     */
    private parseGotchaFile;
    /**
     * Parse individual gotcha section
     */
    private parseGotchaSection;
    /**
     * Clear cache (useful after gotchas are added/modified)
     */
    clearCache(): void;
    /**
     * Detect patterns from feature description
     */
    static detectPatterns(featureDescription: string): string[];
}
/**
 * USAGE EXAMPLES:
 *
 * 1. Search for high-severity TypeScript gotchas:
 * ```typescript
 * const service = new GotchasSearchService();
 * const results = await service.search({
 *   technologies: ['typescript'],
 *   severity: ['high', 'critical']
 * });
 * console.log(results.all); // Sorted by severity
 * ```
 *
 * 2. Search for authentication-related gotchas:
 * ```typescript
 * const results = await service.search({
 *   patterns: ['authentication', 'async'],
 *   severity: ['high', 'critical']
 * });
 * ```
 *
 * 3. Get gotchas for specific agent:
 * ```typescript
 * const results = await service.search({
 *   agent: 'marcus-backend',
 *   severity: ['high', 'critical']
 * });
 * console.log(results.backend); // Backend-specific gotchas
 * ```
 */
export default GotchasSearchService;
