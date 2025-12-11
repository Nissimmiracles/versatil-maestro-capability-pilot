/**
 * VERSATIL SDLC Framework - Adaptive Learning & Auto-Improvement System
 *
 * This system learns from user interactions and automatically improves
 * the Enhanced OPERA agents based on real usage patterns, feedback, and outcomes.
 */

import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import { VERSATILLogger } from '../utils/logger.js';

export interface UserInteraction {
  id: string;
  timestamp: number;
  agentId: string;
  actionType: 'activation' | 'feedback' | 'dismissal' | 'follow_suggestion' | 'ignore_suggestion';
  context: {
    filePath?: string;
    fileType?: string;
    projectType?: string;
    userRole?: string;
    issue?: {
      type: string;
      severity: string;
      wasAccurate: boolean;
      userVerified: boolean;
    };
    suggestion?: {
      id: string;
      type: string;
      wasFollowed: boolean;
      wasHelpful: boolean;
      userRating?: number; // 1-5 scale
    };
  };
  outcome?: {
    problemSolved: boolean;
    timeToResolution?: number;
    userSatisfaction?: number; // 1-5 scale
    agentAccuracy?: number; // 0-1 scale
  };
}

export interface LearningPattern {
  id: string;
  agentId: string;
  pattern: string;
  confidence: number; // 0-1 scale
  usageCount: number;
  successRate: number;
  context: {
    fileTypes: string[];
    projectTypes: string[];
    commonIssues: string[];
    userPreferences: Record<string, any>;
  };
  recommendations: {
    agentImprovements: string[];
    detectionRules: string[];
    suggestionTypes: string[];
  };
}

export interface AgentAdaptation {
  agentId: string;
  adaptationType: 'detection_rule' | 'suggestion_algorithm' | 'priority_weighting' | 'context_awareness';
  changes: Record<string, any>;
  confidence: number;
  expectedImprovement: number;
  rollbackData?: Record<string, any>;
}

export class AdaptiveLearningEngine extends EventEmitter {
  private logger: VERSATILLogger;
  private interactions: Map<string, UserInteraction[]> = new Map();
  private patterns: Map<string, LearningPattern> = new Map();
  private adaptations: Map<string, AgentAdaptation[]> = new Map();
  private learningConfig: {
    minInteractionsForPattern: number;
    confidenceThreshold: number;
    adaptationInterval: number;
    maxAdaptationsPerAgent: number;
  };
  private dataPath: string;
  private isLearning: boolean = false;

  constructor() {
    super();
    this.logger = new VERSATILLogger();
    this.dataPath = path.join(process.cwd(), '.versatil', 'learning');
    this.learningConfig = {
      minInteractionsForPattern: 10,
      confidenceThreshold: 0.7,
      adaptationInterval: 24 * 60 * 60 * 1000, // 24 hours
      maxAdaptationsPerAgent: 5
    };
    this.initializeLearning();
  }

  /**
   * Start the adaptive learning process
   */
  public startLearning(): void {
    if (this.isLearning) return;

    this.isLearning = true;
    this.logger.info('Adaptive learning engine started', {}, 'adaptive-learning');

    // Load historical data
    this.loadLearningData();

    // Start periodic pattern analysis
    setInterval(() => {
      this.analyzePatterns();
    }, this.learningConfig.adaptationInterval);

    // Start real-time adaptation
    this.on('interaction', this.handleInteraction.bind(this));
    this.on('pattern_discovered', this.handlePatternDiscovery.bind(this));
  }

  /**
   * Stop the learning engine
   */
  public stopLearning(): void {
    this.isLearning = false;
    this.logger.info('Adaptive learning stopped', {}, 'adaptive-learning');
  }

  /**
   * Clear all learning data (useful for testing)
   */
  public clearData(): void {
    this.interactions.clear();
    this.patterns.clear();
    this.adaptations.clear();
  }

