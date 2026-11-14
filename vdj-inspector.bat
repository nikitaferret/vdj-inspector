@echo off
setlocal EnableExtensions
cd /d "%~dp0"
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
set "URL=http://127.0.0.1:8080/"
set "LOG=%ROOT%\vdj-inspector.log"
title VDJ Inspector

echo VDJ Inspector
echo.
echo Checking components...
call :log Checking components.

call :ensure_node
if errorlevel 1 goto :fail

echo Node.js: ready
call :log Node.js: ready

if not exist "%ROOT%\node_modules\vite\bin\vite.js" (
  echo Installing program components. This may take several minutes...
  call :log Vite is missing. Running npm install.
  call npm install --no-audit --no-fund >> "%LOG%" 2>&1
  if errorlevel 1 (
    call :log npm install failed. See npm output above.
    goto :fail
  )
)

if not exist "%ROOT%\node_modules\vite\bin\vite.js" (
  call :log Vite is still missing after npm install.
  echo Vite did not install. Check vdj-inspector.log.
  goto :fail
)

echo Program files: ready
call :log Program files: ready

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
"%NODE_EXE%" -e "fetch('http://127.0.0.1:8080/').then(function(){process.exit(0)}).catch(function(){process.exit(1)})" >nul 2>&1
exit /b

:log
echo %*>> "%LOG%"
exit /b 0

:ensure_node
set "NODE_EXE="
if exist "%ROOT%\.node\node.exe" (
  set "NODE_EXE=%ROOT%\.node\node.exe"
  goto :check_node
)
for /f "delims=" %%N in ('where node 2^>nul') do if not defined NODE_EXE set "NODE_EXE=%%N"
if not defined NODE_EXE goto :download_node
"%NODE_EXE%" -e "process.exit(Number(process.versions.node.split('.')[0]) >= 22 ? 0 : 1)" >nul 2>&1
if errorlevel 1 goto :download_node
exit /b 0

:download_node
set "NODEVER=v22.22.0"
set "NODEARCH=win-x64"
if /I "%PROCESSOR_ARCHITECTURE%"=="ARM64" set "NODEARCH=win-arm64"
set "NODEURL=https://nodejs.org/dist/%NODEVER%/node-%NODEVER%-%NODEARCH%.zip"
call :log Downloading Node.js %NODEVER% for %NODEARCH%.
if exist "%ROOT%\.node-unpack" rmdir /s /q "%ROOT%\.node-unpack"
mkdir "%ROOT%\.node-unpack"
curl.exe -L --fail --retry 3 -o "%ROOT%\node.zip" "%NODEURL%" >> "%LOG%" 2>&1
if errorlevel 1 (
  call :log Node.js download failed.
  exit /b 1
)
tar -xf "%ROOT%\node.zip" -C "%ROOT%\.node-unpack" >> "%LOG%" 2>&1
if errorlevel 1 (
  call :log Could not unpack Node.js.
  exit /b 1
)
if exist "%ROOT%\.node" rmdir /s /q "%ROOT%\.node"
for /d %%D in ("%ROOT%\.node-unpack\node-*") do move "%%D" "%ROOT%\.node" >nul
del /q "%ROOT%\node.zip" 2>nul
rmdir /s /q "%ROOT%\.node-unpack" 2>nul
if not exist "%ROOT%\.node\node.exe" (
  call :log Node.js archive had no node.exe.
  exit /b 1
)
set "NODE_EXE=%ROOT%\.node\node.exe"
exit /b 0

:check_node
"%NODE_EXE%" --version >nul 2>&1
if errorlevel 1 (
  call :log Portable Node.js failed its version check.
  set "NODE_EXE="
  goto :download_node
)
exit /b 0
