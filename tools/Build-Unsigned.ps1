param(
    [Parameter(Mandatory = $true)]
    [string]$XPIFilename
)

./node_modules/.bin/web-ext build --config=./tools/settings/.web-ext-config.mjs --artifacts-dir output --filename "$XPIFilename"
