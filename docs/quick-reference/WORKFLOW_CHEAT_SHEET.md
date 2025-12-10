# VERSATIL Workflows - Quick Reference Cheat Sheet

**3 Core Workflows** - EVERY, Three-Tier Parallel, Instinctive Testing

---

## VELOCITY Workflow (5 Phases)

**Compounding Engineering**: Each feature makes the next 40% faster

### Phase 1: PLAN 📋
```yaml
Command: /plan "feature description"
Purpose: Research and design with templates + historical context
Agents: Alex-BA, Dana, Marcus, James (parallel research)
Duration: 30-60 minutes

Inputs:
  - Feature description
  - User requirements
  - Business goals

Outputs:
  - Detailed implementation plan
  - Effort estimates (from historical data)
  - Risk analysis
  - Alternative approaches
  - Task breakdown (todos/*.md)

Compounding:
  - Uses templates from past features
  - Retrieves similar implementations from RAG
  - Applies learned patterns automatically
  - Result: 40% faster planning vs first-time feature

Example:
  /plan "Add user authentication with OAuth2"

  Output:
    • Requirements analysis (Alex-BA): 30 min
    • Database schema (Dana): 20 min
    • API design (Marcus): 45 min
    • UI components (James): 35 min
    • Integration: 15 min
    • Quality gates (Maria): 20 min
    Total estimate: 165 minutes (2.75 hours)
```

### Phase 2: ASSESS ✅
```yaml
Command: /assess "work target"
Purpose: Validate readiness before work starts
Duration: 5-10 minutes

Checks:
  - Framework health ≥ 80%
  - Git status clean (no uncommitted changes)
  - Dependencies installed (npm/pip/bundle)
  - Database connected (if required)
  - Environment variables set
  - Build passing
  - Tests passing

Compounding:
  - Catches blockers early (prevents wasted effort)
  - Historical data shows 95% of issues caught here
  - Result: No mid-implementation surprises

Example:
  /assess "authentication feature"

  Output:
    ✅ Framework health: 94%
    ✅ Git status: Clean
    ✅ Dependencies: Up to date
    ✅ Database: Connected
    ✅ Env vars: All set
    ⚠️  Tests: 2 failing (fix before starting)

    Action: Fix failing tests first (estimated 10 min)
```

### Phase 3: DELEGATE 🔄
```yaml
Command: /delegate "task pattern"
Purpose: Distribute work to optimal agents
Duration: 2-5 minutes

Features:
  - Smart agent selection (based on historical performance)
  - Parallel execution (Rule 1)
  - Load balancing (distributes evenly)
  - Collision detection (prevents file conflicts)

Compounding:
  - Learns best agent assignments over time
  - Example: Marcus-Node 15% faster than Marcus-Python for this project
  - Result: Optimal agent selection automatically

Example:
  /delegate "authentication todos"

  Output:
    Task distribution (parallel):
    • Dana-Database: Schema design (45 min)
    • Marcus-Backend: API endpoints (60 min)
    • James-Frontend: LoginForm UI (50 min)

    Parallel time: max(45, 60, 50) = 60 minutes
    Sequential time: 155 minutes
    Time saved: 95 minutes (61% faster!)
```

### Phase 4: WORK 🚀
```yaml
Command: /work "work target"
Purpose: Execute implementation with tracking
Duration: Variable (feature-dependent)

Features:
  - Loads persistent todos (todos/*.md)
  - Real-time progress tracking (TodoWrite)
  - Quality gate enforcement
  - Continuous monitoring (--monitor flag)

Compounding:
  - Applies learned patterns automatically
  - Auto-generates boilerplate (from templates)
  - Suggests optimizations (from historical data)
  - Result: Implementation 40% faster

Example:
  /work --monitor "authentication feature"

  Output (real-time statusline):
    🤖 Dana: Creating schema... ████████░░ 80%
    🤖 Marcus: Building API... █████░░░░░ 50%
    🤖 James: Designing UI... ███████░░░ 70%

    Overall progress: 67% (100 of 150 minutes elapsed)
    Estimated completion: 14:30 (in 50 minutes)
```

