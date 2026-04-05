$ArtifactDir = "C:\Users\Xbxac\.gemini\antigravity\brain\628484d6-368e-4031-8b67-b2258997b147"
$OutputDir = "E:\TENET-5.github.io\reduster\models"
$TrellisApi = "http://localhost:8190/generate"

$TargetAssets = @(
    "boreal_pine_tree",
    "canadian_canoe",
    "combat_atv",
    "enemy_infantry",
    "wood_cottage",
    "morel_mushroom",
    "fiddleheads",
    "wild_leeks",
    "wild_blueberries"
)

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

Write-Host "--- TRELLIS MASS GENERATOR ---"

foreach ($asset in $TargetAssets) {
    $latestImage = Get-ChildItem -Path $ArtifactDir -Filter "$asset*.png" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    
    if (-not $latestImage) {
        Write-Host "[-] Skipping ${asset}: No 2D image found." -ForegroundColor Yellow
        continue
    }

    Write-Host "`n[+] Processing ${asset}..."
    Write-Host "    Source: $($latestImage.Name)"
    
    $bytes = [System.IO.File]::ReadAllBytes($latestImage.FullName)
    $b64 = [Convert]::ToBase64String($bytes)
    
    $payload = @{
        image = $b64
    } | ConvertTo-Json -Depth 5

    Write-Host "    Submitting job to TRELLIS API..."
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        $response = Invoke-RestMethod -Uri $TrellisApi -Method Post -Body $payload -ContentType "application/json" -TimeoutSec 300
        
        if ($response.vertices -eq 0) {
            Write-Host "    [!] Warning: Trellis generated 0 vertices." -ForegroundColor Red
        }
        
        $filename = $response.filename
        if (-not $filename) { $filename = "$asset.glb" }
        
        $downloadUrl = "http://localhost:8190/download?filename=$filename"
        $savePath = Join-Path $OutputDir "${asset}.glb"
        
        Invoke-RestMethod -Uri $downloadUrl -Method Get -OutFile $savePath
        
        $sizeKb = (Get-Item $savePath).Length / 1024
        $sizeFmt = [math]::Round($sizeKb, 2)
        $timeFmt = [math]::Round($sw.Elapsed.TotalSeconds, 1)
        Write-Host "    [SUCCESS] Saved to $savePath (${sizeFmt} KB) - ${timeFmt}s" -ForegroundColor Green
    }
    catch {
        Write-Host "    [X] Error generating ${asset}: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n--- ALL TASKS COMPLETE ---"
