param(
    [Parameter(Mandatory = $true)]
    [string]$Version
)

$versionFromManifest = (Get-Content -Raw manifest.json | ConvertFrom-Json).version

if ($versionFromManifest -eq "$Version") {
    Write-Output "Version numbers in manifest.json and tag are both $versionFromManifest."
    exit 0
}
else {
    Write-Output "Version number in manifest.json is $versionFromManifest, but the tag is $Version."
    exit 1
}
