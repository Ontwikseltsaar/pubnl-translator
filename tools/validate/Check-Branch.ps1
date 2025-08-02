param(
    [Parameter(Mandatory = $true)]
    [string]$DefaultBranch,
    [Parameter(Mandatory = $true)]
    [string]$Tag
)

$defaultBranchRemote = "origin/$DefaultBranch"
$defaultContainsTag = (git branch -r --contains "$Tag" --list $defaultBranchRemote --format "%(refname:short)") -eq $defaultBranchRemote

if ($defaultContainsTag) {
    Write-Output "Default branch $DefaultBranch contains tag $Tag."
    exit 0
}
else {
    Write-Output "Default branch $DefaultBranch does not contain tag $Tag."
    exit 1
}
