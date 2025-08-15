@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting Adiss Verify Dashboard deployment to Vercel...

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install it first.
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install it first.
    pause
    exit /b 1
)

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Vercel CLI. Please install it manually: npm install -g vercel
        pause
        exit /b 1
    )
)

echo 🔧 Checking if user is logged in to Vercel...
vercel whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo 🔐 Please log in to Vercel...
    vercel login
    if %errorlevel% neq 0 (
        echo ❌ Failed to log in to Vercel.
        pause
        exit /b 1
    )
)

echo 🏗️ Building the application...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed. Please check the errors above.
    pause
    exit /b 1
)

echo 🚀 Deploying to Vercel...
vercel --prod

if %errorlevel% equ 0 (
    echo ✅ Deployment completed successfully!
    echo 🌐 Your application is now live on Vercel!
    echo 📊 Check your Vercel dashboard for the deployment URL.
) else (
    echo ❌ Deployment failed. Please check the errors above.
)

pause
