Write-Output "Linting source code..."

$result = ./node_modules/.bin/web-ext lint --output json --pretty --ignore-files lib/ tools/ | ConvertFrom-Json

Write-Output "Errors: $($result.summary.errors)."
Write-Output "Notices: $($result.summary.notices)."
Write-Output "Warnings: $($result.summary.warnings)."

if ($result.summary.errors -eq 0 -and $result.summary.notices -eq 0 -and $result.summary.warnings -eq 0) {
    exit 0
}
else {
    exit 1
}