  /**
   * Record a user interaction with an agent
   */
  public recordInteraction(interaction: UserInteraction): void {
    if (!this.isLearning) return;
    if (!this.interactions.has(interaction.agentId)) {
      this.interactions.set(interaction.agentId, []);
    }

    this.interactions.get(interaction.agentId)!.push(interaction);

    this.logger.info('User interaction recorded', {
      agentId: interaction.agentId,
      actionType: interaction.actionType,
      context: interaction.context
    }, 'adaptive-learning');

    this.emit('interaction', interaction);
    this.saveInteraction(interaction);
  }

  /**
   * Analyze user interactions to discover learning patterns
   */
  private async analyzePatterns(): Promise<void> {
    this.logger.info('Analyzing user interaction patterns...', {}, 'adaptive-learning');

    for (const [agentId, interactions] of this.interactions) {
      if (interactions.length < this.learningConfig.minInteractionsForPattern) {
        continue;
      }

      // Analyze success/failure patterns
      const successPatterns = this.findSuccessPatterns(agentId, interactions);
      const failurePatterns = this.findFailurePatterns(agentId, interactions);
      const userPreferences = this.extractUserPreferences(interactions);

      // Create learning patterns
      for (const pattern of [...successPatterns, ...failurePatterns]) {
        this.patterns.set(pattern.id, pattern);
        this.emit('pattern_discovered', pattern);
      }

      // Generate agent adaptations
      const adaptations = await this.generateAdaptations(agentId, interactions, userPreferences);
      for (const adaptation of adaptations) {
        this.proposeAdaptation(agentId, adaptation);
      }
    }
  }

  /**
   * Find patterns that lead to successful outcomes
   */
  private findSuccessPatterns(agentId: string, interactions: UserInteraction[]): LearningPattern[] {
    const patterns: LearningPattern[] = [];
    const successfulInteractions = interactions.filter(i =>
      i.outcome?.problemSolved &&
      (i.outcome?.userSatisfaction ?? 0) >= 4
    );

    // Group by file type
    const fileTypeGroups = this.groupByFileType(successfulInteractions);

    for (const [fileType, groupInteractions] of fileTypeGroups) {
      if (groupInteractions.length >= 5) {
        const pattern: LearningPattern = {
          id: `${agentId}_success_${fileType}_${Date.now()}`,
          agentId,
          pattern: `Successful detection in ${fileType} files`,
          confidence: this.calculateConfidence(groupInteractions),
          usageCount: groupInteractions.length,
          successRate: this.calculateSuccessRate(groupInteractions),
          context: {
            fileTypes: [fileType],
            projectTypes: this.extractProjectTypes(groupInteractions),
            commonIssues: this.extractCommonIssues(groupInteractions),
            userPreferences: this.extractUserPreferences(groupInteractions)
          },
          recommendations: {
            agentImprovements: this.generateAgentImprovements(groupInteractions),
            detectionRules: this.generateDetectionRules(groupInteractions),
            suggestionTypes: this.generateSuggestionTypes(groupInteractions)
          }
        };

        patterns.push(pattern);
      }
    }

    return patterns;
  }

  /**
   * Find patterns that lead to failed outcomes
   */
  private findFailurePatterns(agentId: string, interactions: UserInteraction[]): LearningPattern[] {
    const patterns: LearningPattern[] = [];
    const failedInteractions = interactions.filter(i =>
      !i.outcome?.problemSolved ||
      (i.outcome?.userSatisfaction ?? 5) < 3 ||
      i.context.issue?.wasAccurate === false
    );

    // Analyze false positives
    const falsePositives = failedInteractions.filter(i =>
      i.context.issue?.wasAccurate === false
    );

    if (falsePositives.length >= 3) {
      const pattern: LearningPattern = {
        id: `${agentId}_false_positive_${Date.now()}`,
        agentId,
        pattern: 'False positive detection pattern',
        confidence: this.calculateConfidence(falsePositives),
        usageCount: falsePositives.length,
        successRate: 0,
        context: {
          fileTypes: this.extractFileTypes(falsePositives),
          projectTypes: this.extractProjectTypes(falsePositives),
          commonIssues: this.extractCommonIssues(falsePositives),
          userPreferences: {}
        },
        recommendations: {
          agentImprovements: ['Reduce false positive rate for these patterns'],
          detectionRules: this.generateAntiPatterns(falsePositives),
          suggestionTypes: ['Add confidence scoring to suggestions']
        }
      };

      patterns.push(pattern);
    }

    return patterns;
  }

