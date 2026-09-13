@echo off
title ThinkDecor Dev Server
cd /d "%~dp0"
echo Starting ThinkDecor dev server at http://localhost:8080 ...
call npm run dev
pause
