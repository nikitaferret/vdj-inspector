@echo off
setlocal EnableExtensions
cd /d "%~dp0"
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\\" set "ROOT=%ROOT:~0,-1%"
set "URL=http://127.0.0.1:8080/"
set "LOG=%ROOT%\vdj-inspector.log"
title VDJ Inspector

echo VDJ Inspector
echo.
echo Checking components...
call :log Checking components.

call :ensure_node
where node >nul 2>&1
if not errorlevel 1 (
  node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 22 ? 0 : 1)" >nul 2>&1
  if not errorlevel 1 (
    echo Node.js: ok
    call :log Node.js: ok
    exit /b 0
  )
)
if exist "%ROOT%\.node\node.exe" (
  set "PATH=%ROOT%\.node;%PATH%"
  echo Node.js: portable copy found
  call :log Node.js: portable copy found
  exit /b 0
)
echo Node.js: missing. Downloading...
call :download_node
if errorlevel 1 exit /b 1
set "PATH=%ROOT%\.node;%PATH%"
"%ROOT%\.node\node.exe" --version >nul 2>&1
if errorlevel 1 (
  call :log Portable Node.js failed its version check.
  exit /b 1
)
exit /b 0
:download_node
set "NODEVER=v22.22.0"
set "NODEARCH=win-x64"
if /I "%PROCESSOR_ARCHITECTURE%"=="ARM64" set "NODEARCH=win-arm64"
set "NODEURL=https://nodejs.org/dist/%NODEVER%/node-%NODEVER%-%NODEARCH%.zip"
call :log Downloading Node.js %NODEVER% for %NODEARCH%.
if exist "%ROOT%\.node-unpack" rmdir /s /q "%ROOT%\.node-unpack"
mkdir "%ROOT%\.node-unpack"
curl.exe -L --fail --retry 3 -o "%ROOT%\node.zip" "%NODEURL%"
if errorlevel 1 (
  call :log Download failed: %NODEURL%
  exit /b 1
)
tar -xf "%ROOT%\node.zip" -C "%ROOT%\.node-unpack"
if errorlevel 1 (
  call :log Could not unpack Node.js
  exit /b 1
)
if exist "%ROOT%\.node" rmdir /s /q "%ROOT%\.node"
for /d %%D in ("%ROOT%\.node-unpack\node-*") do move "%%D" "%ROOT%\.node" >nul
del /q "%ROOT%\node.zip" 2>nul
rmdir /s /q "%ROOT%\.node-unpack" 2>nul
if not exist "%ROOT%\.node\node.exe" (
  call :log Node.js archive had no node.exe
  exit /b 1
)
echo Node.js: ready
call :log Node.js is ready.
exit /b 0
