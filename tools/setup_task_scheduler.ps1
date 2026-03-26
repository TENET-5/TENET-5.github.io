# TENET-5 Instagram Campaign — Task Scheduler Setup
# Run this script AS ADMINISTRATOR to set up daily auto-posting
# Posts one campaign item per day at 9:00 AM

param(
    [string]$AccessToken = "",
    [string]$AccountId   = "",
    [int]$HourToPost     = 9
)

$scriptPath = "E:\TENET-5.github.io\tools\instagram_autoposter.py"
$taskName   = "TENET5-Instagram-Campaign"
$logPath    = "E:\TENET-5.github.io\tools\instagram_post.log"

if (-not $AccessToken -or -not $AccountId) {
    Write-Host ""
    Write-Host "=== TENET-5 Instagram Campaign Scheduler ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To get your credentials:" -ForegroundColor Yellow
    Write-Host "  1. Go to developers.facebook.com → My Apps → Create App" -ForegroundColor White
    Write-Host "  2. Add 'Instagram Graph API' product" -ForegroundColor White
    Write-Host "  3. Connect your Instagram Professional account" -ForegroundColor White
    Write-Host "  4. Generate a long-lived Page Access Token" -ForegroundColor White
    Write-Host "  5. Get your Instagram Account ID from the API Explorer" -ForegroundColor White
    Write-Host ""
    Write-Host "Then run:" -ForegroundColor Yellow
    Write-Host "  .\setup_task_scheduler.ps1 -AccessToken 'YOUR_TOKEN' -AccountId 'YOUR_IG_ID'" -ForegroundColor Green
    Write-Host ""
    Write-Host "OR set them manually in instagram_autoposter.py" -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

# Store credentials as machine environment variables
[System.Environment]::SetEnvironmentVariable("IG_ACCESS_TOKEN", $AccessToken, "Machine")
[System.Environment]::SetEnvironmentVariable("IG_ACCOUNT_ID",   $AccountId,   "Machine")
Write-Host "✅ Credentials saved as system environment variables" -ForegroundColor Green

# Create scheduled task
$action  = New-ScheduledTaskAction -Execute "python" `
    -Argument "`"$scriptPath`" --post-next >> `"$logPath`" 2>&1"

$trigger = New-ScheduledTaskTrigger -Daily -At "$($HourToPost):00AM"

$settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
    -RestartCount 2 `
    -RestartInterval (New-TimeSpan -Minutes 5)

Register-ScheduledTask `
    -TaskName $taskName `
    -Action   $action `
    -Trigger  $trigger `
    -Settings $settings `
    -RunLevel Highest `
    -Force | Out-Null

Write-Host "✅ Task '$taskName' created — posts daily at $($HourToPost):00 AM" -ForegroundColor Green
Write-Host "   Log file: $logPath" -ForegroundColor White
Write-Host ""
Write-Host "To run immediately (test):" -ForegroundColor Yellow
Write-Host "  python `"$scriptPath`" --setup-check" -ForegroundColor Green
Write-Host "  python `"$scriptPath`" --post-next" -ForegroundColor Green
Write-Host ""
Write-Host "To check campaign progress:" -ForegroundColor Yellow
Write-Host "  python `"$scriptPath`" --status" -ForegroundColor Green
