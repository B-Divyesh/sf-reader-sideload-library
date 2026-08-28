$ErrorActionPreference = "Stop"
$manifestUrl = "https://github.com/B-Divyesh/sf-reader-sideload-library/releases/latest/download/latest.json"
$manifest = Invoke-RestMethod -Uri $manifestUrl
$asset = $manifest.platforms.windows_x64
if (-not $asset.url -or -not $asset.sha256) { throw "The latest release has no Windows x64 installer." }
$temporary = Join-Path ([System.IO.Path]::GetTempPath()) "reader-sideload-library.msi"
Write-Host "Downloading Reader Sideload Library for Windows x64..."
Invoke-WebRequest -Uri $asset.url -OutFile $temporary
$actual = (Get-FileHash -Path $temporary -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actual -ne $asset.sha256.ToLowerInvariant()) { Remove-Item $temporary -Force; throw "Checksum mismatch; nothing was installed." }
Write-Host "Checksum verified. Starting the unsigned MSI installer..."
$process = Start-Process msiexec.exe -ArgumentList "/i `"$temporary`"" -Wait -PassThru
Remove-Item $temporary -Force
if ($process.ExitCode -ne 0) { throw "Windows Installer exited with code $($process.ExitCode)." }
Write-Host "Reader Sideload Library was installed. Open it from the Start menu."
