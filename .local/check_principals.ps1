$results = @()
foreach ($name in @('TENET5-OSINT-DailyPipeline','TENET5_LIRIL_autoprompt_cron','TENET5_LIRIL_auto_driver')) {
  $t = Get-ScheduledTask -TaskName $name
  $results += [PSCustomObject]@{
    Name = $name
    UserId = $t.Principal.UserId
    LogonType = $t.Principal.LogonType
    RunLevel = $t.Principal.RunLevel
  }
}
$results | Format-Table -AutoSize
