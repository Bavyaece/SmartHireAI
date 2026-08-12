@echo off
echo ============================================
echo  SmartHire AI - Deploy to GitHub Pages
echo ============================================
echo.

cd /d "%~dp0"

echo Checking git status...
git status
echo.

echo Pushing to https://github.com/Bavyaece/SmartHireAI ...
echo.
echo NOTE: You must be logged in as the Bavyaece GitHub account.
echo If push fails, run: git remote set-url origin https://github.com/Bavyaece/SmartHireAI.git
echo Then sign in with your Bavyaece credentials or Personal Access Token.
echo.

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo  SUCCESS! Next steps:
    echo ============================================
    echo.
    echo 1. Go to: https://github.com/Bavyaece/SmartHireAI/settings/pages
    echo 2. Under "Build and deployment", set Source to "GitHub Actions"
    echo 3. Wait 1-2 minutes for the workflow to finish
    echo 4. Your site will be live at:
    echo    https://bavyaece.github.io/SmartHireAI/
    echo.
) else (
    echo.
    echo Push failed. Make sure you have write access to Bavyaece/SmartHireAI.
    echo.
)

pause
