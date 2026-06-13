$ErrorActionPreference = 'Stop'

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Error "Must run as Administrator."
  exit 1
}

$path = "C:\ProgramData\NVIDIA Corporation\nvtopps\rise\plugins\gemini\plugin.py"
$content = Get-Content $path -Raw -Encoding UTF8

if ($content.Contains("Cap#531")) {
  Write-Output "Already patched."
  exit 0
}

# Find the closing docstring (second occurrence of triple-quote line)
$lines = $content -split "`r?`n"
$endDocstringLine = -1
$tripleQuoteCount = 0
for ($i = 0; $i -lt $lines.Count; $i++) {
  if ($lines[$i].Trim() -eq '"""') {
    $tripleQuoteCount++
    if ($tripleQuoteCount -eq 2) {
      $endDocstringLine = $i
      break
    }
  }
}

if ($endDocstringLine -lt 0) {
  Write-Error "Could not find closing docstring."
  exit 1
}

Write-Output "Closing docstring at line $($endDocstringLine + 1)"

$hideBlock = @(
  ''
  '# Cap#531 (2026-05-28): hide G-Assist plugin console window.'
  '# stdin/stdout pipes still flow via OS handles (disp.exe owns them).'
  '# SW_HIDE=0.'
  'import ctypes as _ctypes_hide'
  'try:'
  '    _ctypes_hide.windll.user32.ShowWindow(_ctypes_hide.windll.kernel32.GetConsoleWindow(), 0)'
  'except Exception:'
  '    pass'
  ''
)

# Insert hide block right after the closing docstring line
$newLines = @()
$newLines += $lines[0..$endDocstringLine]
$newLines += $hideBlock
$newLines += $lines[($endDocstringLine + 1)..($lines.Count - 1)]

$newContent = $newLines -join "`r`n"

# Overwrite (backup already exists from prior run)
Set-Content -Path $path -Value $newContent -Encoding UTF8 -NoNewline

# Verify
$check = Get-Content $path -Raw -Encoding UTF8
if ($check.Contains("Cap#531") -and $check.Contains("ShowWindow")) {
  Write-Output "PATCHED OK"
} else {
  Write-Output "PATCH FAILED — Cap#531 not found in file after write"
  exit 1
}

# Kill running disp.exe so it respawns
Get-Process disp -ErrorAction SilentlyContinue | ForEach-Object {
  Write-Output "Killing disp.exe PID=$($_.Id)"
  Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}
Write-Output "Done. Trigger Alt+G or next game event to respawn plugins hidden."
