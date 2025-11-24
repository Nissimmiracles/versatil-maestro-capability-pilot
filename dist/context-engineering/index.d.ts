/**
 * Context Engineering Services
 *
 * Barrel export for all context-engineering integration services.
 * These services power the /plan and /work commands with examples,
 * gotchas, and INITIAL.md template parsing.
 */
export { ExamplesSearchService } from './examples-search.js';
export type { ExampleFile, ExampleSearchQuery, ExampleSearchResult } from './examples-search.js';
export { GotchasSearchService } from './gotchas-search.js';
export type { GotchaEntry, GotchaSeverity, GotchaSearchQuery, GotchaSearchResult } from './gotchas-search.js';
export { TemplateParser } from './template-parser.js';
export type { InitialTemplate } from './template-parser.js';
export { default as ExamplesSearch } from './examples-search.js';
export { default as GotchasSearch } from './gotchas-search.js';
export { default as TemplateParserDefault } from './template-parser.js';