  /**
   * Generate adaptive improvements for agents
   */
  private async generateAdaptations(
    agentId: string,
    interactions: UserInteraction[],
    userPreferences: Record<string, any>
  ): Promise<AgentAdaptation[]> {
    const adaptations: AgentAdaptation[] = [];

    // Analyze suggestion follow-through rates
    const suggestionAnalysis = this.analyzeSuggestionEffectiveness(interactions);

    if (suggestionAnalysis.lowFollowThroughSuggestions.length > 0) {
      adaptations.push({
        agentId,
        adaptationType: 'suggestion_algorithm',
        changes: {
          deprioritizeSuggestions: suggestionAnalysis.lowFollowThroughSuggestions,
          prioritizeSuggestions: suggestionAnalysis.highFollowThroughSuggestions
        },
        confidence: 0.8,
        expectedImprovement: 0.15
      });
    }

    // Analyze detection accuracy
    const detectionAnalysis = this.analyzeDetectionAccuracy(interactions);

    if (detectionAnalysis.falsePositiveRate > 0.2) {
      adaptations.push({
        agentId,
        adaptationType: 'detection_rule',
        changes: {
          addExclusions: detectionAnalysis.falsePositivePatterns,
          increaseConfidenceThreshold: true
        },
        confidence: 0.7,
        expectedImprovement: 0.25
      });
    }

    // Adapt to user preferences
    if (userPreferences['preferredSeverityLevel']) {
      adaptations.push({
        agentId,
        adaptationType: 'priority_weighting',
        changes: {
          adjustSeverityWeights: userPreferences['preferredSeverityLevel'],
          personalizeAlerts: userPreferences['alertPreferences']
        },
        confidence: 0.9,
        expectedImprovement: 0.1
      });
    }

    return adaptations;
  }

  /**
   * Propose an adaptation to an agent
   */
  private proposeAdaptation(agentId: string, adaptation: AgentAdaptation): void {
    if (!this.adaptations.has(agentId)) {
      this.adaptations.set(agentId, []);
    }

    const agentAdaptations = this.adaptations.get(agentId)!;

    // Don't exceed max adaptations per agent
    if (agentAdaptations.length >= this.learningConfig.maxAdaptationsPerAgent) {
      // Remove least confident adaptation
      const leastConfident = agentAdaptations.reduce((min, curr) =>
        curr.confidence < min.confidence ? curr : min
      );
      const index = agentAdaptations.indexOf(leastConfident);
      agentAdaptations.splice(index, 1);
    }

    agentAdaptations.push(adaptation);

    this.logger.info('Agent adaptation proposed', {
      agentId,
      adaptationType: adaptation.adaptationType,
      confidence: adaptation.confidence,
      expectedImprovement: adaptation.expectedImprovement
    }, 'adaptive-learning');

    this.emit('adaptation_proposed', { agentId, adaptation });
  }

