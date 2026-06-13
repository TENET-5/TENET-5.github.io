$ErrorActionPreference = 'SilentlyContinue'

Write-Output "=== disp.exe properties ==="
Get-Item "C:\ProgramData\NVIDIA Corporation\nvtopps\rise\disp.exe" |
  Select-Object FullName, Length, LastWriteTime, @{N='Version';E={$_.VersionInfo.FileVersion}}, @{N='Product';E={$_.VersionInfo.ProductName}}, @{N='Company';E={$_.VersionInfo.CompanyName}} |
  Format-List

Write-Output ""
Write-Output "=== nvtopps folder layout ==="
Get-ChildItem "C:\ProgramData\NVIDIA Corporation\nvtopps" -Recurse -ErrorAction SilentlyContinue | Select-Object FullName, Length, LastWriteTime | Format-Table -AutoSize -Wrap

Write-Output ""
Write-Output "=== NVDisplay.Container.exe details ==="
Get-Process -Name NVDisplay.Container -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, Path, @{N='Cmd';E={ (Get-CimInstance Win32_Process -Filter ("ProcessId=" + $_.Id)).CommandLine }} | Format-List

Write-Output ""
Write-Output "=== NVIDIA services (anything that spawns disp.exe) ==="
Get-CimInstance Win32_Service | Where-Object { $_.PathName -match 'nvidia|nvdisplay|nvcontainer' } | Select-Object Name, DisplayName, State, StartMode, @{N='Path';E={ if ($_.PathName.Length -gt 100) { $_.PathName.Substring(0,100)+'...' } else { $_.PathName } }} | Format-Table -AutoSize -Wrap

Write-Output ""
Write-Output "=== NVIDIA processes currently running ==="
Get-Process | Where-Object { $_.ProcessName -match 'nv|nvidia|geforce|disp' -and $_.ProcessName -notmatch '^(disp$)' } | Select-Object Id, ProcessName, @{N='Path';E={ $_.Path }} | Sort-Object ProcessName | Format-Table -AutoSize -Wrap

Write-Output ""
Write-Output "=== NVIDIA scheduled tasks ==="
Get-ScheduledTask | Where-Object { ($_.TaskName -match 'nvidia|geforce|nvdisplay') -or (($_.Actions | ForEach-Object { $_.Execute }) -match 'nvidia|disp\.exe|nvtopps') } | Select-Object TaskName, State, TaskPath, @{N='Exec';E={ ($_.Actions[0].Execute) }} | Format-Table -AutoSize -Wrap
