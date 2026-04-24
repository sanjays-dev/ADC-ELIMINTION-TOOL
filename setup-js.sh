#!/bin/bash
# Setup script for JavaScript version

echo "🚀 Setting up ADC Tool (JavaScript Version)..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install it from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

echo "✓ Dependencies installed"
echo ""

# Make CLI executable
chmod +x cli.js 2>/dev/null
chmod +x server.js 2>/dev/null
echo "✓ CLI script is executable"
echo ""

echo "✅ Setup complete!"
echo ""
echo "🎯 Quick start:"
echo "   node cli.js scan ./src"
echo "   node cli.js report ./src"
echo "   node cli.js clean ./src"
echo ""
echo "🌐 Start API server:"
echo "   node server.js"
echo ""
