@echo off
echo KNULLVOID Multigame Portal Deployment Script
echo ===========================================

echo Checking if Git is installed...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Git is not installed or not in PATH
    echo Please install Git from https://git-scm.com/ and try again
    pause
    exit /b 1
)

echo Checking if Git LFS is installed...
git lfs version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Git LFS...
    git lfs install
)

echo Adding all files to Git...
git add .

echo Committing files...
git commit -m "Deploy: Multigame portal with 150+ games"

echo.
echo Deployment Instructions:
echo ======================
echo 1. Create a new repository on GitHub at https://github.com/new
echo 2. Name it something like "multigame-portal"
echo 3. DO NOT initialize with README, .gitignore, or license
echo 4. Copy the repository URL
echo.
echo Then run these commands in your terminal:
echo git remote add origin YOUR_REPOSITORY_URL
echo git branch -M main
echo git lfs push --all origin main
echo git push -u origin main
echo.
echo After pushing, enable GitHub Pages in your repository settings
echo.
pause