$name = "TENET5_LIRIL_autoprompt_cron"
$task = Get-ScheduledTask -TaskName $name
$existing = $task.Actions[0]
$exec = $existing.Execute
$args = $existing.Arguments
$wd = $existing.WorkingDirectory
Write-Output ("BEFORE Execute (raw): [" + $exec + "]")

$newExec = $exec.Replace("python.exe", "pythonw.exe")
Write-Output ("AFTER  Execute (raw): [" + $newExec + "]")

if ([string]::IsNullOrEmpty($wd)) {
  $newAction = New-ScheduledTaskAction -Execute $newExec -Argument $args
} else {
  $newAction = New-ScheduledTaskAction -Execute $newExec -Argument $args -WorkingDirectory $wd
}
Set-ScheduledTask -TaskName $name -Action $newAction | Out-Null
Write-Output "FIXED"

Write-Output ""
Write-Output "=== VERIFY ==="
$task2 = Get-ScheduledTask -TaskName $name
$exec2 = $task2.Actions[0].Execute
Write-Output ("Execute now: [" + $exec2 + "]")
if ($exec2.Contains("pythonw.exe")) {
  Write-Output "VERDICT: SILENT"
} else {
  Write-Output "VERDICT: POPUP"
}
