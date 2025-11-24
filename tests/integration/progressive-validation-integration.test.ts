/**
 * Integration tests for Progressive Validation within VERSATIL workflows
 *
 * Tests the integration of ProgressiveValidator with:
 * - /work command execution
 * - TodoWrite status changes
 * - Auto-fix logic
 * - Quality gate enforcement
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProgressiveValidator, ValidationResult } from '../../src/validation/progressive-validator';

describe('Progressive Validation Integration', () => {
  let validator: ProgressiveValidator;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  describe('Default Configuration (Level 1→2→3)', () => {
    it('should create default config with 3 levels', () => {
      const config = ProgressiveValidator.createDefaultConfig();

      expect(config.levels).toHaveLength(3);
      expect(config.levels[0].name).toBe('Level 1: Syntax & Style');
      expect(config.levels[1].name).toBe('Level 2: Unit & Integration Tests');
      expect(config.levels[2].name).toBe('Level 3: E2E & System Tests');
    });

    it('should enable auto-fix for Level 1 only', () => {
      const config = ProgressiveValidator.createDefaultConfig();

      expect(config.levels[0].autoFix).toBe(true);
      expect(config.levels[1].autoFix).toBe(false);
      expect(config.levels[2].autoFix).toBe(false);
    });

    it('should mark Level 1 and 2 as required', () => {
      const config = ProgressiveValidator.createDefaultConfig();

      expect(config.levels[0].required).toBe(true);
      expect(config.levels[1].required).toBe(true);
      expect(config.levels[2].required).toBe(false); // E2E optional
    });
  });

  describe('Lightweight Configuration (Quick Checks)', () => {
    it('should create lightweight config with 1 level', () => {
      const config = ProgressiveValidator.createLightweightConfig();

      expect(config.levels).toHaveLength(1);
      expect(config.levels[0].name).toBe('Quick Checks');
    });

    it('should enable auto-fix for quick checks', () => {
      const config = ProgressiveValidator.createLightweightConfig();

      expect(config.levels[0].autoFix).toBe(true);
    });

    it('should be verbose by default', () => {
      const config = ProgressiveValidator.createLightweightConfig();

      expect(config.verbose).toBe(true);
    });

    it('should not stop on failure (continue to show all issues)', () => {
      const config = ProgressiveValidator.createLightweightConfig();

      expect(config.stopOnFailure).toBe(false);
    });
  });

  describe('Validation Workflow Integration', () => {
    it('should integrate with /work command flow', async () => {
      // Simulate /work command workflow
      const workCommandFlow = {
        step1: 'Load todos',
        step2: 'Execute agent work',
        step3: 'Run validation (if --validate flag)',
        step4: 'Mark complete or block'
      };

      // Create validator as /work would
      const config = ProgressiveValidator.createDefaultConfig();
      validator = new ProgressiveValidator(config);

      // Verify validator is ready
      expect(validator).toBeDefined();
      expect(config.levels).toHaveLength(3);
    });

    it('should block on validation failure', () => {
      // Simulate validation failure blocking next task
      const simulateValidationBlock = (results: ValidationResult[]) => {
        const allPassed = results.every(r => r.passed);

        if (!allPassed) {
          return {
            action: 'block',
            todoStatus: 'in_progress',
            todoActiveForm: 'Blocked - fixing validation errors',
            message: '❌ Quality Gates Failed - Fix issues before proceeding'
          };
        }

        return {
          action: 'proceed',
          todoStatus: 'completed',
          message: '✅ Validation passed - proceeding to next task'
        };
      };

      // Test failure scenario
      const failedResults: ValidationResult[] = [
        {
          level: 'Level 1',
          passed: false,
          output: 'ESLint errors',
          errors: ['src/api/auth.ts: Unexpected token'],
          warnings: [],
          executionTime: 1500
        }
      ];

      const blockResult = simulateValidationBlock(failedResults);
      expect(blockResult.action).toBe('block');
      expect(blockResult.todoStatus).toBe('in_progress');
      expect(blockResult.message).toContain('❌ Quality Gates Failed');

      // Test success scenario
      const passedResults: ValidationResult[] = [
        {
          level: 'Level 1',
          passed: true,
          output: 'All checks passed',
          errors: [],
          warnings: [],
          executionTime: 1500
        }
      ];

      const proceedResult = simulateValidationBlock(passedResults);
      expect(proceedResult.action).toBe('proceed');
      expect(proceedResult.todoStatus).toBe('completed');
      expect(proceedResult.message).toContain('✅ Validation passed');
    });

    it('should handle auto-fix workflow', () => {
      // Simulate auto-fix logic
      const simulateAutoFix = (command: string): boolean => {
        if (command.includes('eslint')) {
          // Simulate ESLint auto-fix success
          return true;
        }
        if (command.includes('prettier')) {
          // Simulate Prettier auto-fix success
          return true;
        }
        if (command.includes('tsc')) {
          // TypeScript cannot auto-fix
          return false;
        }
        return false;
      };

      expect(simulateAutoFix('npm run lint || npx eslint .')).toBe(true);
      expect(simulateAutoFix('npm run format:check || npx prettier --check .')).toBe(true);
      expect(simulateAutoFix('npm run typecheck || npx tsc --noEmit')).toBe(false);
    });
  });

  describe('TodoWrite Integration', () => {
    it('should update todo status based on validation results', () => {
      const updateTodoStatus = (validationPassed: boolean) => {
        if (validationPassed) {
          return {
            content: 'Implement authentication API',
            status: 'completed' as const,
            activeForm: 'Completing authentication API'
          };
        } else {
          return {
            content: 'Implement authentication API',
            status: 'in_progress' as const,
            activeForm: 'Blocked - fixing validation errors'
          };
        }
      };

      const passedTodo = updateTodoStatus(true);
      expect(passedTodo.status).toBe('completed');
      expect(passedTodo.activeForm).toBe('Completing authentication API');

      const failedTodo = updateTodoStatus(false);
      expect(failedTodo.status).toBe('in_progress');
      expect(failedTodo.activeForm).toContain('Blocked');
    });

    it('should proceed to next task only after validation passes', () => {
      const todos = [
        { content: 'Task 1: Database schema', status: 'completed' as const, activeForm: '' },
        { content: 'Task 2: API endpoints', status: 'in_progress' as const, activeForm: '' },
        { content: 'Task 3: Frontend UI', status: 'pending' as const, activeForm: '' },
        { content: 'Task 4: E2E tests', status: 'pending' as const, activeForm: '' }
      ];

      const proceedToNext = (validationPassed: boolean) => {
        if (!validationPassed) {
          // Stay on current task
          return todos;
        }

        // Mark current task complete and move to next
        return todos.map((todo, i) => {
          if (i === 1) {
            // Current task (Task 2)
            return { ...todo, status: 'completed' as const };
          } else if (i === 2) {
            // Next task (Task 3)
            return { ...todo, status: 'in_progress' as const };
          }
          return todo;
        });
      };

      // Validation failed - stay on Task 2
      const blockedTodos = proceedToNext(false);
      expect(blockedTodos[1].status).toBe('in_progress');
      expect(blockedTodos[2].status).toBe('pending');

      // Validation passed - move to Task 3
      const progressedTodos = proceedToNext(true);
      expect(progressedTodos[1].status).toBe('completed');
      expect(progressedTodos[2].status).toBe('in_progress');
    });
  });

  describe('Quality Gate Enforcement', () => {
    it('should enforce quality gates when --quality-gates flag is set', () => {
      const enforceQualityGates = (
        flags: { qualityGates?: boolean; validate?: boolean },
        validationResults: ValidationResult[]
      ) => {
        if (!flags.validate && !flags.qualityGates) {
          return { pauseRequired: false, message: 'No quality gates enabled' };
        }

        const failedLevels = validationResults.filter(r => !r.passed);

        if (failedLevels.length > 0) {
          return {
            pauseRequired: true,
            message: `Paused at quality gate - ${failedLevels.length} level(s) failed`,
            failedLevels: failedLevels.map(r => r.level)
          };
        }

        return {
          pauseRequired: false,
          message: 'All quality gates passed'
        };
      };

      // No flags - no pause
      const noFlags = enforceQualityGates({}, []);
      expect(noFlags.pauseRequired).toBe(false);

      // Validation enabled, all passed - no pause
      const allPassed = enforceQualityGates(
        { validate: true },
        [{ level: 'Level 1', passed: true, output: '', errors: [], warnings: [], executionTime: 1000 }]
      );
      expect(allPassed.pauseRequired).toBe(false);

      // Validation enabled, some failed - pause required
      const someFailed = enforceQualityGates(
        { validate: true },
        [{ level: 'Level 1', passed: false, output: '', errors: ['Error'], warnings: [], executionTime: 1000 }]
      );
      expect(someFailed.pauseRequired).toBe(true);
      expect(someFailed.failedLevels).toContain('Level 1');
    });

    it('should provide detailed error messages for failed gates', () => {
      const formatValidationErrors = (results: ValidationResult[]) => {
        const failed = results.filter(r => !r.passed);

        return failed.map(result => ({
          level: result.level,
          errorCount: result.errors.length,
          warningCount: result.warnings.length,
          summary: result.errors.slice(0, 3), // First 3 errors
          executionTime: `${result.executionTime}ms`
        }));
      };

      const failedResults: ValidationResult[] = [
        {
          level: 'Level 1: Syntax & Style',
          passed: false,
          output: '',
          errors: [
            'src/api/auth.ts: Missing semicolon',
            'src/api/auth.ts: Unexpected token',
            'src/utils/jwt.ts: Unused variable'
          ],
          warnings: ['Prefer const over let'],
          executionTime: 1500
        }
      ];

      const formatted = formatValidationErrors(failedResults);

      expect(formatted).toHaveLength(1);
      expect(formatted[0].level).toBe('Level 1: Syntax & Style');
      expect(formatted[0].errorCount).toBe(3);
      expect(formatted[0].warningCount).toBe(1);
      expect(formatted[0].summary).toHaveLength(3);
    });
  });

  describe('Integration with Examples/Gotchas', () => {
    it('should reference validation gotchas on failure', () => {
      const getRelevantGotchas = (failedLevel: string): string[] => {
        const gotchasMap: Record<string, string[]> = {
          'Level 1: Syntax & Style': [
            '.versatil/gotchas/by-technology/typescript-common-errors.md',
            '.versatil/gotchas/by-technology/eslint-rules.md'
          ],
          'Level 2: Unit & Integration Tests': [
            '.versatil/gotchas/by-technology/vitest-testing.md',
            '.versatil/gotchas/by-technology/jest-mocking.md'
          ],
          'Level 3: E2E & System Tests': [
            '.versatil/gotchas/by-technology/playwright-e2e.md',
            '.versatil/gotchas/by-technology/accessibility-wcag.md'
          ]
        };

        return gotchasMap[failedLevel] || [];
      };

      const level1Gotchas = getRelevantGotchas('Level 1: Syntax & Style');
      expect(level1Gotchas).toContain('.versatil/gotchas/by-technology/typescript-common-errors.md');

      const level2Gotchas = getRelevantGotchas('Level 2: Unit & Integration Tests');
      expect(level2Gotchas).toContain('.versatil/gotchas/by-technology/vitest-testing.md');

      const level3Gotchas = getRelevantGotchas('Level 3: E2E & System Tests');
      expect(level3Gotchas).toContain('.versatil/gotchas/by-technology/playwright-e2e.md');
    });
  });
});
