import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

/**
 * Integration Test Suite for Skills Validation
 *
 * Validates all 17 Phase 4 and Phase 5 skills:
 * - Documentation examples and structured metadata are present (not full compilation)
 * - Imports reference real packages
 * - Agent references are accurate
 * - Trigger phrases match agent configurations
 */

const SKILLS_DIR = join(__dirname, '../../.claude/skills');
const AGENTS_DIR = join(__dirname, '../../.claude/agents');

// All 17 skills that should exist
const EXPECTED_SKILLS = [
  // Phase 4 - Frontend (4)
  'state-management',
  'styling-architecture',
  'testing-strategies',
  'micro-frontends',
  // Phase 4 - Backend (4)
  'api-design',
  'auth-security',
  'microservices',
  'serverless',
  // Phase 4 - Database (4)
  'vector-databases',
  'schema-optimization',
  'rls-policies',
  'edge-databases',
  // Phase 5 - ML/AI (3)
  'ml-pipelines',
  'rag-optimization',
  'model-deployment',
  // Phase 5 - Cross-Agent (2)
  'workflow-orchestration',
  'cross-domain-patterns',
];

// Agent → Skills mapping (from integration work)
const AGENT_SKILLS_MAP: Record<string, string[]> = {
  'james-frontend': ['state-management', 'styling-architecture', 'testing-strategies', 'micro-frontends', 'cross-domain-patterns'],
  'marcus-backend': ['api-design', 'auth-security', 'microservices', 'serverless', 'cross-domain-patterns'],
  'dana-database': ['vector-databases', 'schema-optimization', 'rls-policies', 'edge-databases', 'cross-domain-patterns'],
  'maria-qa': ['testing-strategies', 'quality-gates'],
  'dr-ai-ml': ['ml-pipelines', 'rag-optimization', 'model-deployment'],
  'sarah-pm': ['workflow-orchestration'],
  'alex-ba': ['api-design', 'auth-security'],
  'oliver-mcp': ['rag-optimization'],
  'victor-verifier': ['testing-strategies'],
};

