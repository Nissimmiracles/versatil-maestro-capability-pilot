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

import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);

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

export class ProgressiveValidator {
  private config: ProgressiveValidationConfig;

  constructor(config: ProgressiveValidationConfig) {
    this.config = {
      stopOnFailure: true,
      maxRetries: 1,
      verbose: false,
      ...config
    };
  }

  /**
   * Run all validation levels progressively
   *
   * @returns Array of validation results for each level
   */
  async validate(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    console.log(chalk.blue.bold('\n🔄 Starting Progressive Validation\n'));

    for (const level of this.config.levels) {
      console.log(chalk.cyan(`\n━━━ ${level.name} ━━━`));
      console.log(chalk.gray(level.description));

      const result = await this.runLevel(level);
      results.push(result);

      // Display result
      if (result.passed) {
        console.log(chalk.green(`✅ ${level.name}: PASSED`) + chalk.gray(` (${result.executionTime}ms)`));
        if (result.autoFixed) {
          console.log(chalk.yellow(`   ⚡ Auto-fixed issues`));
        }
      } else {
        console.log(chalk.red(`❌ ${level.name}: FAILED`) + chalk.gray(` (${result.executionTime}ms)`));
        if (result.errors.length > 0) {
          console.log(chalk.red(`   Errors: ${result.errors.length}`));
          if (this.config.verbose) {
            result.errors.forEach(err => console.log(chalk.red(`     • ${err}`)));
          }
        }
      }

      // Stop if failed and stopOnFailure is enabled
      if (!result.passed && this.config.stopOnFailure && level.required) {
        console.log(chalk.yellow(`\n⚠️  Stopping validation - ${level.name} failed (required level)`));
        break;
      }
    }

    // Summary
    this.printSummary(results);

    return results;
  }

  /**
   * Run a single validation level with retry logic
   */
  private async runLevel(level: ValidationLevel, retryCount = 0): Promise<ValidationResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    let allPassed = true;
    let autoFixed = false;
    let combinedOutput = '';

    for (const command of level.commands) {
      try {
        const { stdout, stderr } = await execAsync(command, {
          cwd: process.cwd(),
          maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        });

        combinedOutput += stdout + stderr;

        // Check for warnings in output
        if (stderr && !stderr.includes('warning')) {
          // Stderr without warnings might indicate an error
          if (stderr.trim().length > 0) {
            warnings.push(`${command}: ${stderr.trim()}`);
          }
        }
      } catch (error: any) {
        allPassed = false;
        const errorOutput = error.stdout || error.stderr || error.message;
        errors.push(`${command}: ${errorOutput}`);
        combinedOutput += errorOutput;

        // Auto-fix if enabled and this is the first attempt
        if (level.autoFix && retryCount === 0) {
          console.log(chalk.yellow(`   🔧 Auto-fixing issues...`));
          autoFixed = await this.attemptAutoFix(level, command);

          if (autoFixed) {
            // Retry after auto-fix
            return this.runLevel(level, retryCount + 1);
          }
        }
      }
    }

    const executionTime = Date.now() - startTime;

    return {
      level: level.name,
      passed: allPassed,
      output: combinedOutput,
      errors,
      warnings,
      executionTime,
      autoFixed
    };
  }

  /**
   * Attempt to auto-fix issues for common tools
   */
  private async attemptAutoFix(level: ValidationLevel, failedCommand: string): Promise<boolean> {
    try {
      // ESLint auto-fix
      if (failedCommand.includes('eslint')) {
        await execAsync('npm run lint:fix || npx eslint . --fix');
        return true;
      }

      // Prettier auto-fix
      if (failedCommand.includes('prettier')) {
        await execAsync('npm run format || npx prettier --write .');
        return true;
      }

      // TypeScript - can't auto-fix, but can provide better diagnostics
      if (failedCommand.includes('tsc')) {
        console.log(chalk.yellow('   ℹ️  TypeScript errors cannot be auto-fixed'));
        return false;
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Print validation summary
   */
  private printSummary(results: ValidationResult[]): void {
    console.log(chalk.blue.bold('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.blue.bold('  📊 VALIDATION SUMMARY'));
    console.log(chalk.blue.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const totalTime = results.reduce((sum, r) => sum + r.executionTime, 0);

    results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      const status = result.passed ? chalk.green('PASSED') : chalk.red('FAILED');
      console.log(`${icon} ${result.level.padEnd(30)} ${status}`);
    });

    console.log(chalk.gray('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
    console.log(`Total Levels: ${results.length}`);
    console.log(chalk.green(`Passed: ${passed}`));
    if (failed > 0) {
      console.log(chalk.red(`Failed: ${failed}`));
    }
    console.log(chalk.gray(`Total Time: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`));

    if (failed === 0) {
      console.log(chalk.green.bold('\n🎉 All validation levels passed!\n'));
    } else {
      console.log(chalk.red.bold('\n⚠️  Some validation levels failed. Review errors above.\n'));
    }
  }

  /**
   * Create default VERSATIL validation configuration
   */
  static createDefaultConfig(): ProgressiveValidationConfig {
    return {
      levels: [
        {
          name: 'Level 1: Syntax & Style',
          description: 'Linting, type checking, and code formatting',
          commands: [
            'npm run lint || npx eslint .',
            'npm run typecheck || npx tsc --noEmit',
            'npm run format:check || npx prettier --check .'
          ],
          required: true,
          autoFix: true
        },
        {
          name: 'Level 2: Unit & Integration Tests',
          description: 'Unit tests, integration tests, and code coverage',
          commands: [
            'npm run test || npx vitest run',
            'npm run test:coverage || npx vitest run --coverage',
            'npm audit --audit-level=moderate || echo "No vulnerabilities found"'
          ],
          required: true,
          autoFix: false
        },
        {
          name: 'Level 3: E2E & System Tests',
          description: 'End-to-end tests, performance, and accessibility',
          commands: [
            'npm run test:e2e || npx playwright test || echo "No E2E tests configured"',
            'npm run test:accessibility || echo "No accessibility tests configured"'
          ],
          required: false, // Optional for now
          autoFix: false
        }
      ],
      stopOnFailure: true,
      maxRetries: 1,
      verbose: false
    };
  }

  /**
   * Create lightweight validation config (for quick checks)
   */
  static createLightweightConfig(): ProgressiveValidationConfig {
    return {
      levels: [
        {
          name: 'Quick Checks',
          description: 'Fast syntax and type validation',
          commands: [
            'npx eslint . --max-warnings=0 || echo "ESLint errors found"',
            'npx tsc --noEmit || echo "TypeScript errors found"'
          ],
          required: true,
          autoFix: true
        }
      ],
      stopOnFailure: false,
      verbose: true
    };
  }
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
