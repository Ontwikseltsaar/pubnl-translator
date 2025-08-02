Write-Output "Checking PowerShell script code..."

$errorFound = $false

$maxLength = 0

Get-ChildItem -Recurse -Path tools/*.ps1 | ForEach-Object {
    if ($maxLength -lt $_.FullName.length) {
        $maxLength = $_.FullName.length
    }
}

Get-ChildItem -Recurse -Path tools/*.ps1 | ForEach-Object {
    Write-Host "$($_.FullName): ".PadRight($maxLength + 2, " ") -NoNewLine
    if (Invoke-ScriptAnalyzer -Path $_ -Settings ./tools/settings/ScriptAnalysis.psd1 -ReportSummary) {
        $errorFound = $true
    }
}

if ($errorFound) {
    Write-Output "Code problems found in PowerShell scripts."
    exit 1
}
else {
    Write-Output "No code problems found in PowerShell scripts."
    exit 0
}
