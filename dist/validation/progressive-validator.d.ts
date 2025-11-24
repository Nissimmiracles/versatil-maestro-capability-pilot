/**
 * Progressive Validation System
 *
 * Implements Level 1 → 2 → 3 validation loops inspired by context-engineering:
 * - Level 1: Syntax & Style (auto-fix where possible)
 * - Level 2: Unit & Integration Tests (validate logic)
 * - Level 3: E2E & System Tests (validate end-to-end flows)
 *
 * Each level must pass before moving to the next, with iterative fixing.
 */
export interface ValidationLevel {
    name: string;
    description: string;
    commands: string[];
    required: boolean;
    autoFix?: boolean;
}
export interface ValidationResult {
    level: string;
    passed: boolean;
    output: string;
    errors: string[];
    warnings: string[];
    executionTime: number;
    autoFixed?: boolean;
}
export interface ProgressiveValidationConfig {
    levels: ValidationLevel[];
    stopOnFailure?: boolean;
    maxRetries?: number;
    verbose?: boolean;
}
export declare class ProgressiveValidator {
    private config;
    constructor(config: ProgressiveValidationConfig);
    /**
     * Run all validation levels progressively
     *
     * @returns Array of validation results for each level
     */
    validate(): Promise<ValidationResult[]>;
    /**
     * Run a single validation level with retry logic
     */
    private runLevel;
    /**
     * Attempt to auto-fix issues for common tools
     */
    private attemptAutoFix;
    /**
     * Print validation summary
     */
    private printSummary;
    /**
     * Create default VERSATIL validation configuration
     */
    static createDefaultConfig(): ProgressiveValidationConfig;
    /**
     * Create lightweight validation config (for quick checks)
     */
    static createLightweightConfig(): ProgressiveValidationConfig;
}
/**
 * USAGE EXAMPLES:
 *
 * 1. Default VERSATIL validation (all 3 levels):
 * ```typescript
 * const validator = new ProgressiveValidator(
 *   ProgressiveValidator.createDefaultConfig()
 * );
 * const results = await validator.validate();
 * ```
 *
 * 2. Quick validation (Level 1 only):
 * ```typescript
 * const validator = new ProgressiveValidator(
 *   ProgressiveValidator.createLightweightConfig()
 * );
 * const results = await validator.validate();
 * ```
 *
 * 3. Custom validation:
 * ```typescript
 * const validator = new ProgressiveValidator({
 *   levels: [
 *     {
 *       name: 'Custom Level',
 *       description: 'My custom checks',
 *       commands: ['npm run custom-check'],
 *       required: true,
 *       autoFix: false
 *     }
 *   ],
 *   stopOnFailure: true,
 *   verbose: true
 * });
 * const results = await validator.validate();
 * ```
 *
 * 4. Integration with /execute-prp:
 * ```typescript
 * // After each implementation phase
 * const validator = new ProgressiveValidator(
 *   ProgressiveValidator.createDefaultConfig()
 * );
 *
 * // Level 1: After writing code
 * await validator.validate(); // Runs Level 1, auto-fixes
 *
 * // Level 2: After writing tests
 * // (Continues from Level 1 if it passed)
 *
 * // Level 3: After E2E tests
 * // (Runs full suite if Levels 1-2 passed)
 * ```
 */
export default ProgressiveValidator;
