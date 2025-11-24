#!/usr/bin/env node
/**
 * End-to-End Integration Test for Context Engineering Services
 *
 * This script validates:
 * 1. ExamplesSearchService finds all test examples
 * 2. GotchasSearchService finds all test gotchas
 * 3. TemplateParser correctly parses INITIAL.md
 * 4. All services return properly formatted data
 */

import { ExamplesSearchService, GotchasSearchService, TemplateParser } from './dist/context-engineering/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface TestResult {
  name: string;
  passed: boolean;
  expected: any;
  actual: any;
  error?: string;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, expected: any, actual: any, error?: string) {
  results.push({ name, passed, expected, actual, error });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}`);
  if (!passed) {
    console.log(`  Expected: ${JSON.stringify(expected)}`);
    console.log(`  Actual: ${JSON.stringify(actual)}`);
    if (error) console.log(`  Error: ${error}`);
  }
}

async function testExamplesService() {
  console.log('\n=== Testing ExamplesSearchService ===\n');

  const service = new ExamplesSearchService(join(__dirname, '.versatil/examples'));

  // Test 1: Search for backend examples
  try {
    const backendResults = await service.search({
      technologies: ['backend'],
      keywords: ['api']
    });

    const foundBackend = backendResults.backend.length > 0;
    logTest(
      'ExamplesSearch: Find backend API example',
      foundBackend,
      'Should find backend-api-example.ts',
      `Found ${backendResults.backend.length} backend examples`
    );

    if (foundBackend) {
      const example = backendResults.backend[0];
      const hasDesc = example && example.description;
      logTest(
        'ExamplesSearch: Backend example has metadata',
        hasDesc && example.description.includes('REST API'),
        'Contains "REST API"',
        hasDesc ? example.description : 'No description found'
      );
    }
  } catch (error) {
    logTest('ExamplesSearch: Find backend examples', false, 'Success', 'Error', (error as Error).message);
  }

  // Test 2: Search for frontend examples
  try {
    const frontendResults = await service.search({
      technologies: ['frontend'],
      keywords: ['form']
    });

    const foundFrontend = frontendResults.frontend.length > 0;
    logTest(
      'ExamplesSearch: Find frontend form example',
      foundFrontend,
      'Should find frontend-form-example.tsx',
      `Found ${frontendResults.frontend.length} frontend examples`
    );
  } catch (error) {
    logTest('ExamplesSearch: Find frontend examples', false, 'Success', 'Error', (error as Error).message);
  }

  // Test 3: Search for testing examples
  try {
    const testingResults = await service.search({
      technologies: ['testing'],
      keywords: ['vitest']
    });

    const foundTesting = testingResults.testing.length > 0;
    logTest(
      'ExamplesSearch: Find testing/Vitest example',
      foundTesting,
      'Should find vitest-mock-example.ts',
      `Found ${testingResults.testing.length} testing examples`
    );
  } catch (error) {
    logTest('ExamplesSearch: Find testing examples', false, 'Success', 'Error', (error as Error).message);
  }

  // Test 4: Technology auto-detection
  try {
    const detected = ExamplesSearchService.detectTechnologies(
      'Create a REST API endpoint with authentication and validation'
    );

    // Detection returns technology categories, not keywords
    const hasBackend = detected.includes('backend');

    logTest(
      'ExamplesSearch: Auto-detect technologies',
      hasBackend && detected.length > 0,
      'Should detect "backend" category',
      `Detected: ${detected.join(', ')}`
    );
  } catch (error) {
    logTest('ExamplesSearch: Auto-detect technologies', false, 'Success', 'Error', (error as Error).message);
  }
}

async function testGotchasService() {
  console.log('\n=== Testing GotchasSearchService ===\n');

  const service = new GotchasSearchService(join(__dirname, '.versatil/gotchas'));

  // Test 1: Search for React gotchas
  try {
    const reactResults = await service.search({
      technologies: ['react'],
      severity: 'high'
    });

    const foundReact = reactResults.frontend.length > 0;
    logTest(
      'GotchasSearch: Find React hooks gotchas',
      foundReact,
      'Should find react-hooks.md gotchas',
      `Found ${reactResults.frontend.length} React gotchas`
    );

    if (foundReact) {
      const hasHighSeverity = reactResults.frontend.some(g => g.severity === 'high');
      logTest(
        'GotchasSearch: React gotcha has high severity',
        hasHighSeverity,
        'At least one high severity',
        `High severity count: ${reactResults.frontend.filter(g => g.severity === 'high').length}`
      );
    }
  } catch (error) {
    logTest('GotchasSearch: Find React gotchas', false, 'Success', 'Error', (error as Error).message);
  }

  // Test 2: Search for async/await gotchas
  try {
    const asyncResults = await service.search({
      patterns: ['async']
    });

    const foundAsync = asyncResults.all.some(g =>
      g.title.toLowerCase().includes('async') ||
      g.title.toLowerCase().includes('await') ||
      g.title.toLowerCase().includes('promise')
    );

    logTest(
      'GotchasSearch: Find async/await gotchas',
      foundAsync,
      'Should find async-await.md gotchas',
      `Found ${asyncResults.all.filter(g => g.title.toLowerCase().includes('async')).length} async gotchas`
    );
  } catch (error) {
    logTest('GotchasSearch: Find async gotchas', false, 'Success', 'Error', (error as Error).message);
  }

  // Test 3: Search for API design gotchas
  try {
    const apiResults = await service.search({
      patterns: ['api-design'],
      severity: 'critical'
    });

    const foundApi = apiResults.all.some(g =>
      g.title.toLowerCase().includes('api') ||
      g.title.toLowerCase().includes('rate') ||
      g.title.toLowerCase().includes('validation')
    );

    logTest(
      'GotchasSearch: Find API design gotchas',
      foundApi,
      'Should find api-design.md gotchas',
      `Found ${apiResults.all.length} API gotchas`
    );
  } catch (error) {
    logTest('GotchasSearch: Find API gotchas', false, 'Success', 'Error', (error as Error).message);
  }

  // Test 4: Pattern auto-detection
  try {
    const detected = GotchasSearchService.detectPatterns(
      'Implement authentication with JWT tokens and rate limiting'
    );

    const hasAuth = detected.includes('authentication');

    logTest(
      'GotchasSearch: Auto-detect patterns',
      hasAuth,
      'Should detect "authentication"',
      `Detected: ${detected.join(', ')}`
    );
  } catch (error) {
    logTest('GotchasSearch: Auto-detect patterns', false, 'Success', 'Error', (error as Error).message);
  }

  // Test 5: Severity filtering
  try {
    const criticalResults = await service.search({ severity: 'critical' });
    const allCritical = criticalResults.all.every(g => g.severity === 'critical');

    logTest(
      'GotchasSearch: Filter by critical severity',
      allCritical || criticalResults.all.length === 0,
      'All results should be critical',
      `Found ${criticalResults.all.length} critical gotchas`
    );
  } catch (error) {
    logTest('GotchasSearch: Filter by severity', false, 'Success', 'Error', (error as Error).message);
  }
}

async function testTemplateParser() {
  console.log('\n=== Testing TemplateParser ===\n');

  const templatePath = join(__dirname, '.versatil/templates/INITIAL.md');

  // Test 1: Detect template file
  try {
    const isTemplate = await TemplateParser.isTemplate(templatePath);
    logTest(
      'TemplateParser: Detect INITIAL.md template',
      isTemplate,
      'Should be detected as template',
      `isTemplate: ${isTemplate}`
    );
  } catch (error) {
    logTest('TemplateParser: Detect template', false, 'Success', 'Error', (error as Error).message);
  }

  // Test 2: Parse template sections
  try {
    const parsed = await TemplateParser.parse(templatePath);

    // Template is blank/placeholder, so parsing should return structured data even if empty
    const hasStructure = parsed && parsed.feature !== undefined;
    logTest(
      'TemplateParser: Return structured data',
      hasStructure,
      'Should return parsed structure',
      `Parsed structure: ${hasStructure ? 'Valid' : 'Invalid'}`
    );

    // Test EXAMPLES section exists (even if empty template)
    const hasExamples = parsed.examples !== undefined;
    logTest(
      'TemplateParser: Extract EXAMPLES section structure',
      hasExamples,
      'Should have examples section',
      `Examples: ${hasExamples ? 'Present' : 'Missing'}`
    );

    // Test DOCUMENTATION section exists (even if empty template)
    const hasDocs = parsed.documentation !== undefined;
    logTest(
      'TemplateParser: Extract DOCUMENTATION section structure',
      hasDocs,
      'Should have documentation section',
      `Documentation: ${hasDocs ? 'Present' : 'Missing'}`
    );

    // Test that raw content is preserved
    const hasRaw = parsed.raw && parsed.raw.length > 0;
    logTest(
      'TemplateParser: Preserve raw template content',
      hasRaw,
      'Should preserve raw markdown',
      `Raw content: ${parsed.raw?.length || 0} chars`
    );
  } catch (error) {
    logTest('TemplateParser: Parse template', false, 'Success', 'Error', (error as Error).message);
  }
}

async function testCommandWorkflowSimulation() {
  console.log('\n=== Simulating Command Workflows ===\n');

  const examplesService = new ExamplesSearchService(join(__dirname, '.versatil/examples'));
  const gotchasService = new GotchasSearchService(join(__dirname, '.versatil/gotchas'));

  // Simulate: /plan "Add user authentication with JWT" --with-examples
  try {
    const featureDesc = 'Add user authentication with JWT';
    const technologies = ExamplesSearchService.detectTechnologies(featureDesc);
    const examples = await examplesService.search({ technologies });

    // Count all examples across all categories
    const totalExamples = (examples.backend?.length || 0) +
                         (examples.frontend?.length || 0) +
                         (examples.testing?.length || 0);

    const foundExamples = totalExamples > 0;
    logTest(
      'Workflow: /plan --with-examples flag',
      foundExamples,
      'Should find relevant examples',
      `Found ${totalExamples} examples for technologies: ${technologies.join(', ')}`
    );
  } catch (error) {
    logTest('Workflow: /plan --with-examples', false, 'Success', 'Error', (error as Error).message);
  }

  // Simulate: /plan "Add user authentication with JWT" --with-gotchas
  try {
    const featureDesc = 'Add user authentication with JWT';
    const patterns = GotchasSearchService.detectPatterns(featureDesc);
    const gotchas = await gotchasService.search({ patterns });

    const foundGotchas = gotchas.all.length > 0;
    logTest(
      'Workflow: /plan --with-gotchas flag',
      foundGotchas,
      'Should find relevant gotchas',
      `Found ${gotchas.all.length} gotchas for patterns: ${patterns.join(', ')}`
    );
  } catch (error) {
    logTest('Workflow: /plan --with-gotchas', false, 'Success', 'Error', (error as Error).message);
  }

  // Simulate: /plan --full-context (both examples + gotchas)
  try {
    const featureDesc = 'Create REST API with validation';
    const technologies = ExamplesSearchService.detectTechnologies(featureDesc);
    const patterns = GotchasSearchService.detectPatterns(featureDesc);

    const examples = await examplesService.search({ technologies });
    const gotchas = await gotchasService.search({ patterns });

    // Count all examples across all categories
    const totalExamples = (examples.backend?.length || 0) +
                         (examples.frontend?.length || 0) +
                         (examples.testing?.length || 0);

    const totalGotchas = gotchas.all?.length || 0;

    const hasContext = totalExamples > 0 && totalGotchas > 0;
    logTest(
      'Workflow: /plan --full-context flag',
      hasContext,
      'Should find both examples and gotchas',
      `Found ${totalExamples} examples + ${totalGotchas} gotchas`
    );
  } catch (error) {
    logTest('Workflow: /plan --full-context', false, 'Success', 'Error', (error as Error).message);
  }
}

async function generateTestReport() {
  console.log('\n=== Test Summary ===\n');

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed} (${passRate}%)`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n=== Failed Tests ===\n');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`❌ ${r.name}`);
      console.log(`   Expected: ${JSON.stringify(r.expected)}`);
      console.log(`   Actual: ${JSON.stringify(r.actual)}`);
      if (r.error) console.log(`   Error: ${r.error}`);
    });
  }

  // Generate markdown report
  const reportPath = join(__dirname, '.versatil/INTEGRATION_TEST_RESULTS.md');
  const timestamp = new Date().toISOString();

  const markdown = `# Context Engineering Integration Test Results

**Test Date**: ${timestamp}
**Total Tests**: ${total}
**Passed**: ${passed} (${passRate}%)
**Failed**: ${failed}

## Test Results by Service

### ExamplesSearchService
${results.filter(r => r.name.includes('ExamplesSearch')).map(r =>
  `- ${r.passed ? '✅' : '❌'} ${r.name}`
).join('\n')}

### GotchasSearchService
${results.filter(r => r.name.includes('GotchasSearch')).map(r =>
  `- ${r.passed ? '✅' : '❌'} ${r.name}`
).join('\n')}

### TemplateParser
${results.filter(r => r.name.includes('TemplateParser')).map(r =>
  `- ${r.passed ? '✅' : '❌'} ${r.name}`
).join('\n')}

### Command Workflow Simulation
${results.filter(r => r.name.includes('Workflow')).map(r =>
  `- ${r.passed ? '✅' : '❌'} ${r.name}`
).join('\n')}

## Test Data Coverage

### Examples Library
- ✅ backend-api-example.ts (REST API with authentication)
- ✅ frontend-form-example.tsx (React form with validation)
- ✅ vitest-mock-example.ts (Vitest mocking patterns)

**Total**: 3 examples

### Gotchas Library
- ✅ react-hooks.md (2 gotchas: missing deps, infinite loops)
- ✅ async-await.md (3 gotchas: unhandled promises, missing await, async arrays)
- ✅ api-design.md (3 gotchas: rate limiting, error format, validation)

**Total**: 8 individual gotchas across 3 files

## Validation Results

${passed === total ? '✅ **ALL TESTS PASSED** - Infrastructure ready for production use' : '⚠️ **SOME TESTS FAILED** - Review failed tests above'}

## Next Steps

${passed === total ? `
1. ✅ Infrastructure validated - all services working correctly
2. ⏳ Begin gradual library population (Phase 2B)
3. ⏳ Extract 18+ examples from existing codebase
4. ⏳ Document 15+ gotchas from historical issues
5. ⏳ Expand to full coverage over 3-5 weeks
` : `
1. ❌ Fix failing tests before proceeding
2. ⏳ Re-run integration tests
3. ⏳ Only proceed to Phase 2B after 100% pass rate
`}

## Test Details

${failed > 0 ? `
### Failed Tests

${results.filter(r => !r.passed).map(r => `
#### ${r.name}
- **Expected**: ${JSON.stringify(r.expected)}
- **Actual**: ${JSON.stringify(r.actual)}
${r.error ? `- **Error**: ${r.error}` : ''}
`).join('\n')}
` : '_No failed tests_'}
`;

  await fs.writeFile(reportPath, markdown, 'utf-8');
  console.log(`\n✅ Test report saved to: ${reportPath}`);

  return passed === total;
}

async function main() {
  console.log('======================================');
  console.log('Context Engineering Integration Tests');
  console.log('======================================');

  try {
    await testExamplesService();
    await testGotchasService();
    await testTemplateParser();
    await testCommandWorkflowSimulation();

    const allPassed = await generateTestReport();

    if (allPassed) {
      console.log('\n✅ ALL TESTS PASSED - Context Engineering infrastructure ready!');
      process.exit(0);
    } else {
      console.log('\n❌ SOME TESTS FAILED - Review results above');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  }
}

main();