  /**
   * Apply approved adaptations to agents
   */
  public async applyAdaptation(agentId: string, adaptationId: string): Promise<boolean> {
    const agentAdaptations = this.adaptations.get(agentId);
    if (!agentAdaptations) return false;

    const adaptation = agentAdaptations.find(a =>
      `${a.agentId}_${a.adaptationType}_${a.confidence}` === adaptationId
    );

    if (!adaptation) return false;

    try {
      // Store rollback data
      adaptation.rollbackData = await this.createRollbackData(agentId);

      // Apply the adaptation
      await this.applyAdaptationChanges(agentId, adaptation);

      this.logger.info('Agent adaptation applied successfully', {
        agentId,
        adaptationType: adaptation.adaptationType
      }, 'adaptive-learning');

      this.emit('adaptation_applied', { agentId, adaptation });
      return true;

    } catch (error) {
      this.logger.error('Failed to apply agent adaptation', {
        agentId,
        adaptationType: adaptation.adaptationType,
        error: error instanceof Error ? error.message : String(error)
      }, 'adaptive-learning');

      return false;
    }
  }

  /**
   * Get learning insights for dashboard
   */
  public getLearningInsights(): {
    totalInteractions: number;
    patternsDiscovered: number;
    adaptationsProposed: number;
    adaptationsApplied: number;
    topPerformingAgents: Array<{ agentId: string; successRate: number }>;
    recentLearnings: LearningPattern[];
  } {
    const totalInteractions = Array.from(this.interactions.values())
      .reduce((sum, interactions) => sum + interactions.length, 0);

    const patternsDiscovered = this.patterns.size;

    const adaptationsProposed = Array.from(this.adaptations.values())
      .reduce((sum, adaptations) => sum + adaptations.length, 0);

    const topPerformingAgents = this.calculateTopPerformingAgents();

    const recentLearnings = Array.from(this.patterns.values())
      .sort((a, b) => parseInt(b.id.split('_').pop()!) - parseInt(a.id.split('_').pop()!))
      .slice(0, 5);

    return {
      totalInteractions,
      patternsDiscovered,
      adaptationsProposed,
      adaptationsApplied: 0, // Would track from applied adaptations log
      topPerformingAgents,
      recentLearnings
    };
  }

  // Helper methods
  private initializeLearning(): void {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
  }

  private loadLearningData(): void {
    try {
      const interactionsFile = path.join(this.dataPath, 'interactions.json');
      const patternsFile = path.join(this.dataPath, 'patterns.json');

      if (fs.existsSync(interactionsFile)) {
        const data = JSON.parse(fs.readFileSync(interactionsFile, 'utf8'));
        this.interactions = new Map(Object.entries(data));
      }

      if (fs.existsSync(patternsFile)) {
        const data = JSON.parse(fs.readFileSync(patternsFile, 'utf8'));
        this.patterns = new Map(Object.entries(data));
      }
    } catch (error) {
      this.logger.error('Failed to load learning data', { error: error instanceof Error ? error.message : String(error) }, 'adaptive-learning');
    }
  }

  private saveInteraction(interaction: UserInteraction): void {
    // Save to persistent storage for learning
    const interactionsFile = path.join(this.dataPath, 'interactions.json');
    const data = Object.fromEntries(this.interactions);
    fs.writeFileSync(interactionsFile, JSON.stringify(data, null, 2));
  }

  private handleInteraction(interaction: UserInteraction): void {
    // Real-time learning from interactions
    if (interaction.outcome?.problemSolved && interaction.outcome.userSatisfaction && interaction.outcome.userSatisfaction >= 4) {
      this.reinforceSuccessfulBehavior(interaction);
    } else if (interaction.context.issue?.wasAccurate === false) {
      this.adjustForFalsePositive(interaction);
    }
  }

  private handlePatternDiscovery(pattern: LearningPattern): void {
    this.logger.info('New learning pattern discovered', {
      patternId: pattern.id,
      agentId: pattern.agentId,
      confidence: pattern.confidence,
      successRate: pattern.successRate
    }, 'adaptive-learning');
  }

  // Additional helper methods
  private groupByFileType(interactions: UserInteraction[]): Map<string, UserInteraction[]> {
    const groups = new Map<string, UserInteraction[]>();
    for (const interaction of interactions) {
      const fileType = interaction.context.fileType || 'unknown';
      if (!groups.has(fileType)) {
        groups.set(fileType, []);
      }
      groups.get(fileType)!.push(interaction);
    }
    return groups;
  }