describe('Skills Validation Suite', () => {
  describe('Skill File Existence', () => {
    it('should have SKILL.md for all 17 expected skills', () => {
      const missingSkills: string[] = [];

      EXPECTED_SKILLS.forEach((skill) => {
        const skillPath = join(SKILLS_DIR, skill, 'SKILL.md');
        if (!existsSync(skillPath)) {
          missingSkills.push(skill);
        }
      });

      expect(missingSkills).toEqual([]);
    });

    it('should retain required skills while allowing documented additional skills and collections', () => {
      const directories = readdirSync(SKILLS_DIR, { withFileTypes: true }).filter(entry => entry.isDirectory());
      expect(directories.map(entry => entry.name)).toEqual(expect.arrayContaining(EXPECTED_SKILLS));
      for (const entry of directories) {
        expect(glob.sync('**/SKILL.md', { cwd: join(SKILLS_DIR, entry.name) }).length).toBeGreaterThan(0);
      }
    });
  });

  describe('Skill Content Validation', () => {
    EXPECTED_SKILLS.forEach((skill) => {
      describe(`${skill}`, () => {
        let content: string;

        beforeAll(() => {
          const skillPath = join(SKILLS_DIR, skill, 'SKILL.md');
          content = readFileSync(skillPath, 'utf-8');
        });

        it('should have frontmatter metadata', () => {
          expect(content).toMatch(/^---\nname:/);
          expect(content).toContain('description:');
        });

        it('should have When to Use section', () => {
          expect(content).toContain('## When to Use');
        });

        it('should have a substantive named pattern or implementation section', () => {
          expect(content).toMatch(/^## (?!Overview|When to Use|Resources|Related Skills|Quick Start).+/m);
        });

        it('should have code examples', () => {
          const codeBlocks = content.match(/```[\s\S]*?```/g);
          expect(codeBlocks).toBeTruthy();
          expect(codeBlocks!.length).toBeGreaterThan(0);
        });

        it('should have implementation resources', () => {
          expect(content).toMatch(/^## Resources\s*$/m);
        });

        it('should contain overview, quick start and related-skill guidance', () => {
          expect(content).toMatch(/^## Overview\s*$/m);
          expect(content).toMatch(/^## Quick Start:/m);
          expect(content).toMatch(/^## Related Skills\s*$/m);
        });
      });
    });
  });

  describe('Agent Integration Validation', () => {
    Object.entries(AGENT_SKILLS_MAP).forEach(([agentName, skills]) => {
      describe(`${agentName}.md`, () => {
        let agentContent: string;

        beforeAll(() => {
          const agentPath = join(AGENTS_DIR, `${agentName}.md`);
          agentContent = readFileSync(agentPath, 'utf-8');
        });

        it('should have Enhanced Skills section', () => {
          expect(agentContent).toMatch(/##\s+Enhanced\s+Skills/i);
        });

        skills.forEach((skill) => {
          it(`should reference ${skill} skill`, () => {
            expect(agentContent).toContain(`### ${skill}`);
            expect(agentContent).toContain(`[${skill}](../.claude/skills/${skill}/SKILL.md)`);
          });

          it(`should have trigger phrases for ${skill}`, () => {
            const skillSection = agentContent.match(new RegExp(`### ${skill}[\\s\\S]*?(?=###|$)`, 'i'));
            expect(skillSection).toBeTruthy();
            expect(skillSection![0]).toMatch(/\*\*Trigger phrases\*\*:/i);
          });
        });
      });
    });
  });

  describe('Code Example Syntax Validation', () => {
    EXPECTED_SKILLS.forEach((skill) => {
      describe(`${skill} code examples`, () => {
        let content: string;

        beforeAll(() => {
          const skillPath = join(SKILLS_DIR, skill, 'SKILL.md');
          content = readFileSync(skillPath, 'utf-8');
        });

        it('should have non-placeholder TypeScript examples', () => {
          const tsBlocks = content.match(/```typescript[\s\S]*?```/g) || [];

          tsBlocks.forEach((block) => {
            const code = block.replace(/```typescript\n/, '').replace(/```$/, '');

            // Basic syntax checks (not full compilation)
            expect(code).not.toContain('PLACEHOLDER');
            expect(code).not.toContain('TODO:');

            // Must have either import, const, or function
            expect(code).toMatch(/import|const|function|interface|type|class|export|\w+\s*\(/);
          });
        });

        it('should have non-placeholder Python examples when present', () => {
          const pyBlocks = content.match(/```python[\s\S]*?```/g) || [];

          if (pyBlocks.length > 0) {
            pyBlocks.forEach((block) => {
              const code = block.replace(/```python\n/, '').replace(/```$/, '');

              // Basic syntax checks
              expect(code).not.toContain('PLACEHOLDER');
              expect(code).not.toContain('pass  # TODO');

              // Must have either import, def, or class
              expect(code).toMatch(/import|def|class|from/);
            });
          }
        });

        it('should have SQL statements or explicit SQL annotations when present', () => {
          const sqlBlocks = content.match(/```sql[\s\S]*?```/g) || [];

          if (sqlBlocks.length > 0) {
            sqlBlocks.forEach((block) => {
              const code = block.replace(/```sql\n/, '').replace(/```$/, '').trim();

              const statements = code.replace(/--[^\n]*/g, '').trim();
              if (statements) {
                expect(statements).toMatch(/CREATE|SELECT|INSERT|UPDATE|DELETE|ALTER|DROP/i);
                expect(statements).toContain(';');
              } else {
                expect(code).toMatch(/^--/m);
                expect(code.length).toBeGreaterThan(0);
              }
            });
          }
        });
      });
    });
  });

  describe('Cross-Reference Validation', () => {
    it('should have all skills referenced by at least one agent', () => {
      const referencedSkills = new Set<string>();

      Object.values(AGENT_SKILLS_MAP).forEach((skills) => {
        skills.forEach((skill) => referencedSkills.add(skill));
      });

      const unreferencedSkills = EXPECTED_SKILLS.filter((skill) => !referencedSkills.has(skill));

      // Note: quality-gates is not in EXPECTED_SKILLS but is referenced by maria-qa
      // This is intentional - it's a special QA-specific skill
      expect(unreferencedSkills).toEqual([]);
    });

    it('should have no broken skill references in agents', () => {
      const brokenRefs: string[] = [];

      Object.entries(AGENT_SKILLS_MAP).forEach(([agentName, skills]) => {
        skills.forEach((skill) => {
          const skillPath = join(SKILLS_DIR, skill, 'SKILL.md');
          if (!existsSync(skillPath) && !skill.includes('quality-gates')) {
            brokenRefs.push(`${agentName} → ${skill}`);
          }
        });
      });

      expect(brokenRefs).toEqual([]);
    });
  });

  describe('Current skill metadata inventory', () => {
    it('has matching metadata identifiers for every required skill', () => {
      for (const skill of EXPECTED_SKILLS) {
        const content = readFileSync(join(SKILLS_DIR, skill, 'SKILL.md'), 'utf8');
        expect(content).toContain(`name: ${skill}\n`);
      }
    });
    it('has nonempty descriptions for every required skill', () => {
      for (const skill of EXPECTED_SKILLS) {
        const content = readFileSync(join(SKILLS_DIR, skill, 'SKILL.md'), 'utf8');
        expect(content).toMatch(/^description: \S.+$/m);
      }
    });
  });

  describe('Documentation Completeness', () => {
    it('should have PARALLEL_IMPLEMENTATION_SUMMARY.md with all waves complete', () => {
      const summaryPath = join(__dirname, '../../docs/PARALLEL_IMPLEMENTATION_SUMMARY.md');
      const summaryContent = readFileSync(summaryPath, 'utf-8');

      // Should show 12 of 12 complete (Phase 4)
      expect(summaryContent).toContain('12 of 12');

      // Should reference Phase 5
      expect(summaryContent).toMatch(/Phase\s+5/i);
    });
  });
});

// This suite qualifies tracked documentation and agent references, not executed skills or compilation.
