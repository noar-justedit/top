@echo off
rem TOP! - publish this folder to GitHub (Windows).
rem Double-click this file inside the unzipped release folder.
rem The work is done by push_github.ps1 (PowerShell, built into Windows):
rem a .bat alone cannot read JSON, compare versions or query GitHub reliably.
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0push_github.ps1"
echo.
pause
