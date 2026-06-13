# Cap#530: Fix TENET5-OSINT-DailyPipeline scheduled task to launch hidden.
#
# RUN THIS AS ADMINISTRATOR:
#   - Right-click PowerShell -> "Run as Administrator"
#   - cd "E:\TENET-5.github.io\.local"
#   - powershell -ExecutionPolicy Bypass -File .\fix_osint_task_AS_ADMIN.ps1
#
# What this does:
#   - Prepends "-WindowStyle Hidden" to the powershell.exe arguments
#   - Means the task launches a hidden window from the very first millisecond
#   - The self-relaunch trampoline in run_osint_pipeline.ps1 becomes a no-op
#     because it'll already be hidden, but stays in place as belt-and-suspenders.
#
# Without this, the OSINT task pops a ~100ms visible PowerShell flash daily at 2 AM
# before the trampoline relaunches it hidden. Cosmetic but visible.

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Error "Must run as Administrator. Right-click PowerShell -> Run as Administrator."
  exit 1
}

$name = "TENET5-OSINT-DailyPipeline"
$task = Get-ScheduledTask -TaskName $name
$existing = $task.Actions[0]
$exec = $existing.Execute
$args = $existing.Arguments
$wd = $existing.WorkingDirectory

Write-Output "BEFORE Execute: $exec"
Write-Output "BEFORE Args   : $args"

if ($args -match '-WindowStyle\s+Hidden') {
  Write-Output "SKIP - already has -WindowStyle Hidden"
  exit 0
}

$newArgs = "-WindowStyle Hidden " + $args
Write-Output "AFTER  Args   : $newArgs"

if ([string]::IsNullOrEmpty($wd)) {
  $newAction = New-ScheduledTaskAction -Execute $exec -Argument $newArgs
} else {
  $newAction = New-ScheduledTaskAction -Execute $exec -Argument $newArgs -WorkingDirectory $wd
}
Set-ScheduledTask -TaskName $name -Action $newAction | Out-Null
Write-Output "FIXED"

# Verify
$t2 = Get-ScheduledTask -TaskName $name
Write-Output ""
Write-Output ("VERIFY Args: " + $t2.Actions[0].Arguments)
