# Watches for new process births every 1 second for 60 seconds.
# Emits a line for every new process so any popup gets captured even if it flashes briefly.
$ErrorActionPreference = 'SilentlyContinue'

$seen = @{}
Get-CimInstance Win32_Process | ForEach-Object { $seen[$_.ProcessId] = $true }
Write-Output "BASELINE: $($seen.Count) processes at $(Get-Date -Format HH:mm:ss)"
Write-Output "WATCHING for new births for 60 seconds..."

$end = (Get-Date).AddSeconds(60)
while ((Get-Date) -lt $end) {
  Get-CimInstance Win32_Process | ForEach-Object {
    if (-not $seen.ContainsKey($_.ProcessId)) {
      $seen[$_.ProcessId] = $true
      $parent = Get-CimInstance Win32_Process -Filter ("ProcessId=" + $_.ParentProcessId)
      $line = "[BORN $(Get-Date -Format HH:mm:ss)] PID=$($_.ProcessId) name=$($_.Name) parent=$($parent.Name)($($_.ParentProcessId))"
      if ($_.CommandLine) {
        $cmd = if ($_.CommandLine.Length -gt 130) { $_.CommandLine.Substring(0,130)+"..." } else { $_.CommandLine }
        $line += " cmd=$cmd"
      }
      Write-Output $line
    }
  }
  Start-Sleep -Milliseconds 1000
}
Write-Output "DONE at $(Get-Date -Format HH:mm:ss)"
