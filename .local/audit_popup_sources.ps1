$ErrorActionPreference = 'SilentlyContinue'

Write-Output "=== A. Scheduled tasks with 'python' in command ==="
$pythonTasks = Get-ScheduledTask | ForEach-Object {
  $task = $_
  $task.Actions | ForEach-Object {
    $line = "$($_.Execute) $($_.Arguments)"
    if ($line -match 'python') {
      [PSCustomObject]@{
        Name    = $task.TaskName
        State   = $task.State
        Hidden  = $task.Settings.Hidden
        UsesPyW = if ($line -match 'pythonw\.exe') { 'silent' } else { 'POPUP' }
        Cmd     = if ($line.Length -gt 100) { $line.Substring(0, 100) + '...' } else { $line }
      }
    }
  }
}
$pythonTasks | Format-Table -AutoSize -Wrap

Write-Output ""
Write-Output "=== B. Scheduled tasks with cmd.exe or powershell that call python ==="
Get-ScheduledTask | ForEach-Object {
  $task = $_
  $task.Actions | ForEach-Object {
    $arg = "$($_.Arguments)"
    if ($arg -match 'python(?!w)\.exe|\\python\.exe| python ') {
      [PSCustomObject]@{
        Name    = $task.TaskName
        State   = $task.State
        Hidden  = $task.Settings.Hidden
        Exec    = $_.Execute
        Args    = if ($arg.Length -gt 100) { $arg.Substring(0, 100) + '...' } else { $arg }
      }
    }
  }
} | Format-Table -AutoSize -Wrap

Write-Output ""
Write-Output "=== C. Startup folder .lnk inspection ==="
$startup = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
$shell = New-Object -ComObject WScript.Shell
Get-ChildItem $startup -Filter "*.lnk" | ForEach-Object {
  $lnk = $shell.CreateShortcut($_.FullName)
  $target = $lnk.TargetPath
  $args = $lnk.Arguments
  $window = $lnk.WindowStyle  # 1=normal 3=max 7=min
  $line = "$target $args"
  $verdict = if ($target -match 'pythonw\.exe') { 'silent' }
             elseif ($target -match 'python\.exe$') { 'POPUP (python.exe)' }
             elseif ($line -match 'pythonw') { 'silent (via args)' }
             elseif ($line -match ' python ' -or $args -match '\\python\.exe') { 'POPUP (python via args)' }
             else { 'not-python' }
  [PSCustomObject]@{
    Lnk    = $_.Name
    Verdict = $verdict
    Window = $window  # 7=minimized; 1=normal popup
    Target = if ($target.Length -gt 60) { $target.Substring(0, 60) + '...' } else { $target }
    Args   = if ($args.Length -gt 70) { $args.Substring(0, 70) + '...' } else { $args }
  }
} | Format-Table -AutoSize -Wrap

Write-Output ""
Write-Output "=== D. Currently-running python.exe / python3.exe console processes ==="
Get-Process -Name python, python3 2>$null | Select-Object Id, ProcessName, @{N='ParentId'; E={ (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)").ParentProcessId }}, @{N='CmdLine'; E={ ((Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)").CommandLine -replace '(.{120}).+','$1...') }} | Format-Table -AutoSize -Wrap
