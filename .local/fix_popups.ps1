$ErrorActionPreference = 'Stop'

function Update-TaskAction {
  param([string]$TaskName, [string]$NewExecute, [string]$NewArguments)
  $task = Get-ScheduledTask -TaskName $TaskName
  $existing = $task.Actions[0]
  $exec = if ($NewExecute) { $NewExecute } else { $existing.Execute }
  $args = if ($null -ne $NewArguments) { $NewArguments } else { $existing.Arguments }
  $wd   = $existing.WorkingDirectory
  $newAction = if ($wd) {
    New-ScheduledTaskAction -Execute $exec -Argument $args -WorkingDirectory $wd
  } else {
    New-ScheduledTaskAction -Execute $exec -Argument $args
  }
  Set-ScheduledTask -TaskName $TaskName -Action $newAction | Out-Null
  Write-Output "OK  $TaskName -> Execute=$exec, Args=$args"
}

# Fix 1: TENET5-OSINT-DailyPipeline — prepend -WindowStyle Hidden to the powershell args
Write-Output "=== Fix 1: TENET5-OSINT-DailyPipeline ==="
$task = Get-ScheduledTask -TaskName "TENET5-OSINT-DailyPipeline"
$existingArgs = $task.Actions[0].Arguments
Write-Output "BEFORE args: $existingArgs"
if ($existingArgs -notmatch '-WindowStyle\s+Hidden') {
  $newArgs = "-WindowStyle Hidden $existingArgs"
  Update-TaskAction -TaskName "TENET5-OSINT-DailyPipeline" -NewArguments $newArgs
} else {
  Write-Output "SKIP  TENET5-OSINT-DailyPipeline already has -WindowStyle Hidden"
}

# Fix 2 & 3: Swap python.exe -> pythonw.exe in two disabled tasks
foreach ($name in @("TENET5_LIRIL_autoprompt_cron", "TENET5_LIRIL_auto_driver")) {
  Write-Output ""
  Write-Output "=== Fix: $name ==="
  $task = Get-ScheduledTask -TaskName $name
  $exec = $task.Actions[0].Execute
  $args = $task.Actions[0].Arguments
  Write-Output "BEFORE Execute: $exec"
  if ($exec -match 'python\.exe$' -or $exec -match '\\python\.exe$') {
    $newExec = $exec -replace 'python\.exe$', 'pythonw.exe'
    Update-TaskAction -TaskName $name -NewExecute $newExec -NewArguments $args
  } else {
    Write-Output "SKIP  $name does not use python.exe (already silent or different binary)"
  }
}

# Verification
Write-Output ""
Write-Output "=== VERIFICATION ==="
foreach ($name in @("TENET5-OSINT-DailyPipeline", "TENET5_LIRIL_autoprompt_cron", "TENET5_LIRIL_auto_driver")) {
  $task = Get-ScheduledTask -TaskName $name
  $a = $task.Actions[0]
  $line = "$($a.Execute) $($a.Arguments)"
  $verdict = if ($line -match 'pythonw\.exe' -or $line -match '-WindowStyle\s+Hidden') { 'SILENT' } else { 'POPUP' }
  Write-Output ("{0,-32}  state={1,-8} hidden={2,-5} verdict={3}" -f $name, $task.State, $task.Settings.Hidden, $verdict)
}
