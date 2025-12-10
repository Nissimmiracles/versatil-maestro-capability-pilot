/**
 * Exported utility functions for TODO deduplication
 * These are wrapper functions for testing
 */
/**
 * Calculate fingerprint for a TODO item
 */
export declare function calculateTodoFingerprint(todo: {
    title: string;
    description: string;
    file: string;
}): string;
/**
 * Check if two TODOs are similar
 *
 * Two TODOs are similar if:
 * 1. Their fingerprints are identical, OR
 * 2. Their titles are identical (case-insensitive) and same file
 */
export declare function areTodosSimilar(todo1: {
    title: string;
    description: string;
    file: string;
}, todo2: {
    title: string;
    description: string;
    file: string;
}, threshold?: number): boolean;
/**
 * Deduplicate an array of TODOs
 */
export declare function deduplicateTodos(todos: Array<{
    title: string;
    description: string;
    file: string;
}>): Array<{
    title: string;
    description: string;
    file: string;
}>;
