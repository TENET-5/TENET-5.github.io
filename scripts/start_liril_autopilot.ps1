param(
    [int]$IntervalMinutes = 30
)

$RepoRoot = Split-Path -Parent $PSScriptRoot
$LogFile = Join-Path $RepoRoot 'data\liril_autopilot.log'
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $LogFile) | Out-Null
if (-not (Test-Path $LogFile)) {
    New-Item -ItemType File -Path $LogFile | Out-Null
}

$command = "Set-Location '$RepoRoot'; python -u scripts/liril_autopilot.py --loop --interval-minutes $IntervalMinutes *>> '$LogFile'"
Start-Process powershell -WindowStyle Minimized -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', $command | Out-Null

Write-Host "LIRIL autopilot started for $RepoRoot"
Write-Host "Log file: $LogFile"
