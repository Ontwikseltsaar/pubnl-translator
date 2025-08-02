param(
    [Parameter(Mandatory = $true)]
    [string]$InstructionsFilepath,
    [Parameter(Mandatory = $true)]
    [string]$XPIFilename,
    [Parameter(Mandatory = $true)]
    [string]$Version
)

$instructionsFilename = Split-Path $InstructionsFilepath -Leaf

if ((Test-Path CHANGELOG.md) -and (Test-Path $InstructionsFilepath)) {
    Write-Output "CHANGELOG.md and $instructionsFilename found. Creating release notes for version $Version..."
    
    $startPattern = "# $Version"
    
    $changes = (Get-Content CHANGELOG.md).Where({ $_ -match "^$startPattern`$" }, 'SkipUntil').Where({ $_ -match "^---$" }, 'Until') | Select-Object -Skip 1
    $line = "---"
    $instructions = (Get-Content -Raw $InstructionsFilepath) -replace "%xpi_file%", "$XPIFilename"
    
    New-Item -ItemType File -Path output -Name release.md -Value (($changes + $line + $instructions) | Out-String) -Force | Out-Null
    
    ./node_modules/.bin/prettier --ignore-path .prettierignore output/release.md --write --log-level silent
    
    Write-Output "Done."
    exit 0
}
else {
    Write-Output "CHANGELOG.md or $instructionsFilename not found."
    exit 1
}
