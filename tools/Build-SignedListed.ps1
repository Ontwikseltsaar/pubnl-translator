param(
    [Parameter(Mandatory = $true)]
    [string]$Key,
    [Parameter(Mandatory = $true)]
    [string]$Secret
)

./node_modules/.bin/web-ext sign --channel=listed --api-key=$Key --api-secret=$Secret --config=./tools/settings/.web-ext-config.mjs --approval-timeout 0 --amo-metadata output/amo-metadata.json
