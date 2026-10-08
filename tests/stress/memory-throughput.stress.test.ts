// Keep stress fixtures away from account memory and statistics.
jest.mock('os', () => {
  const os = jest.requireActual('os');
  const fs = jest.requireActual('fs');
  const path = jest.requireActual('path');
  const fixtureHome = fs.mkdtempSync(path.join(os.tmpdir(), 'jest-stress-home-'));
  return { ...os, homedir: () => fixtureHome };
});
afterAll(() => {
  const fs = jest.requireActual('fs');
  fs.rmSync(require('os').homedir(), { recursive: true, force: true });
});

/** Bounded local file operations, not a product throughput or heap benchmark. */
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { AgentMemoryManager } from '../../src/memory/agent-memory-manager.js';
import { getAllAgentIds, getAgentMemoryPath } from '../../src/memory/memory-tool-config.js';
import { promises as fs } from 'fs';
let memory: AgentMemoryManager;
beforeEach(async () => { jest.spyOn(console, 'log').mockImplementation(() => {}); memory = new AgentMemoryManager(); await memory.initialize(); });
afterEach(() => { jest.restoreAllMocks(); });

describe('Local memory operation batches', () => {
  test('round-trips 1000 distinct patterns', async () => {
    const agent = 'maria-qa';
    for (let i = 0; i < 1000; i++) await memory.storePattern(agent, `batch-${i}`, `# Batch ${i}
fixture-${i}`);
    const patterns = await memory.loadPatterns(agent);
    expect(patterns.filter(value => value.startsWith('# Batch '))).toHaveLength(1000);
    expect(patterns).toContain(`# Batch 999
fixture-999`);
  }, 60000);
  test('writes across all supported agent directories concurrently', async () => {
    const agents = getAllAgentIds();
    await Promise.all(agents.map(async agent => {
      for (let i = 0; i < 20; i++) await memory.storePattern(agent, `parallel-${i}`, `${agent}-fixture-${i}`);
    }));
    for (const agent of agents) {
      const patterns = await memory.loadPatterns(agent);
      expect(patterns.filter(value => value.startsWith(`${agent}-fixture-`))).toHaveLength(20);
    }
  });
  test('round-trips large content and overwrites the same named pattern', async () => {
    const large = `# Large fixture
` + 'x'.repeat(12000);
    await memory.storePattern('marcus-backend', 'large', large);
    expect(await memory.loadPatterns('marcus-backend')).toContain(large);
    await memory.storePattern('marcus-backend', 'large', '# Updated fixture');
    const patterns = await memory.loadPatterns('marcus-backend');
    expect(patterns).toContain('# Updated fixture'); expect(patterns).not.toContain(large);
  });
  test('propagates failed file writes and can store again after storage is restored', async () => {
    const dir = getAgentMemoryPath('maria-qa');
    await fs.rm(dir, { recursive: true, force: true });
    await expect(memory.storePattern('maria-qa', 'missing', '# Failure')).rejects.toThrow();
    await fs.mkdir(dir, { recursive: true });
    await memory.storePattern('maria-qa', 'restored', '# Restored');
    expect(await memory.loadPatterns('maria-qa')).toContain('# Restored');
  });
});
