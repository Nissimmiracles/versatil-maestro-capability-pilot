# RAG Setup Guide

Complete guide to setting up and using VERSATIL's RAG (Retrieval-Augmented Generation) memory system.

---

## 📖 Table of Contents

1. [What is RAG?](#what-is-rag)
2. [Quick Start (3 Steps)](#quick-start)
3. [Supabase Setup Options](#supabase-setup-options)
4. [Edge Acceleration (Optional)](#edge-acceleration-optional)
5. [Seeding Patterns](#seeding-patterns)
6. [Verification](#verification)
7. [How RAG Learning Works](#how-rag-learning-works)
8. [Privacy & Data Isolation](#privacy--data-isolation)
9. [Troubleshooting](#troubleshooting)

---

## What is RAG?

**RAG (Retrieval-Augmented Generation)** is VERSATIL's memory system that enables agents to:
- 📚 **Remember** successful patterns from previous work
- 🔍 **Retrieve** relevant examples for similar tasks
- 🚀 **Accelerate** development by reusing proven solutions
- 📈 **Compound** knowledge (each task makes the next 40% faster)

### Triple Memory Architecture

VERSATIL uses three complementary memory systems:

1. **Claude Memory** (Built-in)
   - Conversational context and user preferences
   - Lifetime: Current conversation

2. **Memory Tool** (Agent-specific)
   - Recent patterns for each OPERA agent
   - Storage: `~/.versatil/memories/[agent-id]/`
   - Lifetime: Permanent (last 30 days actively used)

3. **VERSATIL RAG** (Vector database)
   - All historical patterns with semantic search
   - Storage: Supabase PostgreSQL + pgvector
   - Lifetime: Permanent

**Together**: <0.5% context loss + 40% faster development

---

## Quick Start

### Step 1: Setup Supabase (5-15 minutes)

```bash
ppnpm rag:setup
```

This interactive wizard will:
- ✅ Help you choose between Cloud or Local Supabase
- ✅ Run database migrations (create tables, indexes, functions)
- ✅ Save credentials to `~/.versatil/.env`
- ✅ Test connection

**Choose Option 1 (Cloud Supabase)** for easiest setup:
- Free tier available (500MB database, 2GB bandwidth)
- No Docker required
- Always accessible

### Step 2: Seed Default Patterns (2 minutes)

```bash
ppnpm rag:seed-defaults
```

Seeds **~100 universal best practices**:
- React Testing Library patterns
- WCAG 2.1 AA accessibility guidelines
- OWASP security standards
- Database RLS policies
- API response conventions
- Git commit conventions

### Step 3: Verify Setup (30 seconds)

```bash
ppnpm rag:test
```

Expected output:
```
✓ Connection successful
✓ Table exists with correct schema
✓ Found 100 patterns
✓ Patterns across 8 agents
✓ Embeddings are 1536 dimensions
✓ Semantic search working
✅ All Tests Passed
```

**That's it!** Your RAG is now functional.

---

## Supabase Setup Options

### Option 1: Cloud Supabase (Recommended)

**Pros**:
- ✅ Free tier (500MB database, 2GB bandwidth/month)
- ✅ No Docker required
- ✅ Automatic backups
- ✅ Managed infrastructure
- ✅ Always accessible

**Setup**:
1. Visit [supabase.com](https://supabase.com)
2. Create free account
3. Create new project (takes ~2 minutes)
4. Copy credentials:
   - Project URL: `https://YOUR_PROJECT.supabase.co`
   - Anon Key: `eyJhbG...` (public, safe to use)
   - Service Role Key: `eyJhbG...` (secret, keep private)
5. Run `ppnpm rag:setup` and paste credentials

**Cost**: Free tier is sufficient for most users

### Option 2: Local Supabase (Self-hosted)

**Pros**:
- ✅ Complete data control
- ✅ No external dependencies
- ✅ Unlimited storage/bandwidth
- ✅ Offline development

**Cons**:
- ❌ Requires Docker Desktop
- ❌ Manual backups
- ❌ ~500MB RAM usage

**Setup**:
1. Install Docker Desktop
2. Run `ppnpm rag:setup`
3. Choose "Local Supabase"
4. Wizard runs `npx supabase start` automatically
5. Credentials auto-saved to `~/.versatil/.env`

---

## Edge Acceleration (Optional)

**🚀 Speed up RAG queries by 2-4x using Google Cloud Run**

### What is Edge Acceleration?

Edge acceleration deploys GraphRAG query processing to Google Cloud Run for:
- ⚡ **2-4x Faster Queries**: 200ms → 50-100ms avg response time
- 🌍 **Global Edge Network**: 15+ regions worldwide
- 📈 **Auto-Scaling**: 0-10 instances based on load
- 💾 **Smart Caching**: 15min TTL with 85%+ hit rate
- 💰 **Cost-Effective**: ~$5-15/month for typical usage

### Public vs Private RAG

**🌍 Public RAG** (Framework Patterns):
- **Storage**: Firestore (`centering-vine-454613-b3/versatil-public-rag`)
- **Content**: Framework best practices, shared patterns
- **Access**: Free for all VERSATIL users
- **Use**: Accelerate learning from community patterns

**🔒 Private RAG** (Your Proprietary Code):
- **Storage**: Your Firestore/Supabase instance
- **Content**: YOUR company-specific implementations
- **Access**: 100% isolated, never shared
- **Use**: Internal pattern learning and reuse

### Quick Start (5 minutes)

#### Prerequisites

```bash
# Install Google Cloud SDK
brew install google-cloud-sdk  # macOS
# OR download from https://cloud.google.com/sdk/docs/install

# Install Docker
brew install docker  # macOS

# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable firestore.googleapis.com
```

#### Deploy to Cloud Run

```bash
# Navigate to function directory
cd cloud-functions/graphrag-query

# Deploy (uses default project from gcloud config)
./deploy.sh

# Expected output:
# 🚀 Deploying GraphRAG Query to Cloud Run...
# ✅ Deployment successful!
# 📍 Service URL: https://versatil-graphrag-query-xxxxx-uc.a.run.app
```

#### Test Edge Function

```bash
# Health check
curl https://YOUR_SERVICE_URL/health

# Public RAG query
curl -X POST https://YOUR_SERVICE_URL/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "authentication patterns",
    "isPublic": true,
    "limit": 5
  }'

# Private RAG query (requires your project)
curl -X POST https://YOUR_SERVICE_URL/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "payment processing",
    "isPublic": false,
    "projectId": "YOUR_PROJECT_ID",
    "databaseId": "YOUR_DATABASE_ID",
    "limit": 5
  }'
```

#### Configure VERSATIL

Update `.versatil/config.json`:

```json
{
  "rag": {
    "edge": {
      "enabled": true,
      "url": "https://YOUR_SERVICE_URL",
      "publicRAG": true,
      "privateRAG": {
        "enabled": true,
        "projectId": "YOUR_PROJECT_ID",
        "databaseId": "YOUR_DATABASE_ID"
      }
    }
  }
}
```

### Performance Comparison

| Metric | Local RAG | Cloud Run Edge | Improvement |
|--------|-----------|----------------|-------------|
| **Avg Response** | 200ms | 87ms | 2.3x faster |
| **P95 Latency** | 350ms | 120ms | 2.9x faster |
| **Throughput** | 100 req/s | 800 req/s | 8x more |
| **Cache Hit Rate** | 0% | 85%+ | 15min TTL |

### Cost Estimate

**Cloud Run Pricing** (after free tier):
- 2M requests/month: FREE
- 2M-10M requests: ~$0.40 per 1M requests

**Estimated Monthly Cost**:
- 10K users, 100K requests: **$5-10/month**
- 100K users, 1M requests: **$15-30/month**

### Complete Documentation

**Detailed Guide**: [Cloud Run Deployment Guide](../enterprise/cloud-run-deployment.md)

**Topics Covered**:
- Complete deployment instructions
- API reference (POST /query, GET /health, GET /stats)
- Performance tuning and optimization
- Monitoring and troubleshooting
- Security and authentication
- Cost management
- Multi-region deployment

---

## Seeding Patterns

### Default Patterns (Universal)

**Who**: All users (including new users)
**Content**: Generic best practices (React, security, testing, etc.)
**Count**: ~100 patterns
**Command**: `ppnpm rag:seed-defaults`

**When to run**:
- ✅ After fresh install (runs automatically in postinstall)
- ✅ After Supabase setup
- ✅ If RAG test shows 0 patterns

### Framework Patterns (VERSATIL-Specific)

**Who**: Framework developers only
**Content**: VERSATIL's actual implementation patterns
**Count**: ~500 patterns
**Command**: `ppnpm rag:seed-framework`

**What gets extracted**:
- OPERA agent implementations (`src/agents/opera/`)
- RAG infrastructure (`src/rag/`)
- Orchestration workflows (`src/orchestration/`)
- MCP integrations (`src/mcp/`)
- Testing strategies (`src/testing/`)

**When to run**:
- ✅ When developing VERSATIL framework
- ✅ After major agent updates
- ✅ To learn from your own code

---

## Verification

### Quick Check

```bash
ppnpm rag:test
```

Verifies:
1. ✅ Supabase connection working
2. ✅ `versatil_memories` table exists
3. ✅ Patterns stored (count > 0)
4. ✅ Agent distribution
5. ✅ Embedding dimensions (1536)
6. ✅ Semantic search function working

### Detailed Report

```bash
ppnpm rag:test --verbose
```

Shows sample patterns with:
- Agent domain
- Content type
- Metadata tags
- Pattern titles

### Agent-Specific Check

```bash
ppnpm rag:test --agent maria-qa
```

Shows patterns for specific agent only.

---

## How RAG Learning Works

### Automatic Learning Loop

```yaml
1. Agent_Activation:
   User: "Write tests for authentication"
   Maria-QA: Activated

2. Query_RAG:
   Maria queries RAG: "authentication test patterns"
   RAG returns: [5 similar test patterns from history]

3. Generate_with_Context:
   Maria sees historical patterns
   Maria generates new test matching project style
   Test passes with 90% coverage ✅

4. Store_Success:
   Pattern automatically stored to RAG
   Tagged: { agent: 'maria-qa', success: true, tags: ['test', 'auth'] }
   Embedded: 1536-dim vector for similarity search

5. Future_Tasks:
   Next authentication test is 40% faster
   Maria reuses proven pattern
   Consistency with existing code
```

### What Gets Stored?

**Successful patterns only**:
- ✅ Tests that pass with >80% coverage
- ✅ Components that meet WCAG 2.1 AA
- ✅ API endpoints passing security scan
- ✅ Code user didn't revert

**NOT stored**:
- ❌ Failed tests
- ❌ Code immediately reverted
- ❌ Low quality score
- ❌ One-off hacks (not reusable)

### Compounding Engineering

The **40% faster** promise comes from:

| Month | RAG Patterns | Speed Boost | Example Task Time |
|-------|--------------|-------------|-------------------|
| 1 (new) | 100 defaults | Baseline | 60 minutes |
| 2 | 250 (100 + 150 learned) | 40% faster | 36 minutes |
| 6 | 800 (100 + 700 learned) | 70% faster | 18 minutes |

**Each successful task makes future tasks faster.**

---

## Privacy & Data Isolation

### Where is Your RAG Data?

```
Your_RAG_Storage:
  Cloud_Supabase:
    - Your own Supabase project
    - You control access
    - You own the data
    - NOT shared with other users

  Local_Supabase:
    - Docker container on your machine
    - Localhost only (127.0.0.1)
    - No external access
    - Complete privacy
```

### What's in `~/.versatil/.env`?

```bash
# Supabase credentials (SECRET - never commit)
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=eyJhbG...     # Public key (safe)
SUPABASE_SERVICE_KEY=eyJhbG...  # Secret key (KEEP PRIVATE)

# RAG settings
RAG_ENABLED=true
RAG_AUTO_INDEX=true
RAG_EMBEDDING_MODEL=text-embedding-3-small
```

**Security**:
- ✅ `.env` is in `.gitignore` (never committed)
- ✅ Service key has full database access (keep secret)
- ✅ Anon key is safe to use in client code
- ✅ Row Level Security (RLS) policies protect data

### Isolation from User Projects

```yaml
Framework_Data:
  Location: "~/.versatil/"
  Contains:
    - .env (Supabase credentials)
    - memories/ (agent-specific patterns)
    - rag/ (local fallback storage)

User_Project:
  Location: "$(pwd)" (your project directory)
  Contains:
    - .versatil-project.json (ONLY this file)
    - NO framework data
    - NO credentials
    - Clean git repository
```

**Why**: Keeps your projects clean, framework updates don't touch your code.

---

## Troubleshooting

### Problem: "No .env file found"

**Solution**:
```bash
ppnpm rag:setup
```

Follow wizard to create `~/.versatil/.env` with credentials.

---

### Problem: "Placeholder credentials detected"

**Cause**: `.env` has `your-anon-key-here` (not real credentials)

**Solution**:
```bash
ppnpm rag:setup
```

Enter real Supabase credentials.

---

### Problem: "Connection failed"

**Possible Causes**:
1. Wrong credentials in `.env`
2. Supabase project paused (cloud)
3. Docker not running (local)

**Solutions**:

**Cloud Supabase**:
```bash
# Verify credentials
cat ~/.versatil/.env

# Check Supabase project status at supabase.com
# Unpause if needed (free tier auto-pauses after 1 week inactivity)

# Re-run setup
ppnpm rag:setup
```

**Local Supabase**:
```bash
# Check Docker running
docker ps

# Restart Supabase
npx supabase stop
npx supabase start

# Update credentials
ppnpm rag:setup
```

---

### Problem: "Table does not exist"

**Cause**: Migrations not run

**Solution**:
```bash
ppnpm rag:setup
```

Wizard will run migrations automatically.

---

### Problem: "Found 0 patterns"

**Cause**: RAG not seeded

**Solution**:
```bash
# Seed defaults (universal patterns)
ppnpm rag:seed-defaults

# Verify
ppnpm rag:test
```

---

### Problem: "Semantic search function missing"

**Cause**: `match_memories()` function not created

**Solution**:
```bash
# Re-run setup (will create function)
ppnpm rag:setup

# Verify
ppnpm rag:test
```

---

### Problem: "Agents not using RAG"

**Check**:
```bash
# Verify RAG enabled
grep RAG_ENABLED ~/.versatil/.env
# Should show: RAG_ENABLED=true

# Verify patterns exist
ppnpm rag:test
# Should show: Found 100+ patterns

# Check agent logs
tail -f ~/.versatil/logs/agents.log
# Should see: "RAG pre-activation query: 5 code patterns, 3 standards"
```

**Solution**:
```bash
# Enable RAG
echo "RAG_ENABLED=true" >> ~/.versatil/.env

# Restart framework
ppnpm build
```

---

### Problem: "RAG is slow"

**Cause**: Large vector search without index

**Solution**:
```sql
-- Connect to Supabase SQL editor
-- Verify ivfflat index exists:

SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'versatil_memories';

-- Should see: idx_memories_embedding (ivfflat)

-- If missing, create index:
CREATE INDEX idx_memories_embedding
ON versatil_memories
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

---

### Problem: "Out of storage" (Cloud Supabase free tier)

**Free tier limits**: 500MB database

**Check usage**:
```sql
SELECT pg_size_pretty(pg_database_size(current_database()));
```

**Solutions**:

1. **Delete old patterns** (older than 6 months):
```sql
DELETE FROM versatil_memories
WHERE created_at < NOW() - INTERVAL '6 months';
```

2. **Upgrade to Pro** ($25/month, 8GB database)

3. **Switch to Local Supabase** (unlimited storage)

---

### Problem: "Rate limiting" (too many API calls)

**Cause**: Querying RAG on every keystroke

**Solution**: Already handled by VERSATIL (queries only on agent activation)

**Verify**:
```bash
# Check query frequency
grep "RAG pre-activation query" ~/.versatil/logs/agents.log | wc -l

# Should be low (only on agent activation, not on every edit)
```

---

## Advanced Usage

### Custom Embedding Models

**Default**: `text-embedding-3-small` (OpenAI)

**Change**:
```bash
# Edit ~/.versatil/.env
RAG_EMBEDDING_MODEL=text-embedding-3-large  # More accurate, slower, 2x cost
# or
RAG_EMBEDDING_MODEL=hash  # Local hash-based (free, fast, less accurate)
```

**Restart**:
```bash
ppnpm build
```

---

### Export RAG Patterns

**Export to JSON**:
```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = require('dotenv').config({ path: '~/.versatil/.env' }).parsed;
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

supabase.from('versatil_memories')
  .select('*')
  .then(({ data }) => {
    fs.writeFileSync('rag-export.json', JSON.stringify(data, null, 2));
    console.log('Exported', data.length, 'patterns to rag-export.json');
  });
"
```

---

### Clear RAG (Start Fresh)

**⚠️ WARNING**: Deletes all learned patterns (keeps defaults if re-seeded)

```bash
# Option 1: Clear all patterns
node -e "
const { createClient } = require('@supabase/supabase-js');
const env = require('dotenv').config({ path: '~/.versatil/.env' }).parsed;
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

supabase.from('versatil_memories')
  .delete()
  .neq('id', '00000000-0000-0000-0000-000000000000')
  .then(() => console.log('RAG cleared'));
"

# Option 2: Re-seed defaults
ppnpm rag:seed-defaults
```

---

## Next Steps

**After RAG setup**:
1. ✅ Use VERSATIL normally (agents will use RAG automatically)
2. ✅ Monitor learning: `ppnpm context:stats`
3. ✅ Verify growth: `ppnpm rag:test` (pattern count increases over time)
4. ✅ Enjoy faster development (40% improvement target)

**For framework developers**:
```bash
# Seed VERSATIL-specific patterns
ppnpm rag:seed-framework

# Verify
ppnpm rag:test --verbose
```

---

## Support

**Issues**:
- GitHub: https://github.com/versatil-sdlc-framework/issues
- Docs: `.claude/AGENTS.md`, `CLAUDE.md`

**Logs**:
```bash
# Agent logs
tail -f ~/.versatil/logs/agents.log

# RAG query logs
tail -f ~/.versatil/logs/rag.log

# Framework logs
tail -f ~/.versatil/logs/framework.log
```

---

**Version**: v6.5.0
**Last Updated**: 2025-01-21
**Status**: Production-ready ✅
