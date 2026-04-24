@echo off
REM Remove TypeScript source files - keep only JavaScript versions
REM Examples are kept for reference

echo 🗑️  Removing TypeScript source files...
echo.

REM Remove .ts source files (not examples)
del /F /Q analyzer.ts 2>nul && echo ✓ Removed analyzer.ts
del /F /Q astUtils.ts 2>nul && echo ✓ Removed astUtils.ts
del /F /Q cli.ts 2>nul && echo ✓ Removed cli.ts
del /F /Q cleaner.ts 2>nul && echo ✓ Removed cleaner.ts
del /F /Q detector.ts 2>nul && echo ✓ Removed detector.ts
del /F /Q engine.ts 2>nul && echo ✓ Removed engine.ts
del /F /Q fileUtils.ts 2>nul && echo ✓ Removed fileUtils.ts
del /F /Q graphBuilder.ts 2>nul && echo ✓ Removed graphBuilder.ts
del /F /Q index.ts 2>nul && echo ✓ Removed index.ts
del /F /Q parser.ts 2>nul && echo ✓ Removed parser.ts
del /F /Q reporter.ts 2>nul && echo ✓ Removed reporter.ts
del /F /Q server.ts 2>nul && echo ✓ Removed server.ts
del /F /Q types.ts 2>nul && echo ✓ Removed types.ts

REM Remove TypeScript config
del /F /Q tsconfig.json 2>nul && echo ✓ Removed tsconfig.json

REM Remove old build files
del /F /Q setup.js 2>nul && echo ✓ Removed setup.js
del /F /Q build-setup.js 2>nul && echo ✓ Removed build-setup.js
del /F /Q BUILD_COMPLETE.ts 2>nul && echo ✓ Removed BUILD_COMPLETE.ts

echo.
echo ✅ Cleanup complete!
echo.
echo Remaining files:
echo   • JavaScript modules (.js) - Ready to use
echo   • Documentation (.md) - Read for details
echo   • Configuration (package.json) - npm config
echo   • Examples (example-*.ts) - Reference files
echo.
echo 🚀 Ready to start:
echo    npm install
echo    node cli.js scan ./src
echo.
