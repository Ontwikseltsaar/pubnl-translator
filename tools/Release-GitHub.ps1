param(
    [Parameter(Mandatory = $true)]
    [string]$XPIFilename,
    [Parameter(Mandatory = $true)]
    [string]$Version,
    [switch]$Signed
)

$overwrite = $Signed -and ((gh release list --json tagName | ConvertFrom-Json).tagName -contains "$Version")
if ($overwrite) {
    Write-Output "Updating release notes for $Version..."
    if (gh release edit $Version --notes-file output/release.md) {
        Write-Output "Done."
    }
    else {
        Write-Output "Error updating release notes for GitHub release $Version. Skipping..."
    }
            
    Write-Output "Deleting asset pubnl-translator-$Version.xpi from release $Version..."
    gh release delete-asset $Version pubnl-translator-$Version.xpi --yes
    if ($LastExitCode -eq 0) {
        Write-Output "Done."
    }
    else {
        Write-Output "Error deleting asset pubnl-translator-$Version.xpi from GitHub release $Version. Skipping..."
    }
            
    Write-Output "Uploading asset $XPIFilename to release $Version..."
    gh release upload $Version output/$XPIFilename
    if ($LastExitCode -eq 0) {
        Write-Output "Done."
    }
    else {
        Write-Output "Error uploading asset $XPIFilename to GitHub release $Version."
    }
}
else {
    Write-Output "Creating release $Version..."
    if (gh release create $Version output/$XPIFilename --notes-file output/release.md) {
        Write-Output "Done."
    }
    else {
        Write-Output "Error creating GitHub release $Version."
    }
}
