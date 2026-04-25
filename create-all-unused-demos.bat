@echo off
REM Create demo projects for Java, Python, C, and JS with unused dead code

echo 🚀 Creating demo projects with unused dead code...
echo.

REM Create Java demo
echo ☕ Creating Java demo...
node create-java-demo.js
echo.

REM Create Python demo
echo 🐍 Creating Python demo...
node create-python-demo.js
echo.

REM Create C demo
echo ⚫ Creating C demo...
node create-c-demo.js
echo.

REM Create JS demo
echo 🟨 Creating JavaScript demo...
node create-js-demo.js
echo.

echo ✅ All demo projects created!
echo.
echo Test them:
echo   node cli.js scan ./demo-unused-java --verbose
echo   node cli.js scan ./demo-unused-python --verbose
echo   node cli.js scan ./demo-unused-c --verbose
echo   node cli.js scan ./demo-unused-js --verbose
