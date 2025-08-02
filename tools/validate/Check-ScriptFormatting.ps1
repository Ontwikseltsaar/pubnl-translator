param(
    [switch]$Overwrite
)

Write-Output "Checking PowerShell script formatting..."

$errorFound = $false

Get-ChildItem -Recurse -Path tools/*.ps1 | ForEach-Object {
    $script = Get-Content -Raw $_
    
    if ($script -eq $null) {
        return
    }
    
    $formattedScript = Invoke-Formatter -ScriptDefinition $script -Settings ./tools/settings/ScriptFormatting.psd1
    
    if ($formattedScript -ne $script) {
        $errorFound = $true
        
        if ($Overwrite) {
            Set-Content -Path $_ -Value $formattedScript.Trim()
            Write-Output "Fixed formatting errors in $_."
        }
        else {
            Write-Output "Formatting errors found in $_."
        }
    }
}

if ($errorFound) {
    exit 1
}
else {
    Write-Output "No formatting problems found in PowerShell scripts."
    exit 0
}
