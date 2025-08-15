@echo off
setlocal enabledelayedexpansion

REM Adiss Verify Dashboard Google Cloud Deployment Script for Windows

REM Configuration
set PROJECT_ID=%PROJECT_ID%
if "%PROJECT_ID%"=="" set PROJECT_ID=your-project-id
set REGION=%REGION%
if "%REGION%"=="" set REGION=us-central1
set SERVICE_NAME=%SERVICE_NAME%
if "%SERVICE_NAME%"=="" set SERVICE_NAME=adiss-verify-dashboard
set IMAGE_NAME=gcr.io/%PROJECT_ID%/%SERVICE_NAME%

echo 🚀 Starting Adiss Verify Dashboard deployment to Google Cloud...

REM Check if gcloud is installed
where gcloud >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ gcloud CLI is not installed. Please install it first.
    exit /b 1
)

REM Check if docker is installed
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install it first.
    exit /b 1
)

REM Set the project
echo 📋 Setting project to: %PROJECT_ID%
gcloud config set project %PROJECT_ID%

REM Enable required APIs
echo 🔧 Enabling required APIs...
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

REM Build the Docker image
echo 🏗️ Building Docker image...
docker build -t %IMAGE_NAME% .

REM Push the image to Google Container Registry
echo 📤 Pushing image to Container Registry...
docker push %IMAGE_NAME%

REM Deploy to Cloud Run
echo 🚀 Deploying to Cloud Run...
gcloud run deploy %SERVICE_NAME% ^
    --image %IMAGE_NAME% ^
    --region %REGION% ^
    --platform managed ^
    --allow-unauthenticated ^
    --port 8080 ^
    --memory 1Gi ^
    --cpu 1 ^
    --max-instances 10 ^
    --min-instances 0 ^
    --timeout 300 ^
    --concurrency 80

REM Get the service URL
for /f "tokens=*" %%i in ('gcloud run services describe %SERVICE_NAME% --region=%REGION% --format="value(status.url)"') do set SERVICE_URL=%%i

echo ✅ Deployment completed successfully!
echo 🌐 Service URL: %SERVICE_URL%
echo 📊 Monitor your service at: https://console.cloud.google.com/run/detail/%REGION%/%SERVICE_NAME%

pause
