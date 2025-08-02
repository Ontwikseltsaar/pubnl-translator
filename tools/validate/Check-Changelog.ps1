param(
    [Parameter(Mandatory = $true)]
    [string]$Version
)

if (Test-Path CHANGELOG.md) {
    $startPattern = "# $Version"
    $fromHeader = (Get-Content CHANGELOG.md).Where({ $_ -match "^$startPattern`$" }, 'SkipUntil')
    
    if ($fromHeader.count -eq 0) {
        Write-Output "Header for version $Version not found in CHANGELOG.md."
        exit 1
    }
    
    if ($fromHeader.Where({ $_ -match '^---$' }).count -eq 0) {
        Write-Output "Horizontal rule for version $Version not found in CHANGELOG.md."
        exit 1
    }
    
    Write-Output "Changes for version $Version found in CHANGELOG.md."
    exit 0
}
else {
    Write-Output "CHANGELOG.md not found."
    exit 1
}