  private calculateConfidence(interactions: UserInteraction[]): number {
    if (interactions.length === 0) return 0;

    // Confidence is based on:
    // 1. Sample size (more interactions = higher confidence)
    // 2. Consistency of outcomes
    // 3. User verification rate

    const sampleSizeScore = Math.min(interactions.length / 20, 1) * 0.4;

    const verifiedCount = interactions.filter(i => i.context.issue?.userVerified).length;
    const verificationScore = (verifiedCount / interactions.length) * 0.3;

    const outcomes = interactions.filter(i => i.outcome);
    const consistencyScore = outcomes.length > 0
      ? (outcomes.filter(i => i.outcome?.problemSolved).length / outcomes.length) * 0.3
      : 0.15;

    return Math.min(sampleSizeScore + verificationScore + consistencyScore, 1);
  }

  private calculateSuccessRate(interactions: UserInteraction[]): number {
    const successful = interactions.filter(i => i.outcome?.problemSolved);
    return successful.length / interactions.length;
  }

  private extractProjectTypes(interactions: UserInteraction[]): string[] {
    return interactions.map(i => i.context.projectType).filter(Boolean) as string[];
  }

  private extractCommonIssues(interactions: UserInteraction[]): string[] {
    return interactions.map(i => i.context.issue?.type).filter(Boolean) as string[];
  }

  private extractUserPreferences(interactions: UserInteraction[]): Record<string, any> {
    const preferences: Record<string, any> = {};

    // Analyze severity preferences
    const severityPreferences: Record<string, number> = {};
    for (const interaction of interactions) {
      const severity = interaction.context.issue?.severity;
      if (severity) {
        severityPreferences[severity] = (severityPreferences[severity] || 0) + 1;
      }
    }
    if (Object.keys(severityPreferences).length > 0) {
      preferences['preferredSeverityLevel'] = Object.entries(severityPreferences)
        .sort(([, a], [, b]) => b - a)[0][0];
    }

    // Analyze suggestion follow-through to determine alert preferences
    const followedSuggestions = interactions.filter(i => i.context.suggestion?.wasFollowed);
    const ignoredSuggestions = interactions.filter(i =>
      i.context.suggestion && !i.context.suggestion.wasFollowed
    );

    if (followedSuggestions.length + ignoredSuggestions.length > 5) {
      preferences['alertPreferences'] = {
        followRate: followedSuggestions.length / (followedSuggestions.length + ignoredSuggestions.length),
        preferredTypes: this.getMostCommonSuggestionTypes(followedSuggestions)
      };
    }

    return preferences;
  }

