# Private RAG Setup Guide

**Complete guide to configuring Private RAG for VERSATIL Framework**

Version: 7.7.0
Estimated setup time: 5-10 minutes
Difficulty: Beginner

---

## Table of Contents

- [Overview](#overview)
- [Why Private RAG?](#why-private-rag)
- [Quick Start](#quick-start)
- [Storage Options](#storage-options)
- [Setup Methods](#setup-methods)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## Overview

VERSATIL provides two types of RAG storage:

### Public RAG (Default - FREE)
- **What**: Framework patterns accessible to ALL users
- **Content**: React, JWT, testing, generic best practices
- **Storage**: VERSATIL's Firestore (framework-managed)
- **Privacy**: NO user data, only public knowledge
- **Access**: Read-only for all VERSATIL users
- **Cost**: $0 (included with framework)

### Private RAG (Optional - Recommended for Proprietary Projects)
- **What**: YOUR project patterns, stored privately
- **Content**: Business logic, internal APIs, team conventions
- **Storage**: YOUR Firestore/Supabase/Local (you control)
- **Privacy**: 100% isolated, never shared
- **Access**: Only you/your team
- **Cost**: $0-25/month (most users stay on free tier)

---

## Why Private RAG?

###  Comparison

| Feature | Public RAG Only | Public + Private RAG |
|---------|----------------|---------------------|
| **Framework Patterns** | ✅ Yes | ✅ Yes |
| **Your Project Patterns** | ❌ No | ✅ Yes |
| **Business Logic Memory** | ❌ No | ✅ Yes |
| **Team Conventions** | ❌ No | ✅ Yes |
| **Compounding Engineering** | ⚠️ Limited | ✅ Full (40% faster by Feature 5) |
| **Privacy** | N/A | ✅ 100% isolated |
| **Cost** | $0 | $0-25/month |

### Use Private RAG If:

✅ Building proprietary SaaS/product
✅ Have internal APIs or microservices
✅ Want team conventions remembered
✅ Need compounding engineering for YOUR code
✅ Want 100% data privacy

### Skip Private RAG If:

✅ Building open-source project
✅ Using only public libraries (React, Next.js, etc.)
✅ Happy with generic framework patterns
✅ Not concerned about pattern privacy

---

## Quick Start

### Option 1: Interactive Wizard (Recommended)

```bash
ppnpm setup:private-rag
```

The wizard will:
1. Ask which storage backend you prefer
2. Guide you through credential setup
3. Test the configuration
4. Save to `~/.versatil/.env`

**Time**: 5 minutes

### Option 2: Manual Configuration

Add to `~/.versatil/.env`:

```bash
# Firestore
PRIVATE_RAG_ENABLED=true
PRIVATE_RAG_BACKEND=firestore
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json

# OR Supabase
PRIVATE_RAG_ENABLED=true
PRIVATE_RAG_BACKEND=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# OR Local JSON
PRIVATE_RAG_ENABLED=true
PRIVATE_RAG_BACKEND=local
PRIVATE_RAG_LOCAL_DIR=~/.versatil/private-rag
```

**Time**: 2 minutes

---

## Storage Options

### Option 1: Google Cloud Firestore (Recommended)

**Pros:**
- ✅ Free tier: 1GB = ~10,000 patterns
- ✅ Fast: <50ms queries
- ✅ Scalable: Handles millions of patterns
- ✅ Reliable: Google Cloud SLA (99.99% uptime)

**Cons:**
- ❌ Requires GCP account
- ❌ Slightly more setup than local

**Cost:**
- Free tier: 1GB, 50K reads/day, 20K writes/day
- After: $0.18/GB/month + $0.06/100K reads

**Setup Steps:**

1. **Create GCP Project**
   ```
   Go to: https://console.cloud.google.com
   Click: "Create Project"
   Name: "versatil-private-rag" (or your choice)
   ```

2. **Enable Firestore**
   ```
   Navigate to: Firestore
   Click: "Create Database"
   Mode: "Native mode"
   Location: Choose closest region
   ```

3. **Create Service Account**
   ```
   Navigate to: IAM & Admin → Service Accounts
   Click: "Create Service Account"
   Name: "versatil-rag-access"
   Role: "Cloud Datastore User"
   Click: "Create Key" → JSON
   Save to: ~/.versatil/gcp-key.json
   ```

4. **Run Wizard**
   ```bash
   ppnpm setup:private-rag
   # Choose: 1 (Firestore)
   # Project ID: your-project-id
   # Key path: ~/.versatil/gcp-key.json
   ```

**Time**: 10 minutes first-time, 2 minutes after

---

### Option 2: Supabase pgvector

**Pros:**
- ✅ Free tier: 500MB = ~5,000 patterns
- ✅ Very fast: <30ms queries
- ✅ Built-in vector search
- ✅ Easy web UI

**Cons:**
- ❌ Smaller free tier than Firestore
- ❌ More expensive after free tier ($25/month)

**Cost:**
- Free tier: 500MB database, 2GB bandwidth/month
- After: $25/month (Pro tier)

**Setup Steps:**

1. **Create Supabase Project**
   ```
   Go to: https://app.supabase.com
   Click: "New project"
   Name: "versatil-private-rag"
   Database password: (generate strong password)
   Region: Choose closest
   ```

2. **Get Credentials**
   ```
   Navigate to: Settings → API
   Copy:
   - Project URL: https://xxxxx.supabase.co
   - anon public key: eyJhbGc...
   ```

3. **Create Table** (SQL Editor)
   ```sql
   CREATE TABLE versatil_private_patterns (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     pattern TEXT NOT NULL,
     description TEXT,
     code TEXT,
     agent TEXT,
     category TEXT,
     privacy JSONB,
     properties JSONB,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Add RLS for privacy
   ALTER TABLE versatil_private_patterns ENABLE ROW LEVEL SECURITY;

   CREATE POLICY user_isolation ON versatil_private_patterns
     FOR ALL USING (privacy->>'userId' = auth.uid()::text);
   ```

4. **Run Wizard**
   ```bash
   ppnpm setup:private-rag
   # Choose: 2 (Supabase)
   # URL: https://xxxxx.supabase.co
   # Anon key: eyJhbGc...
   ```

**Time**: 8 minutes first-time, 2 minutes after

---

### Option 3: Local JSON (Offline)

**Pros:**
- ✅ Completely free (no cloud costs)
- ✅ 100% offline (no internet needed)
- ✅ Fastest queries (<10ms)
- ✅ Simplest setup (1 minute)

**Cons:**
- ❌ No cross-machine sync
- ❌ Manual backup required
- ❌ Limited to single machine

**Cost:** $0 (always free)

**Setup Steps:**

```bash
ppnpm setup:private-rag
# Choose: 3 (Local JSON)
# Directory: (press Enter for default)
```

Patterns stored in: `~/.versatil/private-rag/*.json`

**Time**: 1 minute

**Backup:**
```bash
# Backup patterns
cp -r ~/.versatil/private-rag ~/Dropbox/versatil-backup

# Restore patterns
cp -r ~/Dropbox/versatil-backup ~/.versatil/private-rag
```

---

## Setup Methods

### Method 1: Interactive Wizard (Recommended)

```bash
ppnpm setup:private-rag
```

**Features:**
- Step-by-step guidance
- Input validation
- Connection testing
- Automatic .env creation

**Output:**
```
🔐 VERSATIL Private RAG Setup Wizard
════════════════════════════════════

This wizard will help you configure Private RAG storage...

Step 1: Choose Storage Backend
Choose where to store your private patterns:

1. Google Firestore (recommended)
2. Supabase pgvector
3. Local JSON files (offline)

Choose (1/2/3): 1

🔥 Google Cloud Firestore Setup
════════════════════════════════════

Enter GCP Project ID: my-project
Enter path to service account key JSON: ~/.versatil/gcp-key.json
Database ID (press Enter for default): my-project-private-rag

✓ Firestore configuration captured
✓ Configuration saved
✓ Connection tested

✅ Setup Complete!
```

### Method 2: npm Script

Add to `package.json` scripts:
```json
{
  "scripts": {
    "setup:private-rag": "node scripts/setup-private-rag.cjs"
  }
}
```

### Method 3: Manual .env

Edit `~/.versatil/.env` directly (see [Quick Start](#quick-start))

---

## Usage Examples

### Store Private Pattern

```bash
# After implementing a feature
/learn "Implemented our internal OAuth 2.0 flow"
```

VERSATIL asks:
```
Where should we store this pattern?

1. Public RAG only (share with community)
2. Private RAG only (keep proprietary) ← Recommended
3. Both (smart split)

Your choice: 2
```

Pattern stored privately → Only YOU can access it!

### Query Patterns

```bash
/plan "Add Facebook authentication"
```

VERSATIL returns:
```
🔍 RAG Router query: "Add Facebook authentication"
   🔒 Private RAG: 1 result  ← YOUR internal OAuth flow!
   🌐 Public RAG: 3 results  ← Generic OAuth patterns

📊 Results (4 total):
1. 🔒 Our Google OAuth implementation (private, 95% similar)
2. 🌐 OAuth 2.0 generic flow (public, 88% similar)
3. 🌐 JWT token handling (public, 82% similar)
4. 🌐 Social login patterns (public, 78% similar)

💡 Private pattern prioritized! Using YOUR implementation as base.
```

### Check Stats

```bash
/rag stats
```

Output:
```
📊 RAG Statistics

Public RAG (Framework):
- Patterns: 1,247
- Last synced: 2 hours ago
- Storage: Firestore (framework account)

Private RAG (Your Project):
- Backend: firestore
- Patterns: 89
- Storage: 45MB / 1GB (4.5% used)
- Queries today: 12
- Compounding rate: Feature 5 was 38% faster than Feature 1 ✨
```

---

## Troubleshooting

### Private RAG not working

**Symptoms:**
- `/plan` shows only public patterns
- No private patterns stored

**Solutions:**

1. **Check configuration**
   ```bash
   cat ~/.versatil/.env | grep PRIVATE_RAG
   ```

   Should show:
   ```
   PRIVATE_RAG_ENABLED=true
   PRIVATE_RAG_BACKEND=firestore (or supabase/local)
   ```

2. **Test connection**
   ```bash
   ppnpm rag:test
   ```

3. **Re-run wizard**
   ```bash
   ppnpm setup:private-rag
   ```

### Firestore permission denied

**Error:**
```
Error: 7 PERMISSION_DENIED: Missing or insufficient permissions
```

**Solution:**
1. Check service account has "Cloud Datastore User" role
2. Verify key file path is correct
3. Ensure Firestore API is enabled in GCP project

### Supabase connection failed

**Error:**
```
Error: Invalid Supabase credentials
```

**Solution:**
1. Verify URL format: `https://xxxxx.supabase.co` (no trailing slash)
2. Check anon key starts with `eyJ`
3. Ensure project is fully provisioned (green status in dashboard)

### Local storage permission denied

**Error:**
```
Error: EACCES: permission denied
```

**Solution:**
```bash
# Fix permissions
chmod 755 ~/.versatil
chmod 755 ~/.versatil/private-rag

# Or choose different directory
ppnpm setup:private-rag
# Choose: 3 (Local)
# Custom directory: ~/Documents/versatil-rag
```

---

## FAQ

### Q: Can I use both Private and Public RAG?
**A:** Yes! That's the recommended setup. Private patterns take priority, public patterns are fallback.

### Q: How much does Private RAG cost?
**A:**
- Firestore free tier: 1GB = ~10,000 patterns (most users stay free)
- Supabase free tier: 500MB = ~5,000 patterns
- Local: $0 always

### Q: Can I migrate from Local to Firestore later?
**A:** Yes! Use:
```bash
ppnpm rag:migrate --from=local --to=firestore
```

### Q: Is my data secure?
**A:** Yes!
- Firestore: Your GCP project, Row Level Security (RLS)
- Supabase: Your project, RLS policies
- Local: Never leaves your machine

### Q: Can I share patterns with my team?
**A:** Yes! Configure teamId in patterns:
```javascript
{
  privacy: {
    teamId: 'acme-corp',
    isPublic: false
  }
}
```

All team members with same teamId can access.

### Q: What if I don't configure Private RAG?
**A:** Framework works fine! You'll only have Public RAG (framework patterns). No proprietary patterns stored.

### Q: Can I delete all private patterns?
**A:** Yes:
```bash
# Firestore: Delete database in GCP console
# Supabase: DROP TABLE versatil_private_patterns
# Local: rm -rf ~/.versatil/private-rag
```

---

## Next Steps

**After setup:**

1. **Store your first pattern**
   ```bash
   /learn "Completed authentication feature"
   ```

2. **Query patterns**
   ```bash
   /plan "Add payment integration"
   ```

3. **Check compounding**
   ```bash
   /rag stats
   # Look for: "Compounding rate: Feature 5 was 38% faster"
   ```

4. **Optimize storage** (advanced)
   ```bash
   ppnpm rag:optimize
   ```

---

**Questions?** See main documentation: [VERSATIL Framework](../../README.md)

**Support:** https://github.com/Nissimmiracles/versatil-sdlc-framework/issues
