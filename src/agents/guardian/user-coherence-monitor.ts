/**
 * User Coherence Monitor - Guardian Module for User Projects
 *
 * Proactive health monitoring and user request coherence tracking.
 *
 * Features:
 * - User request tracking and intent inference
 * - Request coherence validation
 * - Context drift detection
 * - Contradictory request identification
 * - User goal alignment
 * - Framework health monitoring
 *
 * @version 7.16.2
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { VERSATILLogger } from '../../utils/logger.js';

// ============================================================================
// Interfaces
// ============================================================================

export interface UserCoherenceMonitorConfig {
  check_interval_hours: number;
  notify_on_updates: boolean;
  notify_on_issues: boolean;
  auto_fix_threshold: number;
  enable_trend_analysis: boolean;
  coherence_threshold: number;
  alert_on_low_coherence: boolean;
  alert_on_contradiction: boolean;
}

export interface UserRequest {
  message: string;
  timestamp?: string;
  context?: string;
}

export interface UserIntent {
  type: string;
  confidence: number;
  keywords: string[];
  category: string;
}

export interface CoherenceBreak {
  index: number;
  from: string;
  to: string;
  severity: number;
}

export interface ContextSwitch {
  index: number;
  from: string;
  to: string;
  timestamp: string;
}

export interface Contradiction {
  request1: UserRequest;
  request2: UserRequest;
  type: string;
  description: string;
}

export interface Conflict {
  request1: UserRequest;
  request2: UserRequest;
  nature: string;
}

export interface Reversal {
  original: UserRequest;
  reversal: UserRequest;
  type: string;
}

export interface RequirementChange {
  from: string;
  to: string;
  request: UserRequest;
}

export interface CoherenceReport {
  coherenceScore: number;
  contextDrift: boolean;
  contradictions: Contradiction[];
  alignment: number;
  recommendations: string[];
}

export interface CoherenceTrend {
  timestamp: string;
  overall_health: number;
  issues_detected: number;
  issues_fixed: number;
  version_behind_by: number;
}

export interface CoherenceTrends {
  improving: boolean;
  degrading: boolean;
  stable: boolean;
  data: CoherenceTrend[];
}

// ============================================================================
// Keywords and patterns for intent inference
// ============================================================================

const INTENT_PATTERNS: Record<string, { keywords: string[]; category: string }> = {
  authentication: {
    keywords: ['auth', 'login', 'signup', 'password', 'session', 'jwt', 'oauth', 'token'],
    category: 'security'
  },
  database: {
    keywords: ['database', 'sql', 'query', 'migration', 'schema', 'table', 'model', 'orm'],
    category: 'data'
  },
  frontend: {
    keywords: ['ui', 'component', 'react', 'css', 'style', 'layout', 'responsive', 'button'],
    category: 'ui'
  },
  backend: {
    keywords: ['api', 'endpoint', 'server', 'rest', 'graphql', 'controller', 'route'],
    category: 'api'
  },
  testing: {
    keywords: ['test', 'spec', 'coverage', 'unit', 'integration', 'e2e', 'mock'],
    category: 'quality'
  },
  devops: {
    keywords: ['ci', 'cd', 'deploy', 'docker', 'kubernetes', 'pipeline', 'build'],
    category: 'infrastructure'
  },
  performance: {
    keywords: ['performance', 'optimize', 'speed', 'cache', 'fast', 'slow', 'latency'],
    category: 'optimization'
  },
  feature: {
    keywords: ['feature', 'add', 'create', 'implement', 'build', 'new'],
    category: 'development'
  },
  fix: {
    keywords: ['fix', 'bug', 'error', 'issue', 'problem', 'broken'],
    category: 'maintenance'
  }
};

// ============================================================================
// User Coherence Monitor
// ============================================================================

export class UserCoherenceMonitor {
  private static instance: UserCoherenceMonitor | undefined;
  private logger: VERSATILLogger;
  private projectRoot: string;
  private config: UserCoherenceMonitorConfig;
  private lastCheckFile: string;
  private trendsFile: string;

  // Request tracking state
  private requestHistory: UserRequest[] = [];
  private intentHistory: UserIntent[] = [];
  private userGoal: string | undefined;
  private isMonitoringActive: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.logger = VERSATILLogger.getInstance();

    this.config = {
      check_interval_hours: 24,
      notify_on_updates: true,
      notify_on_issues: true,
      auto_fix_threshold: 90,
      enable_trend_analysis: true,
      coherence_threshold: 70,
      alert_on_low_coherence: true,
      alert_on_contradiction: true
    };

    const stateDir = join(projectRoot, '.versatil', 'state');
    this.lastCheckFile = join(stateDir, 'last-coherence-check.json');
    this.trendsFile = join(stateDir, 'coherence-trends.json');
  }

  static getInstance(projectRoot?: string): UserCoherenceMonitor {
    if (!UserCoherenceMonitor.instance) {
      UserCoherenceMonitor.instance = new UserCoherenceMonitor(projectRoot || process.cwd());
    }
    return UserCoherenceMonitor.instance;
  }

  static resetInstance(): void {
    if (UserCoherenceMonitor.instance?.monitoringInterval) {
      clearInterval(UserCoherenceMonitor.instance.monitoringInterval);
    }
    UserCoherenceMonitor.instance = undefined;
  }

  // ============================================================================
  // Configuration
  // ============================================================================

  configure(config: Partial<UserCoherenceMonitorConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('User coherence monitor configured', { config: this.config });
  }

  configureAlertThresholds(thresholds: { coherence?: number; contradiction?: boolean }): void {
    if (thresholds.coherence !== undefined) {
      this.config.coherence_threshold = thresholds.coherence;
    }
    if (thresholds.contradiction !== undefined) {
      this.config.alert_on_contradiction = thresholds.contradiction;
    }
  }

  // ============================================================================
  // Request Tracking
  // ============================================================================

  trackRequest(request: UserRequest): void {
    const timestampedRequest = {
      ...request,
      timestamp: request.timestamp || new Date().toISOString()
    };
    this.requestHistory.push(timestampedRequest);

    // Infer intent and track
    const intent = this.inferIntent(request);
    this.intentHistory.push(intent);

    // Check for alerts
    this.checkAlerts();
  }

  getRequestHistory(): UserRequest[] {
    return [...this.requestHistory];
  }

  // ============================================================================
  // Intent Inference
  // ============================================================================

  inferIntent(request: UserRequest): UserIntent {
    const message = request.message.toLowerCase();
    let bestMatch = { type: 'general', confidence: 0.5, keywords: [] as string[], category: 'other' };
    let maxMatches = 0;

    for (const [type, pattern] of Object.entries(INTENT_PATTERNS)) {
      const matches = pattern.keywords.filter(kw => message.includes(kw));
      if (matches.length > maxMatches) {
        maxMatches = matches.length;
        bestMatch = {
          type,
          confidence: Math.min(0.9, 0.5 + matches.length * 0.1),
          keywords: matches,
          category: pattern.category
        };
      }
    }

    return bestMatch;
  }

  getIntentHistory(): UserIntent[] {
    return [...this.intentHistory];
  }

  identifyPrimaryGoal(): string {
    if (this.intentHistory.length === 0) return 'general development';

    // Count intent types
    const typeCounts: Record<string, number> = {};
    for (const intent of this.intentHistory) {
      typeCounts[intent.type] = (typeCounts[intent.type] || 0) + 1;
    }

    // Find most common
    let primaryType = 'general';
    let maxCount = 0;
    for (const [type, count] of Object.entries(typeCounts)) {
      if (count > maxCount) {
        maxCount = count;
        primaryType = type;
      }
    }

    return primaryType;
  }

  // ============================================================================
  // Coherence Validation
  // ============================================================================

  validateCoherence(): boolean {
    const score = this.calculateCoherenceScore();
    return score >= this.config.coherence_threshold;
  }

  calculateCoherenceScore(): number {
    if (this.requestHistory.length < 2) return 100;

    let coherencePoints = 0;
    let totalComparisons = 0;

    for (let i = 1; i < this.intentHistory.length; i++) {
      const prev = this.intentHistory[i - 1];
      const curr = this.intentHistory[i];

      // Same category = coherent
      if (prev.category === curr.category) {
        coherencePoints += 1;
      }
      // Related categories
      else if (this.areRelatedCategories(prev.category, curr.category)) {
        coherencePoints += 0.5;
      }

      totalComparisons++;
    }

    return totalComparisons > 0 ? Math.round((coherencePoints / totalComparisons) * 100) : 100;
  }

  private areRelatedCategories(cat1: string, cat2: string): boolean {
    const relatedGroups = [
      ['security', 'api', 'data'],
      ['ui', 'development', 'optimization'],
      ['quality', 'maintenance', 'development'],
      ['infrastructure', 'api', 'optimization']
    ];

    for (const group of relatedGroups) {
      if (group.includes(cat1) && group.includes(cat2)) {
        return true;
      }
    }
    return false;
  }

  identifyCoherenceBreaks(): CoherenceBreak[] {
    const breaks: CoherenceBreak[] = [];

    for (let i = 1; i < this.intentHistory.length; i++) {
      const prev = this.intentHistory[i - 1];
      const curr = this.intentHistory[i];

      if (prev.category !== curr.category && !this.areRelatedCategories(prev.category, curr.category)) {
        breaks.push({
          index: i,
          from: prev.category,
          to: curr.category,
          severity: prev.confidence + curr.confidence
        });
      }
    }

    return breaks;
  }

  // ============================================================================
  // Context Drift Detection
  // ============================================================================

  detectContextDrift(): boolean {
    if (this.requestHistory.length < 3) return false;

    const breaks = this.identifyCoherenceBreaks();
    const driftThreshold = Math.ceil(this.requestHistory.length * 0.3);

    return breaks.length >= driftThreshold;
  }

  measureDriftSeverity(): number {
    const breaks = this.identifyCoherenceBreaks();
    if (breaks.length === 0) return 0;

    return breaks.reduce((sum, b) => sum + b.severity, 0) / breaks.length;
  }

  getContextSwitches(): ContextSwitch[] {
    const switches: ContextSwitch[] = [];

    for (let i = 1; i < this.requestHistory.length; i++) {
      const prevContext = this.requestHistory[i - 1].context || 'default';
      const currContext = this.requestHistory[i].context || 'default';

      if (prevContext !== currContext) {
        switches.push({
          index: i,
          from: prevContext,
          to: currContext,
          timestamp: this.requestHistory[i].timestamp || ''
        });
      }
    }

    return switches;
  }

  // ============================================================================
  // Contradiction Detection
  // ============================================================================

  detectContradictions(): Contradiction[] {
    const contradictions: Contradiction[] = [];
    const contradictoryPairs = [
      ['mysql', 'postgresql'],
      ['mongodb', 'sql'],
      ['sync', 'async'],
      ['rest', 'graphql'],
      ['simple', 'complex']
    ];

    for (let i = 0; i < this.requestHistory.length; i++) {
      for (let j = i + 1; j < this.requestHistory.length; j++) {
        const msg1 = this.requestHistory[i].message.toLowerCase();
        const msg2 = this.requestHistory[j].message.toLowerCase();

        for (const [term1, term2] of contradictoryPairs) {
          if ((msg1.includes(term1) && msg2.includes(term2)) ||
              (msg1.includes(term2) && msg2.includes(term1))) {
            contradictions.push({
              request1: this.requestHistory[i],
              request2: this.requestHistory[j],
              type: 'technology',
              description: `Conflicting technologies: ${term1} vs ${term2}`
            });
          }
        }
      }
    }

    return contradictions;
  }

  findConflicts(): Conflict[] {
    const conflicts: Conflict[] = [];
    const mutuallyExclusive = [
      ['sync', 'async'],
      ['stateful', 'stateless'],
      ['monolith', 'microservice']
    ];

    for (let i = 0; i < this.requestHistory.length; i++) {
      for (let j = i + 1; j < this.requestHistory.length; j++) {
        const msg1 = this.requestHistory[i].message.toLowerCase();
        const msg2 = this.requestHistory[j].message.toLowerCase();

        for (const [term1, term2] of mutuallyExclusive) {
          if ((msg1.includes(term1) && msg2.includes(term2)) ||
              (msg1.includes(term2) && msg2.includes(term1))) {
            conflicts.push({
              request1: this.requestHistory[i],
              request2: this.requestHistory[j],
              nature: `Mutually exclusive: ${term1} vs ${term2}`
            });
          }
        }
      }
    }

    return conflicts;
  }

  detectReversals(): Reversal[] {
    const reversals: Reversal[] = [];
    const reversalPatterns = [
      { add: /add|implement|create|build/, remove: /remove|delete|undo|revert/ },
      { complex: /complex|advanced|comprehensive/, simple: /simple|basic|minimal|actually.*keep.*simple/ },
      { more: /more|expand|increase/, less: /less|reduce|decrease/ }
    ];

    for (let i = 0; i < this.requestHistory.length; i++) {
      for (let j = i + 1; j < this.requestHistory.length; j++) {
        const msg1 = this.requestHistory[i].message.toLowerCase();
        const msg2 = this.requestHistory[j].message.toLowerCase();

        for (const pattern of reversalPatterns) {
          const keys = Object.keys(pattern) as Array<keyof typeof pattern>;
          for (let k = 0; k < keys.length - 1; k++) {
            const p1 = pattern[keys[k]];
            const p2 = pattern[keys[k + 1]];
            if (p1.test(msg1) && p2.test(msg2)) {
              reversals.push({
                original: this.requestHistory[i],
                reversal: this.requestHistory[j],
                type: `${keys[k]}_to_${keys[k + 1]}`
              });
            }
          }
        }
      }
    }

    return reversals;
  }

  identifyRequirementChanges(): RequirementChange[] {
    const changes: RequirementChange[] = [];
    const changePatterns = [
      { pattern: /change.*to|switch.*to|migrate.*to|convert.*to/, extract: /to\s+(\w+)/ }
    ];

    for (const request of this.requestHistory) {
      const msg = request.message.toLowerCase();
      for (const { pattern, extract } of changePatterns) {
        if (pattern.test(msg)) {
          const match = msg.match(extract);
          if (match) {
            changes.push({
              from: 'previous',
              to: match[1],
              request
            });
          }
        }
      }
    }

    return changes;
  }

  // ============================================================================
  // User Goal Alignment
  // ============================================================================

  setUserGoal(goal: string): void {
    this.userGoal = goal;
  }

  getUserGoal(): string | undefined {
    return this.userGoal;
  }

  isAlignedWithGoal(): boolean {
    if (!this.userGoal || this.requestHistory.length === 0) return true;

    const goalIntent = this.inferIntent({ message: this.userGoal });
    const lastRequest = this.requestHistory[this.requestHistory.length - 1];
    const requestIntent = this.inferIntent(lastRequest);

    return goalIntent.category === requestIntent.category ||
           this.areRelatedCategories(goalIntent.category, requestIntent.category);
  }

  calculateAlignmentScore(): number {
    if (!this.userGoal || this.requestHistory.length === 0) return 100;

    const goalIntent = this.inferIntent({ message: this.userGoal });
    let alignedCount = 0;

    for (const intent of this.intentHistory) {
      if (intent.category === goalIntent.category ||
          this.areRelatedCategories(intent.category, goalIntent.category)) {
        alignedCount++;
      }
    }

    return Math.round((alignedCount / this.intentHistory.length) * 100);
  }

  suggestRefocus(): string[] {
    const suggestions: string[] = [];

    if (!this.userGoal) {
      suggestions.push('Consider setting a clear project goal');
      return suggestions;
    }

    const goalIntent = this.inferIntent({ message: this.userGoal });
    const alignment = this.calculateAlignmentScore();

    if (alignment < 50) {
      suggestions.push(`Your recent requests seem to diverge from your goal: "${this.userGoal}"`);
      suggestions.push(`Consider focusing on ${goalIntent.category}-related tasks`);
    }

    const breaks = this.identifyCoherenceBreaks();
    if (breaks.length > 0) {
      suggestions.push('You have frequent context switches that may slow progress');
      suggestions.push('Try completing one area before moving to another');
    }

    return suggestions;
  }

  // ============================================================================
  // Coherence Report Generation
  // ============================================================================

  generateCoherenceReport(): CoherenceReport {
    return {
      coherenceScore: this.calculateCoherenceScore(),
      contextDrift: this.detectContextDrift(),
      contradictions: this.detectContradictions(),
      alignment: this.calculateAlignmentScore(),
      recommendations: this.generateRecommendations()
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const score = this.calculateCoherenceScore();

    if (score < 50) {
      recommendations.push('Low coherence detected - consider organizing tasks by category');
    }

    if (this.detectContextDrift()) {
      recommendations.push('Context drift detected - try to maintain focus on related tasks');
    }

    const contradictions = this.detectContradictions();
    if (contradictions.length > 0) {
      recommendations.push(`${contradictions.length} potential contradiction(s) found - review requirements`);
    }

    if (!this.isAlignedWithGoal()) {
      recommendations.push('Recent work may not align with your stated goal');
    }

    return recommendations;
  }

  getCoherenceTrends(): CoherenceTrends {
    const data = this.getStoredTrends();

    if (data.length < 2) {
      return { improving: false, degrading: false, stable: true, data };
    }

    const first = data[0].overall_health;
    const last = data[data.length - 1].overall_health;
    const diff = last - first;

    return {
      improving: diff > 5,
      degrading: diff < -5,
      stable: Math.abs(diff) <= 5,
      data
    };
  }

  private getStoredTrends(): CoherenceTrend[] {
    // In-memory trends based on request history
    return this.requestHistory.map((req, i) => ({
      timestamp: req.timestamp || new Date().toISOString(),
      overall_health: this.calculateCoherenceScore(),
      issues_detected: this.detectContradictions().length,
      issues_fixed: 0,
      version_behind_by: 0
    })).slice(-10);
  }

  // ============================================================================
  // Request Pattern Analysis
  // ============================================================================

  identifyPatterns(): string[] {
    const patterns: string[] = [];
    const wordCounts: Record<string, number> = {};

    for (const request of this.requestHistory) {
      const words = request.message.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length > 3) {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
      }
    }

    // Find recurring patterns
    for (const [word, count] of Object.entries(wordCounts)) {
      if (count >= 2) {
        patterns.push(word);
      }
    }

    return patterns.slice(0, 10);
  }

  detectDevelopmentPattern(): string {
    const patterns = {
      iterative: ['create', 'test', 'fix', 'deploy'],
      waterfall: ['plan', 'design', 'implement', 'test'],
      exploratory: ['try', 'experiment', 'explore']
    };

    const messages = this.requestHistory.map(r => r.message.toLowerCase());

    for (const [patternName, keywords] of Object.entries(patterns)) {
      const matchCount = keywords.filter(kw =>
        messages.some(msg => msg.includes(kw))
      ).length;

      if (matchCount >= keywords.length * 0.5) {
        return patternName;
      }
    }

    return 'mixed';
  }

  identifyWorkingStyle(): string {
    if (this.requestHistory.length < 5) return 'unknown';

    // Check for incremental vs batch changes
    const avgMessageLength = this.requestHistory.reduce((sum, r) => sum + r.message.length, 0) / this.requestHistory.length;

    if (avgMessageLength < 50) return 'incremental';
    if (avgMessageLength > 150) return 'comprehensive';
    return 'balanced';
  }

  // ============================================================================
  // Monitoring Control
  // ============================================================================

  startMonitoring(intervalMs: number = 60000): void {
    if (this.isMonitoringActive) return;

    this.isMonitoringActive = true;
    this.monitoringInterval = setInterval(() => {
      this.checkAlerts();
    }, intervalMs);

    this.logger.info('User coherence monitoring started');
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoringActive = false;
    this.logger.info('User coherence monitoring stopped');
  }

  isMonitoring(): boolean {
    return this.isMonitoringActive;
  }

  clearHistory(): void {
    this.requestHistory = [];
    this.intentHistory = [];
  }

  reset(): void {
    this.clearHistory();
    this.userGoal = undefined;
    this.stopMonitoring();
  }

  // ============================================================================
  // Alert System
  // ============================================================================

  private checkAlerts(): void {
    if (this.config.alert_on_low_coherence) {
      const score = this.calculateCoherenceScore();
      if (score < this.config.coherence_threshold) {
        this.triggerAlert('low_coherence', { score, threshold: this.config.coherence_threshold });
      }
    }

    if (this.config.alert_on_contradiction) {
      const contradictions = this.detectContradictions();
      if (contradictions.length > 0) {
        this.triggerAlert('contradiction', { count: contradictions.length });
      }
    }
  }

  private triggerAlert(type: string, data: any): void {
    this.logger.warn(`Coherence alert: ${type}`, data);
  }
}

/**
 * Get User Coherence Monitor instance
 */
export function getUserCoherenceMonitor(projectRoot: string): UserCoherenceMonitor {
  return UserCoherenceMonitor.getInstance(projectRoot);
}
