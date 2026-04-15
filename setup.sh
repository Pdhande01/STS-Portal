#!/bin/bash

echo "🚀 Smart Tech Service Portal - Quick Setup"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "📦 Installing React..."
npm install react@18.3.1 react-dom@18.3.1

if [ $? -ne 0 ]; then
    echo "❌ Failed to install React"
    exit 1
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "🎉 You're ready to go!"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:5173 in your browser"
echo ""
