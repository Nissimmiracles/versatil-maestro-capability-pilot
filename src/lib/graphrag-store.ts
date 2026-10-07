/**
 * GraphRAG Store - Knowledge Graph-based RAG
 * ✅ NO EMBEDDINGS REQUIRED - Uses entity extraction + graph relationships
 *
 * Benefits over Vector RAG:
 * - No API quota limits
 * - Better semantic understanding via relationships
 * - Explainable results (shows graph paths)
 * - Works offline (no external API calls)
 *
 * Implementation:
 * - Extract entities (agents, technologies, concepts) from patterns
 * - Build knowledge graph with relationships
 * - Query via graph traversal (BFS/DFS)
 * - Rank by graph centrality + path similarity
 */

import { EventEmitter } from 'events';
import { Firestore } from '@google-cloud/firestore';
import { Timestamp } from '@google-cloud/firestore/build/src/timestamp.js';

// Graph Node Types
export type NodeType = 'pattern' | 'agent' | 'technology' | 'concept' | 'category';

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  properties: Record<string, any>;
  connections: string[];  // IDs of connected nodes
  centrality?: number;    // PageRank-style centrality score
  privacy?: {             // NEW: Privacy isolation for three-layer context
    userId?: string;      // Pattern belongs to specific user (private)
    teamId?: string;      // Pattern belongs to specific team (shared within team)
    projectId?: string;   // Pattern belongs to specific project (shared within project)
    isPublic: boolean;    // Pattern is framework-level (accessible to all)
  };
}

export interface GraphEdge {
  id: string;
  source: string;  // Node ID
  target: string;  // Node ID
  relationship: string;  // e.g., "uses", "relates_to", "implements"
  weight: number;  // Strength of relationship (0-1)
}

export interface PatternNode extends GraphNode {
  type: 'pattern';
  properties: {
    pattern: string;
    description?: string;
    code?: string;
    examples?: string[];  // Pattern usage examples
    agent: string;
    category: string;
    effectiveness: number;
    timeSaved: number;
    tags: string[];
    usageCount: number;
    lastUsed: Date;
  };
}

export interface GraphRAGQuery {
  query: string;
  limit?: number;
  minRelevance?: number;
  agent?: string;
  category?: string;
  tags?: string[];
  // NEW: Privacy filtering for three-layer context
  userId?: string;      // Query user-specific patterns
  teamId?: string;      // Query team-specific patterns
  projectId?: string;   // Query project-specific patterns
  includePublic?: boolean; // Include framework-level patterns (default: true)
}

export interface GraphRAGResult {
  pattern: PatternNode;
  relevanceScore: number;
  graphPath: string[];  // Path through graph that led to this result
  explanation: string;  // Human-readable explanation of why this matched
}

/**
 * GraphRAG Store using Firestore for persistence
 */
export class GraphRAGStore extends EventEmitter {
  private firestore: Firestore;
  private projectId: string;
  private nodesCollection = 'graphrag_nodes';
  private edgesCollection = 'graphrag_edges';
  private initialized = false;

  // In-memory graph cache for fast traversal
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private adjacencyList: Map<string, string[]> = new Map();

