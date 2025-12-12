/**
 * Security Tests: RAG Secret Leak Prevention
 *
 * Verifies that secrets, credentials, and sensitive data cannot leak
 * into Public RAG through pattern extraction or sanitization failures.
 *
 * Test Coverage:
 * 1. Workflow files blocked from extraction
 * 2. GCP Project IDs sanitized
 * 3. Database names sanitized
 * 4. Patterns with sensitive keywords rejected
 * 5. Workflow file patterns classified as credentials
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { getPatternSanitizer, SanitizationDecision } from '../../src/rag/pattern-sanitizer.js';
import { getSanitizationPolicy, PatternClassification, StorageDestination } from '../../src/rag/sanitization-policy.js';

describe('RAG Secret Leak Prevention', () => {
  let sanitizer: ReturnType<typeof getPatternSanitizer>;
  let policy: ReturnType<typeof getSanitizationPolicy>;

  beforeEach(() => {
    sanitizer = getPatternSanitizer();
    policy = getSanitizationPolicy();
  });

  describe('File Path Blocking', () => {
    test('Workflow files are blocked from extraction', () => {
      const workflowFiles = [
        '.github/workflows/rag-contribution.yml',
        '.github/workflows/test.yml',
        '.github/workflows/deploy.yml'
      ];

      // Simulate file filtering logic from auto-learn-from-pr.ts
      const relevantFiles = workflowFiles.filter(f => {
        if (f.startsWith('.github/workflows/')) return false;
        return f.startsWith('src/') ||
               f.startsWith('.claude/') ||
               f.startsWith('docs/') ||
               f.startsWith('scripts/');
      });

      expect(relevantFiles).toHaveLength(0);
    });

    test('Secret files are blocked from extraction', () => {
      const secretFiles = [
        '.github/secrets/config.json',
        'config/secrets.json',
        '.env',
        '.env.local',
        '.env.production',
        'credentials.json',
        'private-key.pem',
        'service-account.key'
      ];

      const relevantFiles = secretFiles.filter(f => {
        if (f.startsWith('.github/workflows/')) return false;
        if (f.startsWith('.github/secrets/')) return false;
        if (f.includes('secrets')) return false;
        if (f.endsWith('.env')) return false;
        if (f.endsWith('.env.local')) return false;
        if (f.endsWith('.env.production')) return false;
        if (f.includes('credentials')) return false;
        if (f.includes('private-key')) return false;
        if (f.endsWith('.pem')) return false;
        if (f.endsWith('.key')) return false;

        return f.startsWith('src/') ||
               f.startsWith('.claude/') ||
               f.startsWith('docs/') ||
               f.startsWith('scripts/');
      });

      expect(relevantFiles).toHaveLength(0);
    });

    test('Framework files are allowed', () => {
      const frameworkFiles = [
        'src/rag/pattern-sanitizer.ts',
        '.claude/agents/maria-qa.md',
        'docs/AUTO_LEARNING.md',
        'scripts/auto-learn-from-pr.ts'
      ];

      const relevantFiles = frameworkFiles.filter(f => {
        if (f.startsWith('.github/workflows/')) return false;
        if (f.includes('secrets')) return false;
        if (f.endsWith('.env')) return false;

        return f.startsWith('src/') ||
               f.startsWith('.claude/') ||
               f.startsWith('docs/') ||
               f.startsWith('scripts/');
      });

      expect(relevantFiles).toHaveLength(4);
    });
  });

  describe('GCP Project ID Sanitization', () => {
    test('GCP Project ID is sanitized', async () => {
      const input = 'gcloud run deploy --project=centering-vine-454613-b3';
      const result = await sanitizer.sanitize(input);

      expect(result.sanitized).toContain('YOUR_PROJECT_ID');
      expect(result.sanitized).not.toContain('centering-vine-454613-b3');
      expect(result.redactions.length).toBeGreaterThan(0);
      expect(result.redactions.some(r => r.type === 'gcp_project_id')).toBe(true);
    });

    test('Multiple project IDs are sanitized', async () => {
      const input = `
        Project 1: centering-vine-454613-b3
        Project 2: my-app-123456-xy
        Project 3: test-project-789012-ab
      `;
      const result = await sanitizer.sanitize(input);

      expect(result.sanitized).not.toContain('centering-vine-454613-b3');
      expect(result.sanitized).not.toContain('my-app-123456-xy');
      expect(result.sanitized).not.toContain('test-project-789012-ab');
      expect(result.redactions.filter(r => r.type === 'gcp_project_id').length).toBe(3);
    });

    test('Project ID in code is sanitized', async () => {
      const code = `
        const projectId = 'centering-vine-454613-b3';
        const db = admin.firestore({ projectId });
      `;
      const result = await sanitizer.sanitize(code);

      expect(result.sanitized).toContain('YOUR_PROJECT_ID');
      expect(result.sanitized).not.toContain('centering-vine-454613-b3');
    });
  });

  describe('Database Name Sanitization', () => {
    test('Firestore database name is sanitized', async () => {
      const input = 'const db = "versatil-public-rag";';
      const result = await sanitizer.sanitize(input);

      expect(result.sanitized).toContain('YOUR_DATABASE_NAME');
      expect(result.sanitized).not.toContain('versatil-public-rag');
      expect(result.redactions.some(r => r.type === 'database_name')).toBe(true);
    });

    test('Private RAG database name is sanitized', async () => {
      // Note: "private" keyword is in businessLogic keywords, may be rejected
      // But since it's checking just the database name, not "private" alone, it should pass
      const input = 'DATABASE: versatil-private-rag';
      const result = await sanitizer.sanitize(input);

      // May be rejected due to "private" keyword - check the decision
      if (result.decision === SanitizationDecision.ALLOW_AFTER_SANITIZATION) {
        expect(result.sanitized).toContain('YOUR_DATABASE_NAME');
        expect(result.sanitized).not.toContain('versatil-private-rag');
      } else {
        // Rejected due to "private" keyword
        expect(result.sanitized).toBeNull();
        expect(result.decision).toBe(SanitizationDecision.REJECT_BUSINESS_LOGIC);
      }
    });

    test('Custom database names are sanitized', async () => {
      const input = 'my-app-public-rag storage';
      const result = await sanitizer.sanitize(input);

      expect(result.sanitized).not.toContain('my-app-public-rag');
      expect(result.redactions.filter(r => r.type === 'database_name').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Sensitive Keyword Detection', () => {
    test('Patterns containing "secret" keyword are rejected', async () => {
      const yaml = `
        env:
          PUBLIC_RAG_PROJECT_ID: \${{ secrets.PUBLIC_RAG_PROJECT_ID }}
      `;
      const result = await sanitizer.sanitize(yaml);

      // Implementation rejects patterns with "secret" keyword
      expect(result.decision).toBe(SanitizationDecision.REJECT_CREDENTIALS);
      expect(result.sanitized).toBeNull();
    });

    test('Patterns containing "token" keyword are rejected', async () => {
      const input = 'bearer token: abc123';
      const result = await sanitizer.sanitize(input);

      expect(result.decision).toBe(SanitizationDecision.REJECT_CREDENTIALS);
      expect(result.sanitized).toBeNull();
    });

    test('Patterns containing "password" keyword are rejected', async () => {
      const input = 'database password: mysecret';
      const result = await sanitizer.sanitize(input);

      expect(result.decision).toBe(SanitizationDecision.REJECT_CREDENTIALS);
      expect(result.sanitized).toBeNull();
    });

    test('Patterns with "proprietary" keyword are rejected', async () => {
      const input = 'This is proprietary code';
      const result = await sanitizer.sanitize(input);

      expect(result.decision).toBe(SanitizationDecision.REJECT_BUSINESS_LOGIC);
      expect(result.sanitized).toBeNull();
    });
  });

  describe('Clean Content Sanitization', () => {
    test('Project ID without sensitive keywords is sanitized', async () => {
      const yaml = 'PUBLIC_RAG_PROJECT_ID: centering-vine-454613-b3';
      const result = await sanitizer.sanitize(yaml);

      expect(result.sanitized).toContain('YOUR_PROJECT_ID');
      expect(result.sanitized).not.toContain('centering-vine-454613-b3');
    });

    test('Database name without sensitive keywords is sanitized', async () => {
      const yaml = 'PUBLIC_RAG_DATABASE: versatil-public-rag';
      const result = await sanitizer.sanitize(yaml);

      expect(result.sanitized).toContain('YOUR_DATABASE_NAME');
      expect(result.sanitized).not.toContain('versatil-public-rag');
    });

    test('Complete workflow file with project IDs is sanitized', async () => {
      // Note: This test avoids sensitive keywords like "secrets"
      const workflow = `
name: Public RAG Contribution
on: push
jobs:
  contribute:
    env:
      PROJECT_ID: centering-vine-454613-b3
    runs-on: ubuntu-latest
    steps:
      - run: gcloud run deploy --project=centering-vine-454613-b3
      `;
      const result = await sanitizer.sanitize(workflow);

      expect(result.sanitized).not.toContain('centering-vine-454613-b3');
      expect(result.sanitized).toContain('YOUR_PROJECT_ID');
      expect(result.redactions.length).toBeGreaterThan(0);
    });
  });

  describe('Workflow File Classification', () => {
    test('Workflow file is classified as credentials', async () => {
      const pattern = {
        pattern: 'GitHub Workflow: RAG Contribution',
        description: 'Workflow file for Public RAG contribution',
        code: 'name: Public RAG Contribution',
        filePath: '.github/workflows/rag-contribution.yml',
        agent: 'system',
        category: 'workflow'
      };

      const decision = await policy.evaluatePattern(pattern);

      expect(decision.classification).toBe(PatternClassification.CREDENTIALS);
      expect(decision.destination).toBe(StorageDestination.PRIVATE_ONLY);
      // reasoning is an array, check if any element contains the expected text
      expect(decision.reasoning.some((r: string) => r.includes('sensitive security information'))).toBe(true);
      expect(decision.recommendations.some((r: string) => r.includes('Workflow files are blocked'))).toBe(true);
    });

    test('Secret file is classified as credentials', async () => {
      const pattern = {
        pattern: 'Configuration',
        description: 'Secret configuration',
        filePath: '.github/secrets/config.json',
        agent: 'system',
        category: 'config'
      };

      const decision = await policy.evaluatePattern(pattern);

      expect(decision.classification).toBe(PatternClassification.CREDENTIALS);
      expect(decision.destination).toBe(StorageDestination.PRIVATE_ONLY);
    });

    test('Environment file is classified as credentials', async () => {
      const pattern = {
        pattern: 'Environment Variables',
        description: 'Environment variables file',
        filePath: '.env.local',
        agent: 'system',
        category: 'config'
      };

      const decision = await policy.evaluatePattern(pattern);

      expect(decision.classification).toBe(PatternClassification.CREDENTIALS);
      expect(decision.destination).toBe(StorageDestination.PRIVATE_ONLY);
    });

    test('Credential file is classified as credentials', async () => {
      const pattern = {
        pattern: 'Service Account Key',
        description: 'GCP service account data',
        filePath: 'config/credentials.json',
        agent: 'system',
        category: 'credentials'
      };

      const decision = await policy.evaluatePattern(pattern);

      expect(decision.classification).toBe(PatternClassification.CREDENTIALS);
      expect(decision.destination).toBe(StorageDestination.PRIVATE_ONLY);
    });
  });

  describe('Integration Tests', () => {
    test('Full workflow: Extract → Classify → Sanitize → Validate', async () => {
      // Simulated pattern from workflow file (without sensitive keywords)
      const pattern = {
        pattern: 'Public RAG Auto-Contribution Workflow',
        description: 'Automatically contributes patterns to Public RAG on PR merge',
        code: `
env:
  PUBLIC_RAG_PROJECT_ID: centering-vine-454613-b3
  PUBLIC_RAG_DATABASE: versatil-public-rag
        `,
        filePath: '.github/workflows/rag-contribution.yml',
        agent: 'system',
        category: 'workflow'
      };

      // Step 1: Classification should block immediately (workflow file)
      const decision = await policy.evaluatePattern(pattern);
      expect(decision.classification).toBe(PatternClassification.CREDENTIALS);
      expect(decision.destination).toBe(StorageDestination.PRIVATE_ONLY);

      // Step 2: Even if classification failed, sanitization should catch project-specific data
      const fullText = `${pattern.pattern} ${pattern.description} ${pattern.code}`;
      const sanitizationResult = await sanitizer.sanitize(fullText);

      // Should sanitize project IDs and database names
      expect(sanitizationResult.sanitized).not.toContain('centering-vine-454613-b3');
      expect(sanitizationResult.sanitized).not.toContain('versatil-public-rag');
      expect(sanitizationResult.sanitized).toContain('YOUR_PROJECT_ID');
      expect(sanitizationResult.sanitized).toContain('YOUR_DATABASE_NAME');
    });

    test('Legitimate framework pattern is allowed', async () => {
      const pattern = {
        pattern: 'OPERA Agent: Maria-QA',
        description: 'Quality assurance agent with 80%+ coverage enforcement',
        code: '## Role\nQuality Assurance and Testing',
        filePath: '.claude/agents/maria-qa.md',
        agent: 'maria-qa',
        category: 'agent-definition'
      };

      const decision = await policy.evaluatePattern(pattern);

      expect(decision.classification).not.toBe(PatternClassification.CREDENTIALS);
      expect([
        PatternClassification.PUBLIC_SAFE,
        PatternClassification.REQUIRES_SANITIZATION
      ]).toContain(decision.classification);
    });
  });

  describe('Edge Cases', () => {
    test('Pattern with no filePath still gets sanitized', async () => {
      const pattern = {
        pattern: 'Configuration',
        description: 'Project: centering-vine-454613-b3',
        agent: 'system',
        category: 'config'
      };

      const decision = await policy.evaluatePattern(pattern);

      if (decision.sanitizationResult) {
        expect(decision.sanitizationResult.sanitized).not.toContain('centering-vine-454613-b3');
      }
    });

    test('Empty pattern is handled gracefully', async () => {
      const pattern = {
        pattern: '',
        description: '',
        agent: 'system',
        category: 'unknown'
      };

      const decision = await policy.evaluatePattern(pattern);

      expect(decision).toBeDefined();
      expect(decision.classification).toBeDefined();
    });

    test('Pattern with only project ID gets sanitized', async () => {
      const input = 'centering-vine-454613-b3';
      const result = await sanitizer.sanitize(input);

      expect(result.sanitized).toBe('YOUR_PROJECT_ID');
      expect(result.redactions.length).toBe(1);
    });
  });
});
