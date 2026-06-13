# Cap#531: Silence NVIDIA G-Assist plugin console popups.
#
# WHY:  G-Assist's disp.exe spawns Python workers (gemini, tenet5) with
#       visible consoles. We inject a 4-line ShowWindow(SW_HIDE) block at
#       the top of each plugin.py so the worker hides its own window
#       immediately as Python starts. NDJSON stdin/stdout pipes are
#       owned by disp.exe via OS handles, not the window — so plugin
#       function calls still work normally. The console just goes away.
#
# RUN:  Right-click PowerShell -> "Run as Administrator", then:
#       powershell -ExecutionPolicy Bypass -File "E:\TENET-5.github.io\.local\fix_gassist_popups_AS_ADMIN.ps1"
#
# After running: existing disp.exe workers must be killed and G-Assist
# will respawn them next time you press Alt+G or a game triggers a hook.

$ErrorActionPreference = 'Stop'

# 0. Admin check
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
  Write-Error "Must run as Administrator. Right-click PowerShell -> Run as Administrator."
  exit 1
}

$hidBlock = @'

# Cap#531: hide G-Assist plugin's attached console window.
# stdin/stdout NDJSON pipes still flow via OS handles. SW_HIDE=0.
import ctypes as _ctypes_hide
try:
    _ctypes_hide.windll.user32.ShowWindow(_ctypes_hide.windll.kernel32.GetConsoleWindow(), 0)
except Exception:
    pass

'@

function Patch-Plugin {
  param([string]$Path, [string]$AnchorPattern)

  if (-not (Test-Path $Path)) {
    Write-Output "SKIP (missing): $Path"
    return
  }

  $content = Get-Content $Path -Raw -Encoding UTF8
  if ($content -match 'Cap#531') {
    Write-Output "SKIP (already patched): $Path"
    return
  }

  # Backup first
  $backup = "$Path.bak_cap531"
  if (-not (Test-Path $backup)) {
    Copy-Item $Path $backup -Force
    Write-Output "BACKUP -> $backup"
  }

  # Insert the hide block right after the anchor pattern
  $newContent = [regex]::Replace($content, $AnchorPattern, ('$0' + $hidBlock), [System.Text.RegularExpressions.RegexOptions]::Multiline -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)

  if ($newContent -eq $content) {
    Write-Output "ERROR (anchor not found): $Path"
    return
  }

  Set-Content -Path $Path -Value $newContent -Encoding UTF8 -NoNewline
  Write-Output "PATCHED: $Path"
}

# tenet5 plugin: anchor is "from __future__ import annotations" line (must stay first)
$tenet5Path = "C:\ProgramData\NVIDIA Corporation\nvtopps\rise\plugins\tenet5\plugin.py"
Patch-Plugin -Path $tenet5Path -AnchorPattern 'from __future__ import annotations'

# gemini plugin: anchor is the closing triple-quote of the module docstring
$geminiPath = "C:\ProgramData\NVIDIA Corporation\nvtopps\rise\plugins\gemini\plugin.py"
Patch-Plugin -Path $geminiPath -AnchorPattern '(?m)^"""$'

# Kill existing disp.exe workers so they respawn with the patched code
Write-Output ""
Write-Output "=== Killing existing disp.exe workers (G-Assist will respawn them) ==="
Get-Process disp -ErrorAction SilentlyContinue | ForEach-Object {
  Write-Output "Killing disp.exe PID=$($_.Id)"
  Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

Write-Output ""
Write-Output "=== Done. Next time you press Alt+G (G-Assist overlay) or trigger a plugin, the workers ==="
Write-Output "=== will respawn but their console windows will be hidden immediately. ==="
Write-Output ""
Write-Output "If popups still occur, the remaining ones are likely the C++ plugins (corsair, logiled, modio)"
Write-Output "or disp.exe itself. To diagnose, run E:\TENET-5.github.io\.local\watch_births.ps1 to capture"
Write-Output "process births during gameplay."
