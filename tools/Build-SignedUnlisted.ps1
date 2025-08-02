param(
    [Parameter(Mandatory = $true)]
    [string]$XPIFilename,
    [Parameter(Mandatory = $true)]
    [string]$Version,
    [Parameter(Mandatory = $true)]
    [string]$Key,
    [Parameter(Mandatory = $true)]
    [string]$Secret
)

Write-Output "Inserting update information and modifying version in manifest.json..."
          
$manifest = Get-Content -Raw manifest.json | ConvertFrom-Json
$manifest.browser_specific_settings.gecko | Add-Member -Type NoteProperty -Name "update_url" -Value "https://raw.githubusercontent.com/Ontwikseltsaar/pubnl-translator/refs/heads/main/updates.json"
$manifest.version = "$Version.0"
Set-Content -Path manifest.json -Value ($manifest | ConvertTo-Json)
          
./node_modules/.bin/prettier --ignore-path .prettierignore manifest.json --write --log-level silent

Copy-Item manifest.json -Destination output/manifest.json
          
Write-Output "Done."
          
./node_modules/.bin/web-ext sign --channel=unlisted --api-key=$Key --api-secret=$Secret --config=./tools/settings/.web-ext-config.mjs --artifacts-dir output --amo-metadata output/amo-metadata.json
          
Get-ChildItem ./output/*.xpi | Rename-Item -NewName "$XPIFilename"
if (Test-Path output/$XPIFilename) {
    Write-Output "Done."
}
else {
    Write-Output "Error building PubNL Translator."
}
