---
id: "Maria-QA-critical-1762345812044"
created: "2025-11-05T12:30:12.043Z"
type: "guardian-combined"
assigned_agent: "Maria-QA"
priority: "critical"
issue_count: 1
avg_confidence: 100
auto_apply_count: 1
manual_review_count: 0
grouping_strategy: "agent"
verified_by: "Victor-Verifier (Guardian Health Check)"
---

# 🛡️ Guardian Health Check - Maria-QA

**Combined TODO**: 1 related issue detected

## Summary

- **Assigned Agent**: **Maria-QA**
- **Priority**: **CRITICAL**
- **Total Issues**: 1
- **Average Confidence**: 100%
- **Auto-Apply Eligible**: 1
- **Manual Review Required**: 0
- **Detection Layer**: 📦 Project

## Issues Detected

### 1. tests

**Issue**: Tests failed: Command failed: npm test -- --passWithNoTests
npm warn Unknown env config "shamefully-hoist". This will stop working in the next major version of npm.
npm warn Unknown env config "public-hoist-pattern". This will stop working in the next major version of npm.
npm warn Unknown env config "package-import-method". This will stop working in the next major version of npm.
npm warn Unknown env config "auto-install-peers". This will stop working in the next major version of npm.
npm warn Unknown env config "node-linker". This will stop working in the next major version of npm.
npm warn Unknown env config "side-effects-cache". This will stop working in the next major version of npm.
npm warn Unknown env config "lockfile". This will stop working in the next major version of npm.
npm warn Unknown project config "shamefully-hoist". This will stop working in the next major version of npm.
npm warn Unknown project config "public-hoist-pattern". This will stop working in the next major version of npm.
npm warn Unknown project config "auto-install-peers". This will stop working in the next major version of npm.
npm warn Unknown project config "strict-peer-dependencies". This will stop working in the next major version of npm.
npm warn Unknown project config "lockfile". This will stop working in the next major version of npm.
npm warn Unknown project config "node-linker". This will stop working in the next major version of npm.
npm warn Unknown project config "package-import-method". This will stop working in the next major version of npm.
npm warn Unknown project config "side-effects-cache". This will stop working in the next major version of npm.


**Details**:
- **Priority**: critical
- **Confidence**: 100%
- **Auto-Apply**: YES ✅
- **Layer**: 📦 project

**Evidence Summary**: ✓ Test failure in test suite (100%)

**Recommended Fix**: Fix failing tests:
32m 1[2mms[22m[39m
       [32m✓[39m should compare version numbers[32m 1[2mms[22m[39m
       [32m✓[39m should calculate roadmap progress[32m 1[2mms[22m[39m
       [32m✓[39m should calculate progress percentage[32m 0[2mms[22m[39m
       [32m✓[39m should handle missing package.json[32m 3[2mms[22m[39m
       [32m✓[39m should handle git command failures[32m 1[2mms[22m[39m
[31m       [31m×[31m should handle malformed version strings[39m[32m 1[2mms[22m[39m
 [32m✓[39m tests/mcp/docs-errors-enhanced.test.ts [2m([22m[2m25 tests[22m[2m)[22m[32m 39[2mms[22m[39m
 [32m✓[39m tests/mcp/docs-cache.test.ts [2m([22m[2m27 tests[22m[2m)[22m[33m 3009[2mms[22m[39m
       [33m[2m✓[22m[39m should expire cache entries after maxAge [33m 1103[2mms[22m[39m
       [33m[2m✓[22m[39m should validate cache freshness with isCacheValid [33m 1110[2mms[22m[39m
       [33m[2m✓[22m[39m should respect custom maxAge [33m 608[2mms[22m[39m


---

## 🎯 Recommended Actions (Priority Order)

1. Fix failing tests:
32m 1[2mms[22m[39m
       [32m✓[39m should compare version numbers[32m 1[2mms[22m[39m
       [32m✓[39m should calculate roadmap progress[32m 1[2mms[22m[39m
       [32m✓[39m should calculate progress percentage[32m 0[2mms[22m[39m
       [32m✓[39m should handle missing package.json[32m 3[2mms[22m[39m
       [32m✓[39m should handle git command failures[32m 1[2mms[22m[39m
[31m       [31m×[31m should handle malformed version strings[39m[32m 1[2mms[22m[39m
 [32m✓[39m tests/mcp/docs-errors-enhanced.test.ts [2m([22m[2m25 tests[22m[2m)[22m[32m 39[2mms[22m[39m
 [32m✓[39m tests/mcp/docs-cache.test.ts [2m([22m[2m27 tests[22m[2m)[22m[33m 3009[2mms[22m[39m
       [33m[2m✓[22m[39m should expire cache entries after maxAge [33m 1103[2mms[22m[39m
       [33m[2m✓[22m[39m should validate cache freshness with isCacheValid [33m 1110[2mms[22m[39m
       [33m[2m✓[22m[39m should respect custom maxAge [33m 608[2mms[22m[39m


## 📊 Execution Strategy

**Suggested Approach**:

1. **Auto-Apply (1 issues)**: Guardian can automatically remediate these high-confidence issues
   - Review auto-fix logs after execution
   - Verify changes before committing


**Estimated Effort**: 15-30 minutes (depending on complexity)

## 🧠 Learning Opportunity

After resolving these issues:
1. Run `/learn "Resolved 1 critical issues in project layer"`
2. Guardian will store fix patterns in RAG
3. Similar issues will be auto-remediable in the future (compounding engineering)

## 🔍 Verification Details

All issues verified using Chain-of-Verification (CoVe) methodology:
- Layer Classification (framework/project/context)
- Ground Truth Verification (file system, git, logs)
- Agent Assignment (based on specialization)
- Confidence Scoring (0-100%)

**Full verification evidence available in individual issue sections above.**

---

**Generated by Guardian Verified Issue Detector**
**Verification Pipeline**: Health Check → Layer Classification → Ground Truth Verification → TODO Grouping
**Anti-Hallucination**: Chain-of-Verification (CoVe) methodology
**Grouping Strategy**: agent (configurable via GUARDIAN_GROUP_BY env var)


---
**Archived**: 2025-11-10T07:33:20.933Z
**Reason**: Stale (115.1h old, max 72h)
