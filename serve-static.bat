@echo off
setlocal
cd /d "%~dp0"
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

set "DIST=%ROOT%\dist"
if not exist "%DIST%\index.html" (
  if exist "%DIST%\client\index.html" set "DIST=%DIST%\client"
)
if not exist "%DIST%\index.html" if exist "%DIST%\_shell.html" (
  echo Using shell HTML.
) else if not exist "%DIST%\index.html" (
  echo Static build not found.
  echo Run "npm run build" once (needs Node), then use this file.
  pause
  exit /b 1
)

set "PORT=8080"
echo Serving %DIST% on http://127.0.0.1:%PORT%/
echo Do not close this window.
echo.
start "" "http://127.0.0.1:%PORT%/"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$root = '%DIST%';" ^
  "$port = %PORT%;" ^
  "$listener = New-Object System.Net.HttpListener;" ^
  "$listener.Prefixes.Add('http://127.0.0.1:' + $port + '/');" ^
  "$listener.Start();" ^
  "Write-Host 'Static server ready';" ^
  "while ($listener.IsListening) {" ^
  "  $ctx = $listener.GetContext();" ^
  "  $path = $ctx.Request.Url.LocalPath;" ^
  "  if ($path -eq '/') { $path = '/index.html' };" ^
  "  $file = Join-Path $root ($path.TrimStart('/').Replace('/', '\'));" ^
  "  if (-not (Test-Path $file) -and (Test-Path (Join-Path $root '_shell.html'))) { $file = Join-Path $root '_shell.html' };" ^
  "  if (Test-Path $file -PathType Leaf) {" ^
  "    $bytes = [IO.File]::ReadAllBytes($file);" ^
  "    $ext = [IO.Path]::GetExtension($file).ToLower();" ^
  "    $ct = switch ($ext) { '.html' {'text/html'} '.js' {'text/javascript'} '.css' {'text/css'} '.svg' {'image/svg+xml'} '.json' {'application/json'} '.png' {'image/png'} default {'application/octet-stream'} };" ^
  "    $ctx.Response.ContentType = $ct;" ^
  "    $ctx.Response.ContentLength64 = $bytes.Length;" ^
  "    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length);" ^
  "  } else { $ctx.Response.StatusCode = 404; };" ^
  "  $ctx.Response.Close();" ^
  "}"
