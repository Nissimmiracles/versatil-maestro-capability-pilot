#!/bin/bash
#
# Hook Compilation Script
# Compiles TypeScript hooks to JavaScript for 5-10x performance improvement
#
# Usage: pnpm build:hooks
#

set -e

echo "🔨 Compiling VERSATIL hooks to JavaScript..."
echo ""

# Colors
GREEN='\033[0.32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create dist directory
HOOKS_SRC=".claude/hooks"
HOOKS_DIST=".claude/hooks/dist"

mkdir -p "$HOOKS_DIST"

echo -e "${BLUE}📁 Output directory: $HOOKS_DIST${NC}"
echo ""

# Compile TypeScript hooks to JavaScript
echo -e "${BLUE}🔄 Compiling hooks...${NC}"

# Clean dist directory
rm -rf "$HOOKS_DIST"
mkdir -p "$HOOKS_DIST"

# Compile all hooks at once with proper CommonJS output
npx tsc \
  --outDir "$HOOKS_DIST" \
  --target ES2020 \
  --module commonjs \
  --moduleResolution node \
  --esModuleInterop \
  --skipLibCheck \
  --resolveJsonModule \
  "$HOOKS_SRC"/*.ts

# Move hook files from nested directory structure
if [ -d "$HOOKS_DIST/.claude/hooks" ]; then
  # Move only hook .js files to dist root
  find "$HOOKS_DIST/.claude/hooks" -maxdepth 1 -name "*.js" -exec mv {} "$HOOKS_DIST/" \;
  # Keep dependency JS files in nested structure for imports
fi

echo ""
echo -e "${GREEN}✅ Hooks compiled successfully!${NC}"
echo ""

# Rename .js to .cjs (CommonJS) since package.json has "type": "module"
echo -e "${BLUE}🔄 Renaming to .cjs for CommonJS compatibility...${NC}"

for file in "$HOOKS_DIST"/*.js; do
  if [ -f "$file" ]; then
    cjs_file="${file%.js}.cjs"
    mv "$file" "$cjs_file"
  fi
done

# Replace shebangs in compiled files (TypeScript copies them from source)
echo -e "${BLUE}🔧 Fixing shebangs in compiled hooks...${NC}"

for file in "$HOOKS_DIST"/*.cjs; do
  if [ -f "$file" ]; then
    # Always remove first line and add correct Node.js shebang
    tail -n +2 "$file" > "$file.tmp"
    echo '#!/usr/bin/env node' | cat - "$file.tmp" > "$file"
    rm "$file.tmp"

    # Make executable
    chmod +x "$file"

    filename=$(basename "$file")
    echo -e "   ${GREEN}✓${NC} $filename (shebang fixed)"
  fi
done

echo ""
echo -e "${GREEN}✨ Compilation complete!${NC}"
echo ""
echo -e "${BLUE}📊 Hook files:${NC}"
ls -lh "$HOOKS_DIST"/*.js | awk '{print "   " $9 " (" $5 ")"}'
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo -e "   1. Update .claude/settings.json to reference .js files"
echo -e "   2. Test: echo '{\"toolName\":\"Edit\",\"filePath\":\"test.ts\"}' | $HOOKS_DIST/post-file-edit.js"
echo -e "   3. Commit both .ts (source) and .js (compiled) to git"
echo ""
