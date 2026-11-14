@echo off
setlocal EnableExtensions
cd /d "%~dp0"
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
set "NODE="

if exist "%ROOT%\.node\node.exe" set "NODE=%ROOT%\.node\node.exe"
if not defined NODE for /f "delims=" %%N in ('where node 2^>nul') do if not defined NODE set "NODE=%%N"

if not defined NODE (
  echo Node.js executable was not found.>> "%ROOT%\vdj-inspector.log"
  exit /b 1
)

if not exist "%ROOT%\node_modules\vite\bin\vite.js" (
  echo Vite executable was not found after dependency installation.>> "%ROOT%\vdj-inspector.log"
  exit /b 1
)

"%NODE%" "%ROOT%\node_modules\vite\bin\vite.js" dev --host 127.0.0.1 --port 8080 --strictPort >> "%ROOT%\vdj-inspector.log" 2>&1
