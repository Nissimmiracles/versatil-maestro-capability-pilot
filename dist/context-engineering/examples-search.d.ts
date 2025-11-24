/**
 * Examples Search Service
 *
 * Searches .versatil/examples/ directory for relevant code patterns
 * based on technology, keywords, and domain matching.
 *
 * Used by /plan command with --with-examples or --full-context flags
 * to enhance agent prompts with concrete code examples (+50% code quality).
 */
export interface ExampleFile {
    file_path: string;
    relative_path: string;
    description: string;
    technology: string[];
    domain: string;
    keywords: string[];
    content?: string;
}
export interface ExampleSearchQuery {
    technologies?: string[];
    keywords?: string[];
    domain?: string;
    includeContent?: boolean;
}
export interface ExampleSearchResult {
    backend: ExampleFile[];
    frontend: ExampleFile[];
    database: ExampleFile[];
    testing: ExampleFile[];
    rag: ExampleFile[];
    hooks: ExampleFile[];
    commands: ExampleFile[];
    validation: ExampleFile[];
}
export declare class ExamplesSearchService {
    private examplesDir;
    private cache;
    constructor(examplesDir?: string);
    /**
     * Search examples library for relevant patterns
     */
    search(query: ExampleSearchQuery): Promise<ExampleSearchResult>;
    /**
     * Get all examples from .versatil/examples/ directory
     */
    private getAllExamples;
    /**
     * Recursively scan directory for example files
     */
    private scanDirectory;
    /**
     * Parse example file metadata from comments and filename
     */
    private parseExampleFile;
    /**
     * Clear cache (useful after examples are added/modified)
     */
    clearCache(): void;
    /**
     * Detect technologies from feature description
     */
    static detectTechnologies(featureDescription: string): string[];
    /**
     * Extract keywords from feature description
     */
    static extractKeywords(featureDescription: string): string[];
}
/**
 * USAGE EXAMPLES:
 *
 * 1. Search for backend authentication examples:
 * ```typescript
 * const service = new ExamplesSearchService();
 * const results = await service.search({
 *   technologies: ['backend'],
 *   keywords: ['authentication', 'JWT']
 * });
 * console.log(results.backend); // Array of matching examples
 * ```
 *
 * 2. Auto-detect and search from feature description:
 * ```typescript
 * const featureDescription = "Add user authentication with JWT tokens";
 * const technologies = ExamplesSearchService.detectTechnologies(featureDescription);
 * const keywords = ExamplesSearchService.extractKeywords(featureDescription);
 *
 * const results = await service.search({ technologies, keywords });
 * ```
 *
 * 3. Search with full content included:
 * ```typescript
 * const results = await service.search({
 *   domain: 'testing',
 *   includeContent: true
 * });
 * console.log(results.testing[0].content); // Full file content
 * ```
 */
export default ExamplesSearchService;
