/**
 * INITIAL.md Template Parser
 *
 * Parses structured .versatil/templates/INITIAL.md files into
 * structured data for enhanced planning (+40% requirement clarity).
 *
 * Used by /plan command to detect and parse INITIAL.md templates,
 * extracting feature details, examples, gotchas, and success criteria.
 */
import { readFile, stat } from 'fs/promises';
export class TemplateParser {
    /**
     * Check if path is an INITIAL.md template file
     */
    static async isTemplate(filePath) {
        try {
            if (!filePath.endsWith('.md'))
                return false;
            const stats = await stat(filePath);
            if (!stats.isFile())
                return false;
            // Check if file contains INITIAL.md markers
            const content = await readFile(filePath, 'utf-8');
            return content.includes('## FEATURE') || content.includes('# FEATURE');
        }
        catch {
            return false;
        }
    }
    /**
     * Parse INITIAL.md template into structured data
     */
    static async parse(filePath) {
        const content = await readFile(filePath, 'utf-8');
        return {
            feature: this.parseFeatureSection(content),
            examples: this.parseExamplesSection(content),
            documentation: this.parseDocumentationSection(content),
            gotchas: this.parseGotchasSection(content),
            edgeCases: this.parseEdgeCasesSection(content),
            testRequirements: this.parseTestRequirementsSection(content),
            technicalConstraints: this.parseTechnicalConstraintsSection(content),
            successCriteria: this.parseSuccessCriteriaSection(content),
            agentRouting: this.parseAgentRoutingSection(content),
            raw: content,
            filePath
        };
    }
    /**
     * Parse FEATURE section
     */
    static parseFeatureSection(content) {
        const section = this.extractSection(content, 'FEATURE');
        const title = this.extractFirstLine(section);
        const description = this.extractParagraphs(section)[0] || '';
        const goals = this.extractBulletList(section, 'Goals');
        const acceptanceCriteria = this.extractBulletList(section, 'Acceptance Criteria');
        return { title, description, goals, acceptanceCriteria };
    }
    /**
     * Parse EXAMPLES section
     */
    static parseExamplesSection(content) {
        const section = this.extractSection(content, 'EXAMPLES');
        const description = this.extractParagraphs(section)[0] || '';
        const references = this.extractBulletList(section);
        return { description, references };
    }
    /**
     * Parse DOCUMENTATION section
     */
    static parseDocumentationSection(content) {
        const section = this.extractSection(content, 'DOCUMENTATION');
        const urls = this.extractBulletList(section, 'URLs');
        const skills = this.extractBulletList(section, 'Skills');
        const mcpServers = this.extractBulletList(section, 'MCP Servers');
        const apis = this.extractBulletList(section, 'APIs');
        return { urls, skills, mcpServers, apis };
    }
    /**
     * Parse GOTCHAS section (OTHER CONSIDERATIONS)
     */
    static parseGotchasSection(content) {
        const section = this.extractSection(content, 'OTHER CONSIDERATIONS');
        const description = this.extractParagraphs(section)[0] || '';
        const items = this.extractBulletList(section, 'Gotchas');
        return { description, items };
    }
    /**
     * Parse Edge Cases
     */
    static parseEdgeCasesSection(content) {
        const section = this.extractSection(content, 'OTHER CONSIDERATIONS');
        return this.extractBulletList(section, 'Edge Cases');
    }
    /**
     * Parse Test Requirements
     */
    static parseTestRequirementsSection(content) {
        const section = this.extractSection(content, 'OTHER CONSIDERATIONS');
        const coverageMatch = section.match(/Coverage:\s*([^\n]+)/i);
        const coverage = coverageMatch ? coverageMatch[1].trim() : '80%+';
        const types = this.extractBulletList(section, 'Test Types');
        const scenarios = this.extractBulletList(section, 'Test Scenarios');
        return { coverage, types, scenarios };
    }
    /**
     * Parse Technical Constraints
     */
    static parseTechnicalConstraintsSection(content) {
        const section = this.extractSection(content, 'OTHER CONSIDERATIONS');
        return this.extractBulletList(section, 'Technical Constraints');
    }
    /**
     * Parse Success Criteria
     */
    static parseSuccessCriteriaSection(content) {
        const section = this.extractSection(content, 'OTHER CONSIDERATIONS');
        const functional = this.extractBulletList(section, 'Success Criteria');
        const quality = this.extractBulletList(section, 'Quality Gates');
        const performance = this.extractBulletList(section, 'Performance');
        return { functional, quality, performance };
    }
    /**
     * Parse Agent Routing hints (optional)
     */
    static parseAgentRoutingSection(content) {
        const section = this.extractSection(content, 'AGENT ROUTING');
        if (!section)
            return undefined;
        const primary = this.extractBulletList(section, 'Primary');
        const optional = this.extractBulletList(section, 'Optional');
        return { primary, optional };
    }
    // ============================================================================
    // Helper methods for parsing
    // ============================================================================
    /**
     * Extract section by header name
     */
    static extractSection(content, headerName) {
        const regex = new RegExp(`##?\\s*${headerName}\\s*\\n([\\s\\S]*?)(?=\\n##?\\s|$)`, 'i');
        const match = content.match(regex);
        return match ? match[1].trim() : '';
    }
    /**
     * Extract first non-empty line
     */
    static extractFirstLine(section) {
        const lines = section.split('\n').filter(l => l.trim().length > 0);
        return lines[0] || '';
    }
    /**
     * Extract paragraphs (non-list text)
     */
    static extractParagraphs(section) {
        const lines = section.split('\n');
        const paragraphs = [];
        let current = '';
        for (const line of lines) {
            if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                if (current) {
                    paragraphs.push(current.trim());
                    current = '';
                }
            }
            else if (line.trim().length > 0) {
                current += line + ' ';
            }
            else if (current) {
                paragraphs.push(current.trim());
                current = '';
            }
        }
        if (current)
            paragraphs.push(current.trim());
        return paragraphs;
    }
    /**
     * Extract bullet list items
     */
    static extractBulletList(section, subheader) {
        let targetSection = section;
        // If subheader provided, extract that subsection
        if (subheader) {
            const regex = new RegExp(`###?\\s*${subheader}\\s*\\n([\\s\\S]*?)(?=\\n###?\\s|$)`, 'i');
            const match = section.match(regex);
            if (!match)
                return [];
            targetSection = match[1];
        }
        const items = [];
        const lines = targetSection.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                const item = trimmed.replace(/^[-*]\s*/, '').trim();
                if (item.length > 0) {
                    items.push(item);
                }
            }
        }
        return items;
    }
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
//# sourceMappingURL=template-parser.js.map