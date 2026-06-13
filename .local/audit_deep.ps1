$ErrorActionPreference = 'SilentlyContinue'

Write-Output "=== 1. CURRENTLY-RUNNING python.exe (visible console, the popup source) ==="
Get-CimInstance Win32_Process -Filter "Name='python.exe'" | ForEach-Object {
  $parent = Get-CimInstance Win32_Process -Filter ("ProcessId=" + $_.ParentProcessId)
  [PSCustomObject]@{
    PID = $_.ProcessId
    PPID = $_.ParentProcessId
    ParentName = $parent.Name
    CmdLine = if ($_.CommandLine) { if ($_.CommandLine.Length -gt 130) { $_.CommandLine.Substring(0,130)+"..." } else { $_.CommandLine } } else { "(null)" }
  }
} | Format-Table -AutoSize -Wrap

Write-Output ""
Write-Output "=== 2. RUNNING conhost.exe parented to python or cmd (popup windows) ==="
Get-CimInstance Win32_Process -Filter "Name='conhost.exe'" | ForEach-Object {
  $parent = Get-CimInstance Win32_Process -Filter ("ProcessId=" + $_.ParentProcessId)
  if ($parent.Name -match 'python|cmd\.exe|wscript\.exe|cscript\.exe') {
    [PSCustomObject]@{
      ConhostPID = $_.ProcessId
      ParentName = $parent.Name
      ParentPID = $_.ParentProcessId
      ParentCmd = if ($parent.CommandLine) { if ($parent.CommandLine.Length -gt 120) { $parent.CommandLine.Substring(0,120)+"..." } else { $parent.CommandLine } } else { "" }
    }
  }
} | Format-Table -AutoSize -Wrap

Write-Output ""
Write-Output "=== 3. ALL scheduled tasks in ALL folders (recursive, includes nested) ==="
Get-ScheduledTask | ForEach-Object {
  $task = $_
  $task.Actions | ForEach-Object {
    $line = "$($_.Execute) $($_.Arguments)"
    if ($line -match 'python' -or $line -match '\.py') {
      $usesW = $line -match 'pythonw\.exe'
      [PSCustomObject]@{
        Path = $task.TaskPath
        Name = $task.TaskName
        State = $task.State
        Verdict = if ($usesW) { 'silent' } else { 'POPUP' }
        Cmd = if ($line.Length -gt 100) { $line.Substring(0,100)+"..." } else { $line }
      }
    }
  }
} | Sort-Object Verdict, Name | Format-Table -AutoSize -Wrap

Write-Output ""
Write-Output "=== 4. Tasks where Execute is cmd/batch/vbs (may launch python via wrapper) ==="
Get-ScheduledTask | ForEach-Object {
  $task = $_
  $task.Actions | ForEach-Object {
    $exec = $_.Execute
    if ($exec -match 'cmd\.exe|wscript\.exe|cscript\.exe|\.bat$|\.cmd$|\.vbs$' -and $task.State -ne 'Disabled') {
      [PSCustomObject]@{
        Path = $task.TaskPath
        Name = $task.TaskName
        State = $task.State
        Hidden = $task.Settings.Hidden
        Exec = if ($exec.Length -gt 50) { Split-Path $exec -Leaf } else { $exec }
        Args = if ($_.Arguments.Length -gt 100) { $_.Arguments.Substring(0,100)+"..." } else { $_.Arguments }
      }
    }
  }
} | Format-Table -AutoSize -Wrap

Write-Output ""
Write-Output "=== 5. Windows services running python ==="
Get-CimInstance Win32_Service -Filter "State='Running'" | Where-Object { $_.PathName -match 'python' } | Select-Object Name, DisplayName, State, StartMode, @{N='Path';E={ if ($_.PathName.Length -gt 100) { $_.PathName.Substring(0,100)+"..." } else { $_.PathName } }} | Format-Table -AutoSize -Wrap

Write-Output ""
Write-Output "=== 6. Tasks triggered every-N-minutes (the 3min/5min popups per memory) ==="
Get-ScheduledTask | Where-Object { $_.State -ne 'Disabled' } | ForEach-Object {
  $task = $_
  foreach ($trig in $task.Triggers) {
    if ($trig.Repetition -and $trig.Repetition.Interval) {
      if ($trig.Repetition.Interval -match 'PT\d+M') {
        [PSCustomObject]@{
          Path = $task.TaskPath
          Name = $task.TaskName
          State = $task.State
          Interval = $trig.Repetition.Interval
          Hidden = $task.Settings.Hidden
          Exec = Split-Path $task.Actions[0].Execute -Leaf
        }
      }
    }
  }
} | Sort-Object Interval | Format-Table -AutoSize -Wrap
