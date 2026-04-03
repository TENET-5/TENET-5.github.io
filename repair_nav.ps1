$htmlFiles = Get-ChildItem -Path "E:\TENET-5.github.io" -Filter "*.html"
foreach ($file in $htmlFiles) {
    (Get-Content $file.FullName) -replace 'nav.js\?v=2', 'nav.js?v=3' | Set-Content $file.FullName
}
Write-Output "Updated V3 script tag in all HTML files."
