/**
 * INITIAL.md Template Parser
 *
 * Parses structured .versatil/templates/INITIAL.md files into
 * structured data for enhanced planning (+40% requirement clarity).
 *
 * Used by /plan command to detect and parse INITIAL.md templates,
 * extracting feature details, examples, gotchas, and success criteria.
 */
export interface InitialTemplate {
    feature: {
        title: string;
        description: string;
        goals: string[];
        acceptanceCriteria: string[];
    };
    examples: {
        description: string;
        references: string[];
    };
    documentation: {
        urls: string[];
        skills: string[];
        mcpServers: string[];
        apis: string[];
    };
    gotchas: {
        description: string;
        items: string[];
    };
    edgeCases: string[];
    testRequirements: {
        coverage: string;
        types: string[];
        scenarios: string[];
    };
    technicalConstraints: string[];
    successCriteria: {
        functional: string[];
        quality: string[];
        performance: string[];
    };
    agentRouting?: {
        primary: string[];
        optional: string[];
    };
    raw: string;
    filePath: string;
}
export declare class TemplateParser {
    /**
     * Check if path is an INITIAL.md template file
     */
    static isTemplate(filePath: string): Promise<boolean>;
    /**
     * Parse INITIAL.md template into structured data
     */
    static parse(filePath: string): Promise<InitialTemplate>;
    /**
     * Parse FEATURE section
     */
    private static parseFeatureSection;
    /**
     * Parse EXAMPLES section
     */
    private static parseExamplesSection;
    /**
     * Parse DOCUMENTATION section
     */
    private static parseDocumentationSection;
    /**
     * Parse GOTCHAS section (OTHER CONSIDERATIONS)
     */
    private static parseGotchasSection;
    /**
     * Parse Edge Cases
     */
    private static parseEdgeCasesSection;
    /**
     * Parse Test Requirements
     */
    private static parseTestRequirementsSection;
    /**
     * Parse Technical Constraints
     */
    private static parseTechnicalConstraintsSection;
    /**
     * Parse Success Criteria
     */
    private static parseSuccessCriteriaSection;
    /**
     * Parse Agent Routing hints (optional)
     */
    private static parseAgentRoutingSection;
    /**
     * Extract section by header name
     */
    private static extractSection;
    /**
     * Extract first non-empty line
     */
    private static extractFirstLine;
    /**
     * Extract paragraphs (non-list text)
     */
    private static extractParagraphs;
    /**
     * Extract bullet list items
     */
    private static extractBulletList;
}
/**
 * USAGE EXAMPLES:
 *
 * 1. Check if file is an INITIAL.md template:
 * ```typescript
 * const isTemplate = await TemplateParser.isTemplate('.versatil/templates/INITIAL.md');
 * if (isTemplate) {
 *   console.log('Valid template detected');
 * }
 * ```
 *
 * 2. Parse template into structured data:
 * ```typescript
 * const template = await TemplateParser.parse('.versatil/templates/INITIAL.md');
 *
 * console.log(`Feature: ${template.feature.title}`);
 * console.log(`Goals: ${template.feature.goals.length}`);
 * console.log(`Examples: ${template.examples.references.length}`);
 * console.log(`Gotchas: ${template.gotchas.items.length}`);
 * console.log(`Success Criteria: ${template.successCriteria.functional.length}`);
 * ```
 *
 * 3. Use in /plan command:
 * ```typescript
 * if (await TemplateParser.isTemplate(feature_description)) {
 *   const template = await TemplateParser.parse(feature_description);
 *
 *   // Enhanced planning with structured data
 *   console.log(`✅ Enhanced planning with INITIAL.md template`);
 *   console.log(`   - ${template.examples.references.length} examples referenced`);
 *   console.log(`   - ${template.gotchas.items.length} gotchas to avoid`);
 *   console.log(`   - ${template.successCriteria.functional.length} acceptance criteria`);
 *
 *   // Pass to agents
 *   const agentPrompt = `
 *     Feature: ${template.feature.title}
 *     Description: ${template.feature.description}
 *
 *     Gotchas to Avoid:
 *     ${template.gotchas.items.map(g => `- ${g}`).join('\n')}
 *
 *     Success Criteria:
 *     ${template.successCriteria.functional.map(c => `- ${c}`).join('\n')}
 *   `;
 * }
 * ```
 */
export default TemplateParser;
