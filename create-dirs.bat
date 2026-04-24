@echo off
REM Create directory structure for the project

mkdir src\parser 2>nul
mkdir src\graph 2>nul
mkdir src\analyzer 2>nul
mkdir src\detector 2>nul
mkdir src\reporter 2>nul
mkdir src\cleaner 2>nul
mkdir src\utils 2>nul
mkdir src\cli 2>nul
mkdir src\api 2>nul
mkdir src\api\routes 2>nul
mkdir example\sample-project 2>nul
mkdir web\src\components 2>nul
mkdir web\src\pages 2>nul
mkdir web\public 2>nul
mkdir docs 2>nul

echo Directories created successfully