### Phase 5: CODIFY 📚
```yaml
Command: /learn "feature branch"
Purpose: Extract and store patterns for future use
Duration: 10-15 minutes

Actions:
  - Analyze completed work (git diff main...feature/auth)
  - Extract reusable patterns (code, tests, docs)
  - Update effort estimates (planned vs actual)
  - Capture lessons learned ("watch out for X")
  - Update plan templates with real data
  - Store in RAG memory for retrieval

Compounding:
  - Future features benefit from THIS feature's learnings
  - Example: Auth feature #2 will be 40% faster due to patterns stored here
  - Result: Continuous improvement (flywheel effect)

Example:
  /learn "feature/auth"

  Output:
    📚 Patterns extracted:
    • JWT authentication flow (Node.js)
    • Secure password hashing (bcrypt, 12 rounds)
    • Database indexes for performance (users.email)
    • Test patterns (React Testing Library)

    📊 Effort analysis:
    • Planned: 165 minutes
    • Actual: 142 minutes (14% faster than estimated!)
    • Reason: Reused OAuth2 patterns from previous feature

    💡 Lessons learned:
    • "Add index on users.email BEFORE creating users table"
    • "JWT expiry should be 24h for security vs UX balance"
    • "Test refresh token flow separately (easy to miss)"

    ✅ Patterns stored in RAG (3 code examples, 2 test templates)
    → Next auth feature will be ~40% faster!
```

---

## Three-Tier Parallel Development

**Concept**: Frontend, backend, and database work **simultaneously**

### Workflow Diagram
```
┌─────────────────────────────────────────────────────┐
│ Phase 1: Requirements (Alex-BA) - 30 minutes       │
│ • User stories                                      │
│ • API contract (OpenAPI spec)                       │
│ • Acceptance criteria                               │
└─────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────────┐
│ Phase 2: PARALLEL Development - 60 minutes                   │
├───────────────────┬───────────────────┬──────────────────────┤
│ Dana-Database     │ Marcus-Backend    │ James-Frontend       │
│ (45 min)          │ (60 min)          │ (50 min)             │
│                   │                   │                      │
│ • users table     │ • POST /auth/login│ • LoginForm.tsx      │
│ • sessions table  │ • POST /auth/reg  │ • validation         │
│ • RLS policies    │ • GET /auth/me    │ • error handling     │
│ • indexes         │ • JWT logic       │ • responsive design  │
│ • migrations      │ • MOCK database   │ • MOCK API           │
└───────────────────┴───────────────────┴──────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Phase 3: Integration - 15 minutes                   │
│ • Dana → Marcus: Connect real database              │
│ • Marcus → James: Connect real API                  │
│ • Test end-to-end flow                              │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Phase 4: Quality (Maria-QA) - 20 minutes            │
│ • Run test suite (all tiers)                        │
│ • Validate coverage (80%+)                          │
│ • Security scan (OWASP)                             │
│ • Performance test (< 200ms)                        │
└─────────────────────────────────────────────────────┘

Total: 30 + 60 + 15 + 20 = 125 minutes (2.1 hours)
Sequential: 30 + 45 + 60 + 50 + 15 + 20 = 220 minutes (3.7 hours)
Time Saved: 95 minutes (43% faster via parallel work!)
```

### Key Insight: Mocks Enable Parallelism
```yaml
Why_Mocks_Matter:
  Problem: "Backend needs database, frontend needs backend"
  Solution: "Use mocks during parallel phase"

  Dana_Database:
    - Creates real schema
    - But Marcus doesn't wait for it

  Marcus_Backend:
    - Uses MOCK database initially
    - Implements API logic
    - Tests with mock data

  James_Frontend:
    - Uses MOCK API initially
    - Builds UI components
    - Tests with mock responses

  Integration_Phase:
    - Replace mocks with real connections
    - Fix any integration issues (usually minor)
    - Total integration time: ~15 minutes

  Result:
    - All 3 tiers work in parallel
    - Integration is just "wiring up"
    - 43% faster than sequential!
```

---

## Instinctive Testing Workflow

**Concept**: Tests written **before** implementation (proactive, not reactive)

