param(
    [Parameter(Mandatory = $true)]
    [string]$SubscriptionId,
    [string]$ResourceGroup = 'rg-healthcorebruna-prod',
    [string]$StorageAccount = 'hcbrunamedia2026'
)

$ErrorActionPreference = 'Stop'
$key = az storage account keys list --subscription $SubscriptionId --resource-group $ResourceGroup --account-name $StorageAccount --query '[0].value' -o tsv
if ($LASTEXITCODE -ne 0 -or -not $key) { throw 'Could not access monitoring storage.' }

foreach ($directory in @('datasources', 'dashboards')) {
    az storage directory create --account-name $StorageAccount --account-key $key --share-name grafana-config --name $directory --only-show-errors --output none
    if ($LASTEXITCODE -ne 0) { throw "Could not create $directory." }
}

$repository = Split-Path $PSScriptRoot -Parent
$files = @(
    @{ Share = 'prometheus-config'; Source = 'prometheus/prometheus.yml'; Destination = 'prometheus.yml' },
    @{ Share = 'grafana-config'; Source = 'grafana/provisioning/datasources/prometheus.yml'; Destination = 'datasources/prometheus.yml' },
    @{ Share = 'grafana-config'; Source = 'grafana/provisioning/dashboards/dashboard.yml'; Destination = 'dashboards/dashboard.yml' },
    @{ Share = 'grafana-config'; Source = 'grafana/provisioning/dashboards/django-metrics.json'; Destination = 'dashboards/django-metrics.json' }
)

foreach ($file in $files) {
    $source = Join-Path $repository $file.Source
    az storage file upload --account-name $StorageAccount --account-key $key --share-name $file.Share --source $source --path $file.Destination --only-show-errors --output none
    if ($LASTEXITCODE -ne 0) { throw "Could not upload $($file.Source)." }
}

Write-Output 'Monitoring configuration uploaded. Restart the Grafana and Prometheus revisions when deploying to a fresh environment.'