  private getMostCommonSuggestionTypes(interactions: UserInteraction[]): string[] {
    const typeCounts: Record<string, number> = {};
    for (const interaction of interactions) {
      const type = interaction.context.suggestion?.type;
      if (type) {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      }
    }
    return Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);
  }

  private generateAgentImprovements(interactions: UserInteraction[]): string[] {
    const improvements: string[] = [];

    const successRate = this.calculateSuccessRate(interactions);
    if (successRate < 0.7) {
      improvements.push('Improve detection accuracy - current success rate below 70%');
    }

    const avgSatisfaction = interactions
      .filter(i => i.outcome?.userSatisfaction)
      .reduce((sum, i) => sum + (i.outcome?.userSatisfaction || 0), 0) /
      (interactions.filter(i => i.outcome?.userSatisfaction).length || 1);

    if (avgSatisfaction < 3.5) {
      improvements.push('Focus on user satisfaction - consider more actionable suggestions');
    }

    const fileTypes = [...new Set(interactions.map(i => i.context.fileType).filter(Boolean))];
    if (fileTypes.length > 0) {
      improvements.push(`Optimize for common file types: ${fileTypes.slice(0, 3).join(', ')}`);
    }

    return improvements.length > 0 ? improvements : ['Continue current detection patterns'];
  }

  private generateDetectionRules(interactions: UserInteraction[]): string[] {
    const rules: string[] = [];

    // Find patterns in successful detections
    const successfulByFileType = this.groupByFileType(
      interactions.filter(i => i.outcome?.problemSolved)
    );

    for (const [fileType, fileInteractions] of successfulByFileType) {
      if (fileInteractions.length >= 3) {
        const issueTypes = [...new Set(fileInteractions.map(i => i.context.issue?.type).filter(Boolean))];
        if (issueTypes.length > 0) {
          rules.push(`Prioritize ${issueTypes[0]} detection in ${fileType} files`);
        }
      }
    }

    return rules.length > 0 ? rules : ['Maintain current detection rules'];
  }

  private generateSuggestionTypes(interactions: UserInteraction[]): string[] {
    const suggestionTypes: string[] = [];

    // Analyze which suggestion types users follow
    const followedByType: Record<string, number> = {};
    const totalByType: Record<string, number> = {};

    for (const interaction of interactions) {
      const type = interaction.context.suggestion?.type;
      if (type) {
        totalByType[type] = (totalByType[type] || 0) + 1;
        if (interaction.context.suggestion?.wasFollowed) {
          followedByType[type] = (followedByType[type] || 0) + 1;
        }
      }
    }

    // Prioritize types with high follow-through
    for (const [type, total] of Object.entries(totalByType)) {
      const followed = followedByType[type] || 0;
      if (total >= 3 && followed / total > 0.5) {
        suggestionTypes.push(`Prioritize ${type} suggestions (${Math.round(followed / total * 100)}% follow rate)`);
      }
    }

    return suggestionTypes.length > 0 ? suggestionTypes : ['Balance suggestion types evenly'];
  }

  private extractFileTypes(interactions: UserInteraction[]): string[] {
    return [...new Set(interactions.map(i => i.context.fileType).filter(Boolean) as string[])];
  }

  private generateAntiPatterns(interactions: UserInteraction[]): string[] {
    const antiPatterns: string[] = [];

    // Group false positives by context
    const falsePositives = interactions.filter(i => i.context.issue?.wasAccurate === false);

    const byFileType = this.groupByFileType(falsePositives);
    for (const [fileType, fps] of byFileType) {
      if (fps.length >= 2) {
        const issueTypes = [...new Set(fps.map(i => i.context.issue?.type).filter(Boolean))];
        antiPatterns.push(`Reduce ${issueTypes[0] || 'detections'} in ${fileType} files`);
      }
    }

    const byIssueType: Record<string, number> = {};
    for (const fp of falsePositives) {
      const type = fp.context.issue?.type;
      if (type) {
        byIssueType[type] = (byIssueType[type] || 0) + 1;
      }
    }

    for (const [type, count] of Object.entries(byIssueType)) {
      if (count >= 3) {
        antiPatterns.push(`Review ${type} detection logic - ${count} false positives`);
      }
    }

    return antiPatterns.length > 0 ? antiPatterns : ['No significant false positive patterns detected'];
  }

  private analyzeSuggestionEffectiveness(interactions: UserInteraction[]): {
    lowFollowThroughSuggestions: string[];
    highFollowThroughSuggestions: string[];
    overallFollowRate: number;
  } {
    const suggestionStats: Record<string, { followed: number; total: number }> = {};

    for (const interaction of interactions) {
      const suggestion = interaction.context.suggestion;
      if (suggestion) {
        const type = suggestion.type;
        if (!suggestionStats[type]) {
          suggestionStats[type] = { followed: 0, total: 0 };
        }
        suggestionStats[type].total++;
        if (suggestion.wasFollowed) {
          suggestionStats[type].followed++;
        }
      }
    }

    const lowFollowThroughSuggestions: string[] = [];
    const highFollowThroughSuggestions: string[] = [];
    let totalFollowed = 0;
    let totalSuggestions = 0;

    for (const [type, stats] of Object.entries(suggestionStats)) {
      totalFollowed += stats.followed;
      totalSuggestions += stats.total;

      if (stats.total >= 3) {
        const rate = stats.followed / stats.total;
        if (rate < 0.3) {
          lowFollowThroughSuggestions.push(type);
        } else if (rate > 0.7) {
          highFollowThroughSuggestions.push(type);
        }
      }
    }

    return {
      lowFollowThroughSuggestions,
      highFollowThroughSuggestions,
      overallFollowRate: totalSuggestions > 0 ? totalFollowed / totalSuggestions : 0
    };
  }

  private analyzeDetectionAccuracy(interactions: UserInteraction[]): {
    falsePositiveRate: number;
    falsePositivePatterns: string[];
    truePositiveRate: number;
  } {
    const detectionsWithVerification = interactions.filter(i =>
      i.context.issue?.wasAccurate !== undefined
    );

    if (detectionsWithVerification.length === 0) {
      return { falsePositiveRate: 0, falsePositivePatterns: [], truePositiveRate: 1 };
    }

    const falsePositives = detectionsWithVerification.filter(i =>
      i.context.issue?.wasAccurate === false
    );
    const truePositives = detectionsWithVerification.filter(i =>
      i.context.issue?.wasAccurate === true
    );

    // Identify patterns in false positives
    const falsePositivePatterns: string[] = [];
    const fpByFileType: Record<string, number> = {};
    const fpByIssueType: Record<string, number> = {};

    for (const fp of falsePositives) {
      if (fp.context.fileType) {
        fpByFileType[fp.context.fileType] = (fpByFileType[fp.context.fileType] || 0) + 1;
      }
      if (fp.context.issue?.type) {
        fpByIssueType[fp.context.issue.type] = (fpByIssueType[fp.context.issue.type] || 0) + 1;
      }
    }

    for (const [fileType, count] of Object.entries(fpByFileType)) {
      if (count >= 2) {
        falsePositivePatterns.push(`${fileType}:high_fp_rate`);
      }
    }
    for (const [issueType, count] of Object.entries(fpByIssueType)) {
      if (count >= 2) {
        falsePositivePatterns.push(`${issueType}:unreliable`);
      }
    }

    return {
      falsePositiveRate: falsePositives.length / detectionsWithVerification.length,
      falsePositivePatterns,
      truePositiveRate: truePositives.length / detectionsWithVerification.length
    };
  }

  private calculateTopPerformingAgents(): Array<{ agentId: string; successRate: number }> {
    const agentStats: Array<{ agentId: string; successRate: number }> = [];

    for (const [agentId, interactions] of this.interactions) {
      if (interactions.length >= 5) {
        const successRate = this.calculateSuccessRate(interactions);
        agentStats.push({ agentId, successRate });
      }
    }

    return agentStats
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5);
  }

  private reinforceSuccessfulBehavior(interaction: UserInteraction): void {
    // Record the successful pattern for future reference
    const patternKey = `${interaction.agentId}_${interaction.context.fileType}_success`;

    if (!this.patterns.has(patternKey)) {
      const newPattern: LearningPattern = {
        id: patternKey,
        agentId: interaction.agentId,
        pattern: `Successful ${interaction.actionType} pattern`,
        confidence: 0.5,
        usageCount: 1,
        successRate: 1,
        context: {
          fileTypes: interaction.context.fileType ? [interaction.context.fileType] : [],
          projectTypes: interaction.context.projectType ? [interaction.context.projectType] : [],
          commonIssues: interaction.context.issue?.type ? [interaction.context.issue.type] : [],
          userPreferences: {}
        },
        recommendations: {
          agentImprovements: [],
          detectionRules: [],
          suggestionTypes: []
        }
      };
      this.patterns.set(patternKey, newPattern);
    } else {
      const pattern = this.patterns.get(patternKey)!;
      pattern.usageCount++;
      pattern.confidence = Math.min(pattern.confidence + 0.05, 1);
    }
  }

  private adjustForFalsePositive(interaction: UserInteraction): void {
    // Record the false positive for learning
    const patternKey = `${interaction.agentId}_${interaction.context.fileType}_fp`;

    if (!this.patterns.has(patternKey)) {
      const newPattern: LearningPattern = {
        id: patternKey,
        agentId: interaction.agentId,
        pattern: `False positive pattern in ${interaction.context.fileType || 'unknown'} files`,
        confidence: 0.3,
        usageCount: 1,
        successRate: 0,
        context: {
          fileTypes: interaction.context.fileType ? [interaction.context.fileType] : [],
          projectTypes: interaction.context.projectType ? [interaction.context.projectType] : [],
          commonIssues: interaction.context.issue?.type ? [interaction.context.issue.type] : [],
          userPreferences: {}
        },
        recommendations: {
          agentImprovements: ['Review detection criteria'],
          detectionRules: ['Add exclusion for this pattern'],
          suggestionTypes: []
        }
      };
      this.patterns.set(patternKey, newPattern);
    } else {
      const pattern = this.patterns.get(patternKey)!;
      pattern.usageCount++;
      // Increase confidence that this is a problematic pattern
      pattern.confidence = Math.min(pattern.confidence + 0.1, 1);
    }
  }

  private async createRollbackData(agentId: string): Promise<Record<string, any>> {
    // Capture current state for potential rollback
    const agentAdaptations = this.adaptations.get(agentId) || [];
    const agentPatterns = Array.from(this.patterns.values())
      .filter(p => p.agentId === agentId);

    return {
      timestamp: Date.now(),
      agentId,
      adaptationsCount: agentAdaptations.length,
      patternsSnapshot: agentPatterns.map(p => ({
        id: p.id,
        confidence: p.confidence,
        successRate: p.successRate
      })),
      configSnapshot: {
        minInteractionsForPattern: this.learningConfig.minInteractionsForPattern,
        confidenceThreshold: this.learningConfig.confidenceThreshold
      }
    };
  }

  private async applyAdaptationChanges(agentId: string, adaptation: AgentAdaptation): Promise<void> {
    // Apply the adaptation based on type
    switch (adaptation.adaptationType) {
      case 'detection_rule':
        // Would update agent's detection rules configuration
        this.logger.info(`Applying detection rule changes for ${agentId}`, {
          changes: adaptation.changes
        }, 'adaptive-learning');
        break;

      case 'suggestion_algorithm':
        // Would update suggestion prioritization
        this.logger.info(`Applying suggestion algorithm changes for ${agentId}`, {
          changes: adaptation.changes
        }, 'adaptive-learning');
        break;

      case 'priority_weighting':
        // Would update priority weights
        this.logger.info(`Applying priority weighting changes for ${agentId}`, {
          changes: adaptation.changes
        }, 'adaptive-learning');
        break;

      case 'context_awareness':
        // Would update context-aware behavior
        this.logger.info(`Applying context awareness changes for ${agentId}`, {
          changes: adaptation.changes
        }, 'adaptive-learning');
        break;
    }

    // Save adaptation to persistent storage
    const adaptationsFile = path.join(this.dataPath, 'applied_adaptations.json');
    let appliedAdaptations: Record<string, any>[] = [];

    if (fs.existsSync(adaptationsFile)) {
      try {
        appliedAdaptations = JSON.parse(fs.readFileSync(adaptationsFile, 'utf8'));
      } catch {
        // File corrupted, start fresh
      }
    }

    appliedAdaptations.push({
      ...adaptation,
      appliedAt: Date.now()
    });

    fs.writeFileSync(adaptationsFile, JSON.stringify(appliedAdaptations, null, 2));
  }
}

// Export singleton instance
export const adaptiveLearning = new AdaptiveLearningEngine();
export default adaptiveLearning;