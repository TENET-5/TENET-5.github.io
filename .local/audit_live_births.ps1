$ErrorActionPreference = 'SilentlyContinue'

Write-Output "=== Processes born in the last 5 minutes ==="
$cutoff = (Get-Date).AddMinutes(-5)
Get-CimInstance Win32_Process | Where-Object { $_.CreationDate -gt $cutoff } | ForEach-Object {
  $parent = Get-CimInstance Win32_Process -Filter ("ProcessId=" + $_.ParentProcessId)
  [PSCustomObject]@{
    Time = $_.CreationDate.ToString('HH:mm:ss')
    PID = $_.ProcessId
    Name = $_.Name
    ParentName = $parent.Name
    ParentPID = $_.ParentProcessId
    Cmd = if ($_.CommandLine) { if ($_.CommandLine.Length -gt 100) { $_.CommandLine.Substring(0,100)+"..." } else { $_.CommandLine } } else { "" }
  }
} | Sort-Object Time | Format-Table -AutoSize -Wrap

Write-Output ""
Write-Output "=== ALL python.exe / pythonw.exe / cmd.exe / conhost.exe RIGHT NOW (full cmdline) ==="
Get-CimInstance Win32_Process -Filter "Name='python.exe' OR Name='pythonw.exe' OR Name='cmd.exe' OR Name='wscript.exe' OR Name='cscript.exe'" | ForEach-Object {
  $parent = Get-CimInstance Win32_Process -Filter ("ProcessId=" + $_.ParentProcessId)
  [PSCustomObject]@{
    PID = $_.ProcessId
    Name = $_.Name
    ParentName = $parent.Name
    ParentPID = $_.ParentProcessId
    Cmd = if ($_.CommandLine) { if ($_.CommandLine.Length -gt 110) { $_.CommandLine.Substring(0,110)+"..." } else { $_.CommandLine } } else { "" }
  }
} | Sort-Object Name, PID | Format-Table -AutoSize -Wrap

Write-Output ""
Write-Output "=== Windows with VISIBLE titlebars right now (top 40 by start time) ==="
Get-Process | Where-Object { $_.MainWindowTitle -ne "" } | Sort-Object StartTime -Descending | Select-Object -First 40 ProcessName, Id, @{N='Title';E={ if ($_.MainWindowTitle.Length -gt 60) { $_.MainWindowTitle.Substring(0,60)+"..." } else { $_.MainWindowTitle } }}, @{N='Started';E={ if ($_.StartTime) { $_.StartTime.ToString('HH:mm:ss') } else { '' } }} | Format-Table -AutoSize

Write-Output ""
Write-Output "=== Tasks that ran in the last 1 hour ==="
Get-ScheduledTask | ForEach-Object {
  $info = $_ | Get-ScheduledTaskInfo
  if ($info.LastRunTime -and $info.LastRunTime -gt (Get-Date).AddHours(-1)) {
    [PSCustomObject]@{
      Name = $_.TaskName
      LastRun = $info.LastRunTime.ToString('HH:mm:ss')
      LastResult = $info.LastTaskResult
      State = $_.State
      Exec = if ($_.Actions[0].Execute.Length -gt 50) { Split-Path $_.Actions[0].Execute -Leaf } else { $_.Actions[0].Execute }
    }
  }
} | Sort-Object LastRun -Descending | Format-Table -AutoSize -Wrap
