#!/bin/bash

# Adiss Verify Dashboard Vercel Deployment Script

set -e

echo "🚀 Starting Adiss Verify Dashboard deployment to Vercel..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install it first."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Vercel CLI. Please install it manually: npm install -g vercel"
        exit 1
    fi
fi

echo "🔧 Checking if user is logged in to Vercel..."
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel..."
    vercel login
    if [ $? -ne 0 ]; then
        echo "❌ Failed to log in to Vercel."
        exit 1
    fi
fi

echo "🏗️ Building the application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment completed successfully!"
    echo "🌐 Your application is now live on Vercel!"
    echo "📊 Check your Vercel dashboard for the deployment URL."
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi
