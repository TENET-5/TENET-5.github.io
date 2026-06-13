# Captures all output to a log file so we can see what happened.
$logPath = "E:\TENET-5.github.io\.local\fix_gemini_v2.log"
Start-Transcript -Path $logPath -Force | Out-Null

$ErrorActionPreference = 'Continue'

Write-Output "=== Cap#531-v2 elevated gemini fix ==="
Write-Output "  ran at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Output "  is admin: $(([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator))"

$path = "C:\ProgramData\NVIDIA Corporation\nvtopps\rise\plugins\gemini\plugin.py"
if (-not (Test-Path $path)) {
  Write-Output "ERROR: plugin.py not found at $path"
  Stop-Transcript | Out-Null
  exit 1
}

$content = Get-Content $path -Raw -Encoding UTF8
Write-Output "  file size: $($content.Length) bytes"
Write-Output "  contains Cap#531: $($content.Contains('Cap#531'))"

if ($content.Contains("Cap#531")) {
  Write-Output "Already patched, exiting."
  Stop-Transcript | Out-Null
  exit 0
}

# Simpler approach: insert hide block immediately before the first `import atexit` line
$marker = "import atexit"
if (-not $content.Contains($marker)) {
  Write-Output "ERROR: marker 'import atexit' not found in file"
  Stop-Transcript | Out-Null
  exit 1
}

$hideBlock = @"
# Cap#531 (2026-05-28): hide G-Assist plugin console window immediately on Python start.
# stdin/stdout pipes still flow via OS handles (disp.exe owns them).
# SW_HIDE = 0. Failure is silent (we'd rather see the popup than crash the plugin).
import ctypes as _ctypes_hide
try:
    _ctypes_hide.windll.user32.ShowWindow(_ctypes_hide.windll.kernel32.GetConsoleWindow(), 0)
except Exception:
    pass

"@

$newContent = $content.Replace($marker, $hideBlock + $marker)

if ($newContent -eq $content) {
  Write-Output "ERROR: Replace produced identical content"
  Stop-Transcript | Out-Null
  exit 1
}

Write-Output "  new size: $($newContent.Length) bytes"
Set-Content -Path $path -Value $newContent -Encoding UTF8 -NoNewline

$check = Get-Content $path -Raw -Encoding UTF8
if ($check.Contains("Cap#531")) {
  Write-Output "OK: gemini plugin.py patched"
} else {
  Write-Output "ERROR: written but Cap#531 not in re-read content"
  Stop-Transcript | Out-Null
  exit 1
}

# Kill running disp.exe so G-Assist respawns with new plugin code
$disp = Get-Process disp -ErrorAction SilentlyContinue
foreach ($d in $disp) {
  Write-Output "Killing disp.exe PID=$($d.Id)"
  Stop-Process -Id $d.Id -Force -ErrorAction SilentlyContinue
}

Write-Output "Done at $(Get-Date -Format 'HH:mm:ss')"
Stop-Transcript | Out-Null
