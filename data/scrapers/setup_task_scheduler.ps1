# ═══════════════════════════════════════════════════════════
#  TENET5 OSINT Task Scheduler Setup
#  Sets up Windows Task Scheduler to run scrapers daily
# ═══════════════════════════════════════════════════════════
#
#  Usage (Run as Administrator):
#    .\setup_task_scheduler.ps1 [-Hour 3] [-Uninstall]
#
#  Default: Runs daily at 03:00 AM
# ═══════════════════════════════════════════════════════════

param(
    [int]$Hour = 3,
    [switch]$Uninstall
)

$ErrorActionPreference = 'Stop'

$TaskName   = "TENET5-OSINT-Scraper"
$TaskPath   = "\TENET5\"
$ScraperDir = "E:\TENET-5.github.io\data\scrapers"
$Orchestrator = Join-Path $ScraperDir "run_all_scrapers.py"
$PythonExe  = (Get-Command python -ErrorAction SilentlyContinue).Source
if (-not $PythonExe) { $PythonExe = "$env:LOCALAPPDATA\Microsoft\WindowsApps\python.exe" }
$LogDir     = Join-Path $ScraperDir "..\scraper_logs"

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor DarkRed
Write-Host "  TENET5 OSINT Task Scheduler" -ForegroundColor White
Write-Host "  Millennial Falcon Automation" -ForegroundColor DarkGray
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor DarkRed

# ── Uninstall ──
if ($Uninstall) {
    Write-Host "  Removing scheduled task: $TaskName" -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -TaskPath $TaskPath -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "  ✓ Task removed." -ForegroundColor Green
    exit 0
}

# ── Verify prerequisites ──
if (-not (Test-Path $Orchestrator)) {
    Write-Host "  ✗ Orchestrator not found: $Orchestrator" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $PythonExe)) {
    Write-Host "  ✗ Python not found: $PythonExe" -ForegroundColor Red
    exit 1
}

Write-Host "  Python:       $PythonExe"
Write-Host "  Orchestrator: $Orchestrator"
Write-Host "  Schedule:     Daily at ${Hour}:00"
Write-Host ""

# ── Create log directory ──
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
    Write-Host "  ✓ Created log directory: $LogDir" -ForegroundColor Green
}

# ── Define the task ──
$action = New-ScheduledTaskAction `
    -Execute $PythonExe `
    -Argument "`"$Orchestrator`" --force" `
    -WorkingDirectory $ScraperDir

$trigger = New-ScheduledTaskTrigger `
    -Daily `
    -At "${Hour}:00"

$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -DontStopOnIdleEnd `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Hours 2) `
    -RestartCount 2 `
    -RestartInterval (New-TimeSpan -Minutes 15)

$principal = New-ScheduledTaskPrincipal `
    -UserId $env:USERNAME `
    -RunLevel Limited `
    -LogonType Interactive

# ── Remove existing task if present ──
$existing = Get-ScheduledTask -TaskName $TaskName -TaskPath $TaskPath -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "  ⟳ Updating existing task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -TaskPath $TaskPath -Confirm:$false
}

# ── Register the task ──
Register-ScheduledTask `
    -TaskName $TaskName `
    -TaskPath $TaskPath `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description "TENET5 OSINT data collection - runs all scrapers daily. Empirical Magic Handoff secured."

Write-Host "Scheduled task registered successfully!"
Write-Host "Name: $TaskName"
Write-Host "Schedule: Daily at $Hour"
Write-Host "To run manually: schtasks /run /tn $TaskPath$TaskName"
Write-Host "To uninstall run with -Uninstall"
