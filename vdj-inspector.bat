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
if errorlevel 1 goto :fail

where npm >nul 2>&1
if errorlevel 1 (
  call :log npm was not found. Node.js installation may be incomplete.
  echo npm was not found. Please send vdj-inspector.log.
  goto :fail
)

if not exist "%ROOT%\node_modules\vite\bin\vite.js" (
  echo Installing program components. This may take a few minutes...
  call :log Vite is missing. Running npm install.
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    call :log npm install failed with errorlevel %ERRORLEVEL%.
    goto :fail
  )
)

if not exist "%ROOT%\node_modules\vite\bin\vite.js" (
  call :log Vite is still missing after npm install.
  echo Vite did not install. Check internet access and send vdj-inspector.log.
  goto :fail
)

echo Program files: ready
call :log Program files: ready.

call :up
if not errorlevel 1 (
  echo Already running. Opening the browser.
  goto :open
)

echo Starting VDJ Inspector...
call :log Starting VDJ Inspector.
start "VDJ Inspector" /min "%ROOT%\vdj-inspector-serve.bat"
for /L %%i in (1,1,120) do (
  call :up
  if not errorlevel 1 goto :open
  ping -n 2 127.0.0.1 >nul
)

call :log The page did not open. See the lines above in this log.
goto :fail

:open
start "" "%URL%"
echo.
echo VDJ Inspector is open in the browser.
echo Do not close the minimized VDJ Inspector window while you use it.
echo.
pause
exit /b 0

:fail
echo.
echo VDJ Inspector did not start. Details are in vdj-inspector.log
echo.
pause
exit /b 1

:up
node -e "fetch('http://127.0.0.1:8080/').then(function(){process.exit(0)}).catch(function(){process.exit(1)})" >nul 2>&1
exit /b

:log
echo %*>> "%LOG%"
exit /b 0

:ensure_node
where node >nul 2>&1
if not errorlevel 1 (
  for /f "delims=." %%A in ('node -p "process.versions.node" 2^>nul') do set "NODEMAJOR=%%A"
  if defined NODEMAJOR if %NODEMAJOR% GEQ 22 (
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