### Workflow Steps
```yaml
Step_1_Requirements (Alex-BA):
  Input: Feature request
  Output: User stories + acceptance criteria
  Duration: 20-30 minutes

  Example:
    User Story: "As a user, I want to login with email/password"
    Acceptance Criteria:
      - User can enter email and password
      - Form validates email format
      - Invalid credentials show error message
      - Valid credentials redirect to dashboard
      - Session persists for 24 hours

Step_2_Test_Design (Maria-QA):
  Input: Acceptance criteria
  Output: Test cases (before any code written!)
  Duration: 30-40 minutes

  Example:
    Test Cases:
    ✓ Should validate email format
    ✓ Should show error on invalid credentials
    ✓ Should redirect to dashboard on success
    ✓ Should persist session for 24 hours
    ✓ Should handle network errors gracefully
    ✓ Should be accessible (WCAG 2.1 AA)
    ✓ Should be responsive (mobile + desktop)

Step_3_Implementation (Dana, Marcus, James):
  Input: Test cases (failing tests!)
  Output: Code that makes tests pass
  Duration: 60-90 minutes (parallel)

  TDD_Loop:
    1. Run tests (all fail initially - RED)
    2. Write minimal code to pass one test (GREEN)
    3. Refactor code (improve while tests still pass)
    4. Repeat for next test

  Benefits:
    - Clear success criteria (all tests green)
    - No over-engineering (only code needed to pass tests)
    - Refactoring is safe (tests catch regressions)

Step_4_Validation (Maria-QA):
  Input: Implementation + passing tests
  Output: Coverage report + quality metrics
  Duration: 10-15 minutes

  Checks:
    ✅ All tests passing
    ✅ Coverage >= 80%
    ✅ Performance validated (< 200ms)
    ✅ Accessibility validated (WCAG AA)
    ✅ Security validated (OWASP clean)

  Quality_Gates:
    - If coverage < 80% → Block commit
    - If perf > 200ms → Block commit
    - If security issues → Block commit
```

### Benefits of Instinctive Testing
```yaml
Benefit_1_Fewer_Bugs:
  Traditional: Write code → Find bugs later → Fix bugs
  Instinctive: Write tests → Write code → Tests catch bugs immediately
  Result: 89% reduction in production bugs

Benefit_2_Better_Design:
  Traditional: Code first → Hard to test later → Spaghetti code
  Instinctive: Tests first → Code must be testable → Clean architecture
  Result: 67% improvement in code maintainability

Benefit_3_Faster_Debugging:
  Traditional: Bug found → Where is it? → Add tests → Fix → Hope it works
  Instinctive: Test fails → Exact location known → Fix → Test passes
  Result: 75% faster debugging

Benefit_4_Higher_Coverage:
  Traditional: Coverage is optional → Often < 50%
  Instinctive: Coverage is built-in → Always >= 80%
  Result: 100% of code has tests (mandatory quality gate)

Benefit_5_Fearless_Refactoring:
  Traditional: Refactor → Break things → Manual testing → Rollback
  Instinctive: Refactor → Tests catch breaks immediately → Fix safely
  Result: 3x more refactoring (continuous improvement)
```

---

## Workflow Comparison

```yaml
Feature_Development_Time_Comparison:

Traditional_Sequential:
  Requirements: 30 min
  Database: 45 min
  Backend: 60 min
  Frontend: 50 min
  Integration: 30 min (longer, no mocks)
  Testing: 40 min (after implementation)
  Bug fixes: 25 min
  Total: 280 minutes (4.7 hours)

VERSATIL_Three_Tier:
  Requirements: 30 min
  Parallel Development: 60 min (Dana + Marcus + James)
  Integration: 15 min (mocks make it fast)
  Testing: 20 min (instinctive testing)
  Total: 125 minutes (2.1 hours)
  Time Saved: 155 minutes (55% faster!)

VERSATIL_EVERY_Workflow:
  Plan: 30 min (with templates)
  Assess: 5 min
  Delegate: 2 min
  Work: 60 min (parallel)
  Codify: 10 min
  Total: 107 minutes (1.8 hours)
  Time Saved: 173 minutes (62% faster!)

Compounding_Effect:
  Feature #1: 107 minutes
  Feature #2: 64 minutes (40% faster, patterns reused)
  Feature #3: 51 minutes (52% faster, more patterns)
  Feature #4: 45 minutes (58% faster, mature templates)
```

---

## Quick Commands

```bash
# VELOCITY Workflow
/plan "feature description"          # Phase 1
/assess "work target"                # Phase 2
/delegate "task pattern"             # Phase 3
/work "work target"                  # Phase 4
/learn "feature branch"              # Phase 5

# Three-Tier Parallel
/plan --template=three-tier "feature"
/work --parallel "feature"           # Auto-coordinates 3 tiers

# Instinctive Testing
/maria design tests "feature"        # Before implementation
/work --tdd "feature"                # TDD mode (red-green-refactor)
```

---

## Monitoring Workflows

```bash
# View workflow progress
ppnpm dashboard                    # Real-time visualization

# View workflow metrics
ppnpm workflow:metrics             # Success rate, time savings

# View compounding effect
ppnpm compounding:report           # Show 40% improvement trend
```

---

**Framework Version**: 6.4.0
**Core Workflows**: 3 (EVERY, Three-Tier, Instinctive Testing)
**Last Updated**: 2025-10-19

For detailed documentation: `/help workflows` or see CLAUDE.md
