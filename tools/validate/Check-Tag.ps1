param(
    [Parameter(Mandatory = $true)]
    [string]$Ref
)

Write-Output "Ref: $Ref."

$tag = "$Ref" -replace "refs/tags/", ""

Write-Output "Version number: $tag."

if ($tag -match "(?!0.0.0)^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$") {
    Write-Output "Version number $tag is valid."
    Write-Output "VERSION_NUMBER=$tag" >> $env:GITHUB_ENV
    Write-Output "VERSION_NUMBER=$tag" >> $env:GITHUB_OUTPUT
    exit 0
}
else {
    Write-Output "Version number $tag is not valid."
    exit 1
}
