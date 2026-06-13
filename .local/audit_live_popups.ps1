$ErrorActionPreference = 'SilentlyContinue'

Write-Output "=== E. ALL currently-running python processes (including children) ==="
Get-CimInstance Win32_Process -Filter "Name='python.exe' OR Name='pythonw.exe' OR Name='python3.exe' OR Name='py.exe'" |
  Select-Object ProcessId, ParentProcessId, Name, @{N='Cmd'; E={ if ($_.CommandLine.Length -gt 110) { $_.CommandLine.Substring(0,110) + '...' } else { $_.CommandLine } }} |
  Format-Table -AutoSize -Wrap

Write-Output ""
Write-Output "=== F. Currently-running conhost.exe / cmd.exe (the windows that pop up) ==="
Get-CimInstance Win32_Process -Filter "Name='conhost.exe' OR Name='cmd.exe' OR Name='WindowsTerminal.exe'" |
  Select-Object ProcessId, ParentProcessId, Name, @{N='Parent'; E={ (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.ParentProcessId)").Name }}, @{N='Cmd'; E={ if ($_.CommandLine -and $_.CommandLine.Length -gt 100) { $_.CommandLine.Substring(0,100) + '...' } else { $_.CommandLine } }} |
  Format-Table -AutoSize -Wrap

Write-Output ""
Write-Output "=== G. Tasks NOT containing python but with cmd.exe/powershell that may launch python via batch ==="
Get-ScheduledTask | Where-Object { $_.State -eq 'Ready' } | ForEach-Object {
  $task = $_
  $task.Actions | ForEach-Object {
    $exec = $_.Execute
    $arg  = $_.Arguments
    if ($exec -match 'cmd\.exe|powershell\.exe|pwsh\.exe|wscript\.exe|cscript\.exe' -or $arg -match '\.bat|\.ps1|\.vbs|\.cmd') {
      [PSCustomObject]@{
        Name   = $task.TaskName
        State  = $task.State
        Hidden = $task.Settings.Hidden
        Exec   = if ($exec.Length -gt 40) { Split-Path $exec -Leaf } else { $exec }
        Args   = if ($arg.Length -gt 100) { $arg.Substring(0,100) + '...' } else { $arg }
      }
    }
  }
} | Format-Table -AutoSize -Wrap

Write-Output ""
Write-Output "=== H. Search for qerr_revalidate specifically (per feedback_popup_source_3min_scheduled_tasks) ==="
Get-ScheduledTask | Where-Object { $_.TaskName -match 'qerr' -or ($_.Actions | ForEach-Object { $_.Arguments } | Out-String) -match 'qerr_revalidate' } |
  Select-Object TaskName, State, @{N='Hidden';E={$_.Settings.Hidden}}, @{N='Exec';E={($_.Actions | Select-Object -First 1).Execute}}, @{N='Args';E={($_.Actions | Select-Object -First 1).Arguments -replace '(.{80}).+','$1...'}} |
  Format-Table -AutoSize -Wrap

Write-Output ""
Write-Output "=== I. Project-level Claude hooks (.claude/settings.json in repo trees) ==="
Get-ChildItem -Path "E:\" -Filter "settings.json" -Recurse -ErrorAction SilentlyContinue -Depth 4 |
  Where-Object { $_.FullName -match '\\\.claude\\' } |
  ForEach-Object {
    $j = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    if ($j -match 'hooks' -and ($j -match 'python(?!w)\.exe|\\python\.exe')) {
      Write-Output "POPUP HOOK: $($_.FullName)"
      $j | Select-String -Pattern 'python' -Context 0,1 | ForEach-Object { Write-Output "  $($_.Line.Trim())" }
    } elseif ($j -match 'hooks') {
      Write-Output "OK hooks (no python.exe): $($_.FullName)"
    }
  }
