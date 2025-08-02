param(
    [Parameter(Mandatory = $true)]
    [string]$Version
)

$metadataFilepath = "$PSScriptRoot/templates/amo-metadata.json"
$descriptionENFilepath = "$PSScriptRoot/templates/description-en.txt"
$descriptionNLFilepath = "$PSScriptRoot/templates/description-nl.txt"

if (-not ((Test-Path CHANGELOG.md) -and (Test-Path $metadataFilepath) -and (Test-Path $descriptionENFilepath) -and (Test-Path $descriptionNLFilepath))) {
    Write-Output "CHANGELOG.md, amo-metadata.json, description-en.txt or description-nl.txt not found."
    exit 1
}

Write-Output "CHANGELOG.md, amo-metadata.json, description-en.txt and description-nl.txt found."
Write-Output "Inserting add-on descriptions into metadata file..."

$metadata = Get-Content -Raw $metadataFilepath | ConvertFrom-Json

$descriptionEN = Get-Content -Raw $descriptionENFilepath
$descriptionNL = Get-Content -Raw $descriptionNLFilepath
$metadata.description."en-US" = "$descriptionEN"
$metadata.description."nl" = "$descriptionNL"

Write-Output "Done."
Write-Output "Inserting changelog information into metadata file..."

$startPattern = "# $Version"

$changes = (Get-Content CHANGELOG.md).Where({ $_ -match "^$startPattern`$" }, 'SkipUntil').Where({ $_ -match "^---$" }, 'Until') | Select-Object -Skip 1
# Adjust the Markdown formatting for the AMO listing.
for ($i = 0; $i -lt $changes.count; $i++) {
    $changes[$i] = $changes[$i] -replace '^#+\s(.*)$', '**$1**'
}
$changes = ($changes | Out-String).Trim()

$metadata.version.release_notes."en-US" = "$changes"
New-Item -ItemType File -Path output -Name amo-metadata.json -Value ($metadata | ConvertTo-Json) -Force | Out-Null

Write-Output "Done."
Write-Output "Formatting metadata file..."

./node_modules/.bin/prettier --ignore-path .prettierignore output/amo-metadata.json --write --log-level silent

Write-Output "Done."
