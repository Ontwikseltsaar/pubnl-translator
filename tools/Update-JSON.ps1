param(
    [Parameter(Mandatory = $true)]
    [string]$XPIFilename,
    [Parameter(Mandatory = $true)]
    [string]$Version
)
          
Write-Output "Adding update information for version $Version in updates.json..."
          
$asset = (gh release view $Version --json assets | ConvertFrom-Json | Where-Object { $_.assets.name -eq "$XPIFilename" }).assets
          
$manifest = Get-Content -Raw manifest.json | ConvertFrom-Json
$addonId = $manifest.browser_specific_settings.gecko.id
$updateInfo = [PSCustomObject]@{
    version     = "$($manifest.version)"
    update_link = $asset.url
    update_hash = $asset.digest
}
          
$updateManifest = Get-Content updates.json | ConvertFrom-Json
$updateManifest.addons."$addonId".updates += $updateInfo
New-Item -ItemType File -Path output -Name updates.json -Value ($updateManifest | ConvertTo-Json -Depth 4) -Force | Out-Null
          
./node_modules/.bin/prettier --ignore-path .prettierignore output/updates.json --write --log-level silent
          
Write-Output "Done."
