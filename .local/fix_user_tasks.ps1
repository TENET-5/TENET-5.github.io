$names = @("TENET5_LIRIL_autoprompt_cron", "TENET5_LIRIL_auto_driver")
foreach ($name in $names) {
  Write-Output ("=== Processing: " + $name + " ===")
  $task = Get-ScheduledTask -TaskName $name
  $existing = $task.Actions[0]
  $exec = $existing.Execute
  $args = $existing.Arguments
  $wd = $existing.WorkingDirectory
  Write-Output ("BEFORE Execute: " + $exec)
  if ($exec.EndsWith("python.exe")) {
    $newExec = $exec.Substring(0, $exec.Length - 10) + "pythonw.exe"
    Write-Output ("AFTER  Execute: " + $newExec)
    if ([string]::IsNullOrEmpty($wd)) {
      $newAction = New-ScheduledTaskAction -Execute $newExec -Argument $args
    } else {
      $newAction = New-ScheduledTaskAction -Execute $newExec -Argument $args -WorkingDirectory $wd
    }
    Set-ScheduledTask -TaskName $name -Action $newAction | Out-Null
    Write-Output "FIXED"
  } else {
    Write-Output "SKIP - does not end with python.exe"
  }
  Write-Output ""
}

Write-Output "=== VERIFY ==="
foreach ($name in $names) {
  $task = Get-ScheduledTask -TaskName $name
  $exec = $task.Actions[0].Execute
  if ($exec.Contains("pythonw.exe")) {
    Write-Output ($name + " -> SILENT (" + $exec + ")")
  } else {
    Write-Output ($name + " -> POPUP (" + $exec + ")")
  }
}