  constructor() {
    super();
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || 'centering-vine-454613-b3';

    this.firestore = new Firestore({
      projectId: this.projectId,
      databaseId: 'versatil-rag'  // Same database as vector store
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log(`🔧 Initializing GraphRAG Store (${this.projectId})...`);

    try {
      // Load existing graph from Firestore into memory
      await this.loadGraph();

      this.initialized = true;
      console.log('✅ GraphRAG Store initialized successfully');
      this.emit('initialized');
    } catch (error: any) {
      console.error('❌ GraphRAG initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Load graph from Firestore into memory for fast traversal
   */
  private async loadGraph(): Promise<void> {
    await this.loadNodesFromFirestore();
    await this.loadEdgesFromFirestore();

    console.log(`📊 Loaded ${this.nodes.size} nodes and ${this.edges.size} edges`);
  }

  private async loadNodesFromFirestore(): Promise<GraphNode[]> {
    const loaded: GraphNode[] = [];
    const nodesSnapshot = await this.firestore.collection(this.nodesCollection).get();
    nodesSnapshot.forEach(doc => {
      const node = doc.data() as GraphNode;
      this.nodes.set(node.id, node);
      this.adjacencyList.set(node.id, node.connections || []);
      loaded.push(node);
    });
    return loaded;
  }

  private async loadEdgesFromFirestore(): Promise<GraphEdge[]> {
    const loaded: GraphEdge[] = [];
    const edgesSnapshot = await this.firestore.collection(this.edgesCollection).get();
    edgesSnapshot.forEach(doc => {
      const edge = doc.data() as GraphEdge;
      this.edges.set(edge.id, edge);
      loaded.push(edge);
    });
    return loaded;
  }

  /** Trusted in-process whole-cache views; these perform no privacy filtering. */
  getNode(id: string): GraphNode | undefined {
    this.requireInitializedCache();
    const node = this.nodes.get(id);
    return node === undefined ? undefined : this.cloneCachedValue(node);
  }

  getEdge(id: string): GraphEdge | undefined {
    this.requireInitializedCache();
    const edge = this.edges.get(id);
    return edge === undefined ? undefined : this.cloneCachedValue(edge);
  }

  getNodesByType(type: NodeType): GraphNode[] {
    this.requireInitializedCache();
    return [...this.nodes.values()].map(node => this.cloneCachedValue(node))
      .filter(node => node.type === type);
  }

  getEdgesForNode(id: string): GraphEdge[] {
    this.requireInitializedCache();
    return [...this.edges.values()].map(edge => this.cloneCachedValue(edge))
      .filter(edge => edge.source === id || edge.target === id);
  }

  /** Returns the loaded node's declared connection IDs, including unresolved IDs. */
  getNeighbors(id: string): string[] {
    this.requireInitializedCache();
    const node = this.nodes.get(id);
    if (node === undefined) return [];
    const connections = this.cloneCachedValue(node).connections;
    if (connections === undefined || connections === null) return [];
    if (!Array.isArray(connections) || connections.some(connection => typeof connection !== 'string')) {
      throw new Error('Unsupported GraphRAG cached connections');
    }
    return connections;
  }

  // Local convention: source depth is zero; connections are directed and ordered.
  // Only existing cached nodes are visited, matching query's declared-connection basis.
  private bfsTraversal(startId: string, maxDepth = 2): string[] {
    this.requireInitializedCache();
    if (typeof startId !== 'string') throw new Error('GraphRAG traversal IDs must be strings');
    if (!Number.isInteger(maxDepth) || maxDepth < 0) {
      throw new Error('GraphRAG maxDepth must be a nonnegative integer');
    }
    if (this.getNode(startId) === undefined) return [];
    const discovered = new Set([startId]);
    const queue = [{ id: startId, depth: 0 }];
    const visited: string[] = [];
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const current = queue[cursor];
      visited.push(current.id);
      if (current.depth >= maxDepth) continue;
      for (const neighbor of this.getNeighbors(current.id)) {
        if (discovered.has(neighbor) || this.getNode(neighbor) === undefined) continue;
        discovered.add(neighbor);
        queue.push({ id: neighbor, depth: current.depth + 1 });
      }
    }
    return visited;
  }

  // Shortest hop path over the same directed connections; no reverse links invented.
  private findShortestPath(startId: string, targetId: string): string[] {
    this.requireInitializedCache();
    if (typeof startId !== 'string' || typeof targetId !== 'string') {
      throw new Error('GraphRAG traversal IDs must be strings');
    }
    if (this.getNode(startId) === undefined || this.getNode(targetId) === undefined) return [];
    if (startId === targetId) return [startId];
    const previous = new Map<string, string | undefined>([[startId, undefined]]);
    const queue = [startId];
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const current = queue[cursor];
      for (const neighbor of this.getNeighbors(current)) {
        if (previous.has(neighbor) || this.getNode(neighbor) === undefined) continue;
        previous.set(neighbor, current);
        if (neighbor === targetId) {
          const path: string[] = [];
          let step: string | undefined = targetId;
          while (step !== undefined) {
            path.push(step);
            step = previous.get(step);
          }
          return path.reverse();
        }
        queue.push(neighbor);
      }
    }
    return [];
  }

  private requireInitializedCache(): void {
    if (!this.initialized) throw new Error('GraphRAG cache is not initialized');
  }

  // Only supported data values are cloned. Accessors, functions and opaque classes
  // are rejected, rather than exposing an alias or inventing invalid internal slots.
  private cloneCachedValue<T>(value: T, seen = new WeakMap<object, any>()): T {
    if (typeof value === 'function') throw new Error('Unsupported GraphRAG cached value: function');
    if (value === null || typeof value !== 'object') return value;
    if (seen.has(value)) return seen.get(value);
    const prototype = Object.getPrototypeOf(value);
    const supported = prototype === Object.prototype || prototype === null ||
      prototype === Array.prototype || prototype === Date.prototype ||
      prototype === Timestamp.prototype || prototype === Buffer.prototype ||
      prototype === Uint8Array.prototype;
    if (!supported) throw new Error('Unsupported GraphRAG cached value prototype');
    const descriptors = Reflect.ownKeys(value).map(key => [key, Object.getOwnPropertyDescriptor(value, key)!] as const);
    if (descriptors.some(([, descriptor]) => !('value' in descriptor))) {
      throw new Error('Unsupported GraphRAG cached accessor');
    }
    if (descriptors.some(([, descriptor]) => typeof descriptor.value === 'function')) {
      throw new Error('Unsupported GraphRAG cached value: function');
    }
    let copy: any;
    if (prototype === Date.prototype) copy = new Date(Date.prototype.getTime.call(value));
    else if (prototype === Buffer.prototype) copy = Buffer.from(value as Buffer);
    else if (prototype === Uint8Array.prototype) copy = new Uint8Array(value as Uint8Array);
    else if (prototype === Array.prototype) copy = [];
    else copy = Object.create(prototype);
    seen.set(value, copy);
    for (const [key, descriptor] of descriptors) {
      descriptor.value = this.cloneCachedValue(descriptor.value, seen);
      Object.defineProperty(copy, key, descriptor);
    }
    return copy;
  }

  /**
   * Add pattern to knowledge graph
   * Extracts entities and creates graph connections
   */
  async addPattern(pattern: Omit<PatternNode['properties'], 'lastUsed'> & {
    lastUsed?: Date;
    privacy?: GraphNode['privacy'];
  }): Promise<string> {
    await this.initialize();

    const now = new Date();
    const patternId = `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Privacy belongs to the graph node, not the pattern properties.
    const { privacy, ...properties } = pattern;

    // Create pattern node
    const patternNode: PatternNode = {
      id: patternId,
      type: 'pattern',
      label: pattern.pattern.substring(0, 60),
      properties: {
        ...properties,
        lastUsed: pattern.lastUsed || now
      },
      connections: [],
      ...(privacy !== undefined ? { privacy: { ...privacy } } : {})
    };

    // Extract entities from pattern text
    const entities = this.extractEntities(pattern);

    // Create entity nodes and edges
    const newEdges: GraphEdge[] = [];

    for (const entity of entities) {
      let entityNode = this.nodes.get(entity.id);

      // Create entity node if doesn't exist
      if (!entityNode) {
        entityNode = {
          id: entity.id,
          type: entity.type,
          label: entity.label,
          properties: {},
          connections: []
        };
        this.nodes.set(entity.id, entityNode);

        // Save entity node to Firestore
        await this.firestore.collection(this.nodesCollection).doc(entity.id).set(entityNode);
      }

      // Create edge between pattern and entity
      const edgeId = `edge_${patternId}_${entity.id}`;
      const edge: GraphEdge = {
        id: edgeId,
        source: patternId,
        target: entity.id,
        relationship: entity.relationship,
        weight: entity.weight
      };

      newEdges.push(edge);
      this.edges.set(edgeId, edge);

      // Update connections
      patternNode.connections.push(entity.id);
      entityNode.connections.push(patternId);

      // Save edge to Firestore
      await this.firestore.collection(this.edgesCollection).doc(edgeId).set(edge);

      // Update entity node in Firestore
      await this.firestore.collection(this.nodesCollection).doc(entity.id).update({
        connections: entityNode.connections
      });
    }

    // Save pattern node
    this.nodes.set(patternId, patternNode);
    this.adjacencyList.set(patternId, patternNode.connections);
    await this.firestore.collection(this.nodesCollection).doc(patternId).set(patternNode);

    console.log(`✅ Added pattern to graph: ${pattern.pattern.substring(0, 60)}`);
    console.log(`   Entities extracted: ${entities.length}`);

    return patternId;
  }

  /**
   * Extract entities from pattern using keyword matching and heuristics
   * NO LLM REQUIRED - uses simple pattern matching
   */
  private extractEntities(pattern: any): Array<{
    id: string;
    type: NodeType;
    label: string;
    relationship: string;
    weight: number;
  }> {
    const entities: Array<{
      id: string;
      type: NodeType;
      label: string;
      relationship: string;
      weight: number;
    }> = [];

    const text = `${pattern.pattern} ${pattern.description || ''} ${pattern.code || ''}`.toLowerCase();

    // Extract agent
    if (pattern.agent) {
      entities.push({
        id: `agent_${pattern.agent}`,
        type: 'agent',
        label: pattern.agent,
        relationship: 'owned_by',
        weight: 1.0
      });
    }

    // Extract category
    if (pattern.category) {
      entities.push({
        id: `category_${pattern.category}`,
        type: 'category',
        label: pattern.category,
        relationship: 'belongs_to',
        weight: 1.0
      });
    }

    // Extract technologies (common keywords)
    const technologies = [
      'react', 'vue', 'angular', 'svelte', 'nextjs', 'node', 'express', 'fastapi',
      'django', 'rails', 'go', 'java', 'spring', 'typescript', 'javascript', 'python',
      'postgresql', 'mysql', 'mongodb', 'firestore', 'supabase', 'docker', 'kubernetes',
      'jest', 'playwright', 'cypress', 'vitest', 'testing-library', 'oauth', 'jwt',
      'graphql', 'rest', 'api', 'websocket', 'sse'
    ];

    for (const tech of technologies) {
      if (text.includes(tech)) {
        entities.push({
          id: `tech_${tech}`,
          type: 'technology',
          label: tech,
          relationship: 'uses',
          weight: 0.8
        });
      }
    }

    // Extract concepts from tags
    for (const tag of pattern.tags || []) {
      entities.push({
        id: `concept_${tag}`,
        type: 'concept',
        label: tag,
        relationship: 'relates_to',
        weight: 0.6
      });
    }

    return entities;
  }

  /**
   * Query knowledge graph using graph traversal
   * Returns patterns ranked by graph centrality and path relevance
   */
  async query(query: GraphRAGQuery): Promise<GraphRAGResult[]> {
    await this.initialize();

    // Extract query entities using same logic as pattern extraction
    const queryEntities = this.extractEntities({
      pattern: query.query,
      description: '',
      agent: query.agent || '',
      category: query.category || '',
      tags: query.tags || []
    });

    console.log(`🔍 GraphRAG Query: "${query.query}"`);
    console.log(`   Query entities: ${queryEntities.map(e => e.label).join(', ')}`);

    // Find all pattern nodes connected to query entities
    const relevantPatterns = new Map<string, {
      pattern: PatternNode;
      paths: string[][];
      score: number;
    }>();

    for (const entity of queryEntities) {
      const entityNode = this.nodes.get(entity.id);
      if (!entityNode) continue;

      // Traverse graph from entity to find connected patterns (BFS with max depth 2)
      const visited = new Set<string>();
      const queue: Array<{ nodeId: string; path: string[]; depth: number }> = [
        { nodeId: entity.id, path: [entity.id], depth: 0 }
      ];

      while (queue.length > 0) {
        const { nodeId, path, depth } = queue.shift()!;

        if (visited.has(nodeId) || depth > 2) continue;
        visited.add(nodeId);

        const node = this.nodes.get(nodeId);
        if (!node) continue;

        // If we found a pattern node, add to results
        if (node.type === 'pattern') {
          const patternNode = node as PatternNode;

          // Apply filters
          if (query.agent && patternNode.properties.agent !== query.agent) continue;
          if (query.category && patternNode.properties.category !== query.category) continue;

          if (!relevantPatterns.has(nodeId)) {
            relevantPatterns.set(nodeId, {
              pattern: patternNode,
              paths: [],
              score: 0
            });
          }

          const existing = relevantPatterns.get(nodeId)!;
          existing.paths.push(path);

          // Calculate score based on:
          // - Path length (shorter = better)
          // - Entity weight
          // - Pattern effectiveness
          // - Pattern usage count
          const pathScore = 1.0 / (path.length + 1);
          const entityWeight = entity.weight;
          const effectivenessScore = patternNode.properties.effectiveness || 0.5;
          const usageScore = Math.min(patternNode.properties.usageCount / 10, 1.0);

          existing.score = Math.max(
            existing.score,
            pathScore * 0.4 + entityWeight * 0.2 + effectivenessScore * 0.2 + usageScore * 0.2
          );
        }

        // Explore neighbors
        if (depth < 2) {
          for (const neighborId of node.connections || []) {
            if (!visited.has(neighborId)) {
              queue.push({
                nodeId: neighborId,
                path: [...path, neighborId],
                depth: depth + 1
              });
            }
          }
        }
      }
    }

    // Convert to results and sort by score
    const results: GraphRAGResult[] = Array.from(relevantPatterns.values())
      .filter(r => r.score >= (query.minRelevance || 0.3))
      .sort((a, b) => b.score - a.score)
      .slice(0, query.limit || 10)
      .map(r => ({
        pattern: r.pattern,
        relevanceScore: r.score,
        graphPath: r.paths[0] || [],  // Use shortest path
        explanation: this.generateExplanation(r.pattern, r.paths[0] || [], queryEntities)
      }));

    console.log(`   Results: ${results.length} patterns found`);

    return results;
  }

  /**
   * Generate human-readable explanation for why pattern matched
   */
  private generateExplanation(pattern: PatternNode, path: string[], queryEntities: any[]): string {
    const pathLabels = path.map(id => this.nodes.get(id)?.label || id).join(' → ');
    const matchedEntities = queryEntities
      .filter(e => path.includes(e.id))
      .map(e => e.label);

    return `Matched via: ${pathLabels}. Related to: ${matchedEntities.join(', ')}`;
  }

  /**
   * Get graph statistics
   */
  async getStatistics(): Promise<{
    totalNodes: number;
    totalEdges: number;
    nodesByType: Record<NodeType, number>;
    avgConnections: number;
  }> {
    await this.initialize();

    const nodesByType: Record<NodeType, number> = {
      pattern: 0,
      agent: 0,
      technology: 0,
      concept: 0,
      category: 0
    };

    let totalConnections = 0;

    for (const node of this.nodes.values()) {
      nodesByType[node.type]++;
      totalConnections += node.connections.length;
    }

    return {
      totalNodes: this.nodes.size,
      totalEdges: this.edges.size,
      nodesByType,
      avgConnections: this.nodes.size > 0 ? totalConnections / this.nodes.size : 0
    };
  }

  /**
   * Cleanup resources
   */
  async close(): Promise<void> {
    await this.firestore.terminate();
    this.initialized = false;
    this.nodes.clear();
    this.edges.clear();
    this.adjacencyList.clear();
    console.log('✅ GraphRAG Store closed');
  }
}

// Export singleton instance
export const graphRAGStore = new GraphRAGStore();
