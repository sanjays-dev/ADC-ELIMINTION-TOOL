#!/bin/bash
# Remove TypeScript source files - keep only JavaScript versions

echo "🗑️  Removing TypeScript source files..."
echo ""

# Remove .ts source files (not examples)
rm -f analyzer.ts && echo "✓ Removed analyzer.ts"
rm -f astUtils.ts && echo "✓ Removed astUtils.ts"
rm -f cli.ts && echo "✓ Removed cli.ts"
rm -f cleaner.ts && echo "✓ Removed cleaner.ts"
rm -f detector.ts && echo "✓ Removed detector.ts"
rm -f engine.ts && echo "✓ Removed engine.ts"
rm -f fileUtils.ts && echo "✓ Removed fileUtils.ts"
rm -f graphBuilder.ts && echo "✓ Removed graphBuilder.ts"
rm -f index.ts && echo "✓ Removed index.ts"
rm -f parser.ts && echo "✓ Removed parser.ts"
rm -f reporter.ts && echo "✓ Removed reporter.ts"
rm -f server.ts && echo "✓ Removed server.ts"
rm -f types.ts && echo "✓ Removed types.ts"

# Remove TypeScript config
rm -f tsconfig.json && echo "✓ Removed tsconfig.json"

# Remove old build files
rm -f setup.js && echo "✓ Removed setup.js"
rm -f build-setup.js && echo "✓ Removed build-setup.js"
rm -f BUILD_COMPLETE.ts && echo "✓ Removed BUILD_COMPLETE.ts"

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Remaining files:"
echo "  • JavaScript modules (.js) - Ready to use"
echo "  • Documentation (.md) - Read for details"
echo "  • Configuration (package.json) - npm config"
echo "  • Examples (example-*.ts) - Reference files"
echo ""
echo "🚀 Ready to start:"
echo "   npm install"
echo "   node cli.js scan ./src"
echo ""
