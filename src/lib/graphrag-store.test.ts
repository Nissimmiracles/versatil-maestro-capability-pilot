/**
 * Tests for GraphRAG Store - Knowledge Graph-based RAG
 * Tests entity extraction, graph relationships, query traversal
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GraphRAGStore, type PatternNode, type GraphRAGQuery } from './graphrag-store.js';

// Create proper QuerySnapshot mock
const createQuerySnapshotMock = (docs: any[] = []) => ({
  docs,
  empty: docs.length === 0,
  size: docs.length,
  forEach: (callback: (doc: any) => void) => docs.forEach(callback),
  [Symbol.iterator]: function* () {
    for (const doc of docs) {
      yield doc;
    }
  }
});

// Create document mock
const createDocMock = (id: string, data: any) => ({
  id,
  exists: true,
  data: () => data,
  ref: { id }
});

// Mock Firestore
vi.mock('@google-cloud/firestore', () => {
  // Store for mock data
  const mockNodes = new Map<string, any>();
  const mockEdges = new Map<string, any>();

  const mockDoc = (collection: string, id: string) => ({
    get: vi.fn().mockImplementation(async () => {
      const store = collection === 'graphrag_nodes' ? mockNodes : mockEdges;
      const data = store.get(id);
      return {
        exists: !!data,
        data: () => data,
        id
      };
    }),
    set: vi.fn().mockImplementation(async (data: any) => {
      const store = collection === 'graphrag_nodes' ? mockNodes : mockEdges;
      store.set(id, data);
      return {};
    }),
    update: vi.fn().mockImplementation(async (data: any) => {
      const store = collection === 'graphrag_nodes' ? mockNodes : mockEdges;
      const existing = store.get(id) || {};
      store.set(id, { ...existing, ...data });
      return {};
    }),
    delete: vi.fn().mockImplementation(async () => {
      const store = collection === 'graphrag_nodes' ? mockNodes : mockEdges;
      store.delete(id);
      return {};
    }),
  });

  const mockCollection = (name: string) => ({
    doc: (id: string) => mockDoc(name, id),
    where: vi.fn().mockReturnThis(),
    get: vi.fn().mockImplementation(async () => {
      const store = name === 'graphrag_nodes' ? mockNodes : mockEdges;
      const docs = Array.from(store.entries()).map(([id, data]) =>
        createDocMock(id, data)
      );
      return createQuerySnapshotMock(docs);
    }),
    add: vi.fn().mockImplementation(async (data: any) => {
      const id = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const store = name === 'graphrag_nodes' ? mockNodes : mockEdges;
      store.set(id, { ...data, id });
      return { id };
    }),
  });

  class MockFirestore {
    constructor(_config?: any) {
      // Clear mock stores on new instance
      mockNodes.clear();
      mockEdges.clear();
    }

    collection(name: string) {
      return mockCollection(name);
    }

    batch() {
      return {
        set: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        commit: vi.fn().mockResolvedValue([]),
      };
    }

    async terminate() {
      mockNodes.clear();
      mockEdges.clear();
      return undefined;
    }
  }

  return {
    Firestore: MockFirestore,
  };
});

describe('GraphRAGStore', () => {
  let store: GraphRAGStore;

  beforeEach(async () => {
    vi.clearAllMocks();
    store = new GraphRAGStore();
  });

  afterEach(async () => {
    try {
      await store.close();
    } catch {
      // Ignore close errors in tests
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await store.initialize();
      expect(store['initialized']).toBe(true);
    });

    it('should not re-initialize if already initialized', async () => {
      await store.initialize();
      await store.initialize(); // Second call should be no-op
      expect(store['initialized']).toBe(true);
    });

    it('should emit initialized event', async () => {
      const initHandler = vi.fn();
      store.on('initialized', initHandler);
      await store.initialize();
      expect(initHandler).toHaveBeenCalled();
    });

    it('should have empty nodes and edges on fresh init', async () => {
      await store.initialize();
      expect(store['nodes'].size).toBe(0);
      expect(store['edges'].size).toBe(0);
    });
  });

  describe('Pattern Storage (addPattern)', () => {
    beforeEach(async () => {
      await store.initialize();
    });

    it('should add pattern and return ID', async () => {
      const patternId = await store.addPattern({
        pattern: 'JWT authentication with refresh tokens',
        description: 'Secure auth pattern',
        agent: 'marcus-backend',
        category: 'security',
        effectiveness: 95,
        timeSaved: 300,
        tags: ['auth', 'jwt', 'security'],
        usageCount: 5,
      });

      expect(patternId).toBeDefined();
      expect(patternId).toMatch(/^pattern_/);
    });

    it('should extract agent entity from pattern', async () => {
      await store.addPattern({
        pattern: 'Test pattern',
        agent: 'maria-qa',
        category: 'testing',
        effectiveness: 80,
        timeSaved: 100,
        tags: [],
        usageCount: 0,
      });

      // Check that agent node was created
      const agentNode = store['nodes'].get('agent_maria-qa');
      expect(agentNode).toBeDefined();
      expect(agentNode?.type).toBe('agent');
    });

    it('should extract category entity from pattern', async () => {
      await store.addPattern({
        pattern: 'Database optimization',
        agent: 'dana-database',
        category: 'performance',
        effectiveness: 90,
        timeSaved: 200,
        tags: [],
        usageCount: 0,
      });

      const categoryNode = store['nodes'].get('category_performance');
      expect(categoryNode).toBeDefined();
      expect(categoryNode?.type).toBe('category');
    });

    it('should extract technology entities from pattern text', async () => {
      await store.addPattern({
        pattern: 'React hooks with TypeScript for type-safe components',
        description: 'Use useState and useEffect hooks',
        agent: 'james-frontend',
        category: 'frontend',
        effectiveness: 85,
        timeSaved: 150,
        tags: ['hooks', 'state'],
        usageCount: 3,
      });

      const reactNode = store['nodes'].get('tech_react');
      const tsNode = store['nodes'].get('tech_typescript');
      expect(reactNode).toBeDefined();
      expect(tsNode).toBeDefined();
    });

    it('should extract concept entities from tags', async () => {
      await store.addPattern({
        pattern: 'API rate limiting',
        agent: 'marcus-backend',
        category: 'security',
        effectiveness: 92,
        timeSaved: 180,
        tags: ['rate-limit', 'throttling', 'api-protection'],
        usageCount: 7,
      });

      const conceptNode = store['nodes'].get('concept_rate-limit');
      expect(conceptNode).toBeDefined();
      expect(conceptNode?.type).toBe('concept');
    });

    it('should create edges between pattern and entities', async () => {
      const patternId = await store.addPattern({
        pattern: 'PostgreSQL query optimization',
        agent: 'dana-database',
        category: 'database',
        effectiveness: 88,
        timeSaved: 250,
        tags: ['sql', 'indexing'],
        usageCount: 4,
      });

      // Check edges exist
      const edgesCount = store['edges'].size;
      expect(edgesCount).toBeGreaterThan(0);

      // Pattern should have connections
      const patternNode = store['nodes'].get(patternId);
      expect(patternNode?.connections.length).toBeGreaterThan(0);
    });

    it('should set lastUsed to current date if not provided', async () => {
      const before = new Date();
      const patternId = await store.addPattern({
        pattern: 'Test pattern',
        agent: 'alex-ba',
        category: 'testing',
        effectiveness: 70,
        timeSaved: 50,
        tags: [],
        usageCount: 0,
      });
      const after = new Date();

      const patternNode = store['nodes'].get(patternId) as PatternNode;
      const lastUsed = patternNode.properties.lastUsed;
      expect(lastUsed.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(lastUsed.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('Query Processing', () => {
    beforeEach(async () => {
      await store.initialize();

      // Add test patterns
      await store.addPattern({
        pattern: 'React component testing with Jest',
        description: 'Unit test React components',
        code: 'describe("Component", () => { it("renders", () => {}) })',
        agent: 'maria-qa',
        category: 'testing',
        effectiveness: 90,
        timeSaved: 200,
        tags: ['unit-test', 'jest', 'react'],
        usageCount: 10,
      });

      await store.addPattern({
        pattern: 'PostgreSQL query optimization with indexes',
        description: 'Optimize slow queries',
        code: 'CREATE INDEX idx_users_email ON users(email)',
        agent: 'dana-database',
        category: 'database',
        effectiveness: 85,
        timeSaved: 300,
        tags: ['sql', 'performance', 'indexing'],
        usageCount: 5,
      });

      await store.addPattern({
        pattern: 'JWT authentication flow',
        description: 'Secure API authentication',
        code: 'jwt.sign({ userId }, secret, { expiresIn: "1h" })',
        agent: 'marcus-backend',
        category: 'security',
        effectiveness: 95,
        timeSaved: 400,
        tags: ['auth', 'jwt', 'api'],
        usageCount: 15,
      });
    });

    it('should return empty array for non-matching query', async () => {
      const results = await store.query({
        query: 'nonexistent12345xyz',
        limit: 10,
      });

      expect(results).toEqual([]);
    });

    it('should return results for matching query', async () => {
      const results = await store.query({
        query: 'testing react',
        limit: 10,
      });

      expect(results.length).toBeGreaterThan(0);
    });

    it('should filter by agent', async () => {
      const results = await store.query({
        query: 'pattern',
        agent: 'maria-qa',
      });

      results.forEach(result => {
        expect(result.pattern.properties.agent).toBe('maria-qa');
      });
    });

    it('should filter by category', async () => {
      const results = await store.query({
        query: 'pattern',
        category: 'database',
      });

      results.forEach(result => {
        expect(result.pattern.properties.category).toBe('database');
      });
    });

    it('should respect limit parameter', async () => {
      const results = await store.query({
        query: 'pattern',
        limit: 1,
      });

      expect(results.length).toBeLessThanOrEqual(1);
    });

    it('should respect minRelevance parameter', async () => {
      const results = await store.query({
        query: 'react',
        minRelevance: 0.5,
      });

      results.forEach(result => {
        expect(result.relevanceScore).toBeGreaterThanOrEqual(0.5);
      });
    });

    it('should include graphPath in results', async () => {
      const results = await store.query({
        query: 'react testing',
        limit: 5,
      });

      if (results.length > 0) {
        expect(results[0].graphPath).toBeDefined();
        expect(Array.isArray(results[0].graphPath)).toBe(true);
      }
    });

    it('should include explanation in results', async () => {
      const results = await store.query({
        query: 'jwt authentication',
        limit: 5,
      });

      if (results.length > 0) {
        expect(results[0].explanation).toBeDefined();
        expect(typeof results[0].explanation).toBe('string');
      }
    });

    it('should rank results by relevance score', async () => {
      const results = await store.query({
        query: 'test pattern',
        limit: 10,
      });

      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].relevanceScore).toBeGreaterThanOrEqual(
          results[i].relevanceScore
        );
      }
    });
  });

  describe('Entity Extraction', () => {
    beforeEach(async () => {
      await store.initialize();
    });

    it('should extract common technologies', async () => {
      await store.addPattern({
        pattern: 'Full stack with React, Node, PostgreSQL and Docker',
        agent: 'alex-ba',
        category: 'architecture',
        effectiveness: 90,
        timeSaved: 500,
        tags: [],
        usageCount: 0,
      });

      expect(store['nodes'].has('tech_react')).toBe(true);
      expect(store['nodes'].has('tech_node')).toBe(true);
      expect(store['nodes'].has('tech_postgresql')).toBe(true);
      expect(store['nodes'].has('tech_docker')).toBe(true);
    });

    it('should extract testing frameworks', async () => {
      await store.addPattern({
        pattern: 'E2E testing with Playwright and Vitest',
        agent: 'maria-qa',
        category: 'testing',
        effectiveness: 88,
        timeSaved: 200,
        tags: [],
        usageCount: 0,
      });

      expect(store['nodes'].has('tech_playwright')).toBe(true);
      expect(store['nodes'].has('tech_vitest')).toBe(true);
    });

    it('should not create duplicate entity nodes', async () => {
      await store.addPattern({
        pattern: 'React hooks pattern',
        agent: 'james-frontend',
        category: 'frontend',
        effectiveness: 80,
        timeSaved: 100,
        tags: [],
        usageCount: 0,
      });

      await store.addPattern({
        pattern: 'Another React pattern',
        agent: 'james-frontend',
        category: 'frontend',
        effectiveness: 75,
        timeSaved: 80,
        tags: [],
        usageCount: 0,
      });

      // Count react nodes (should be exactly 1)
      let reactCount = 0;
      for (const [id] of store['nodes']) {
        if (id === 'tech_react') reactCount++;
      }
      expect(reactCount).toBe(1);
    });
  });

  describe('Statistics', () => {
    beforeEach(async () => {
      await store.initialize();
    });

    it('should return statistics object', async () => {
      const stats = await store.getStatistics();

      expect(stats).toHaveProperty('totalNodes');
      expect(stats).toHaveProperty('totalEdges');
      expect(stats).toHaveProperty('nodesByType');
      expect(stats).toHaveProperty('avgConnections');
    });

    it('should count nodes by type', async () => {
      await store.addPattern({
        pattern: 'Test pattern',
        agent: 'alex-ba',
        category: 'testing',
        effectiveness: 80,
        timeSaved: 100,
        tags: ['tag1'],
        usageCount: 0,
      });

      const stats = await store.getStatistics();

      expect(stats.nodesByType.pattern).toBeGreaterThanOrEqual(1);
      expect(stats.nodesByType.agent).toBeGreaterThanOrEqual(1);
      expect(stats.nodesByType.category).toBeGreaterThanOrEqual(1);
    });

    it('should calculate average connections', async () => {
      await store.addPattern({
        pattern: 'Pattern with many entities: React, TypeScript, Jest',
        agent: 'james-frontend',
        category: 'frontend',
        effectiveness: 85,
        timeSaved: 150,
        tags: ['hooks', 'testing'],
        usageCount: 5,
      });

      const stats = await store.getStatistics();

      expect(stats.avgConnections).toBeGreaterThan(0);
    });
  });

  describe('Cleanup', () => {
    it('should close and reset state', async () => {
      await store.initialize();
      await store.addPattern({
        pattern: 'Test',
        agent: 'alex-ba',
        category: 'test',
        effectiveness: 50,
        timeSaved: 10,
        tags: [],
        usageCount: 0,
      });

      await store.close();

      expect(store['initialized']).toBe(false);
      expect(store['nodes'].size).toBe(0);
      expect(store['edges'].size).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(async () => {
      await store.initialize();
    });

    it('should handle empty tags array', async () => {
      const patternId = await store.addPattern({
        pattern: 'Pattern with no tags',
        agent: 'alex-ba',
        category: 'general',
        effectiveness: 70,
        timeSaved: 50,
        tags: [],
        usageCount: 0,
      });

      expect(patternId).toBeDefined();
    });

    it('should handle pattern with no code', async () => {
      const patternId = await store.addPattern({
        pattern: 'Conceptual pattern without code',
        description: 'Just a description',
        agent: 'sarah-pm',
        category: 'process',
        effectiveness: 75,
        timeSaved: 100,
        tags: ['workflow'],
        usageCount: 0,
      });

      expect(patternId).toBeDefined();
    });

    it('should handle query with empty results gracefully', async () => {
      const results = await store.query({
        query: 'xyz123nonexistent',
      });

      expect(results).toEqual([]);
    });

    it('should handle special characters in pattern text', async () => {
      const patternId = await store.addPattern({
        pattern: 'Pattern with special chars: <script>, ${var}, `template`',
        agent: 'marcus-backend',
        category: 'security',
        effectiveness: 85,
        timeSaved: 200,
        tags: ['xss', 'injection'],
        usageCount: 0,
      });

      expect(patternId).toBeDefined();
    });
  });
});
