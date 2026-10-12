@echo off
cd /d "%~dp0"
where node >nul 2>&1
if not errorlevel 1 goto :run
if exist "%~dp0.node\node.exe" set "PATH=%~dp0.node;%PATH%"
if exist "%LocalAppData%\Programs\nodejs\node.exe" set "PATH=%LocalAppData%\Programs\nodejs;%PATH%"
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
:run
call npm run dev >> "%~dp0vdj-inspector.log" 2>&1
