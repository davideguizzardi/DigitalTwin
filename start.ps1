param(
    [switch] $NoBuild,
    [switch] $Logs
)

$ErrorActionPreference = "Stop"
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
    $PSNativeCommandUseErrorActionPreference = $false
}

function Get-DotEnvValue {
    param(
        [string] $Path,
        [string] $Name
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        return $null
    }

    $line = Get-Content -LiteralPath $Path |
        Where-Object { $_ -match "^\s*$([regex]::Escape($Name))=" } |
        Select-Object -First 1

    if (-not $line) {
        return $null
    }

    return ($line -replace "^\s*$([regex]::Escape($Name))=", "").Trim("'`" ")
}

function Set-EnvDefault {
    param(
        [string] $Name,
        [string] $Value
    )

    if (-not [Environment]::GetEnvironmentVariable($Name, "Process")) {
        [Environment]::SetEnvironmentVariable($Name, $Value, "Process")
    }
}

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

$composeFile = if (Test-Path -LiteralPath "docker-composefull.yml") {
    "docker-composefull.yml"
} elseif (Test-Path -LiteralPath "docker-compose.yml") {
    "docker-compose.yml"
} else {
    Write-Host "Nessun file docker-compose trovato nella cartella del progetto." -ForegroundColor Red
    exit 1
}

$previousErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = "SilentlyContinue"
& docker info 1>$null 2>$null
$dockerInfoExitCode = $LASTEXITCODE
$ErrorActionPreference = $previousErrorActionPreference
if ($dockerInfoExitCode -ne 0) {
    Write-Host "Docker non risponde. Avvia Docker Desktop e riprova." -ForegroundColor Red
    exit 1
}

$appPort = Get-DotEnvValue -Path ".env" -Name "APP_PORT"
if (-not $appPort) {
    $appPort = "8080"
}

Set-EnvDefault -Name "APP_PORT" -Value $appPort
Set-EnvDefault -Name "WWWUSER" -Value "1000"
Set-EnvDefault -Name "WWWGROUP" -Value "1000"

New-Item -ItemType Directory -Force -Path "homeassistant/config" | Out-Null
New-Item -ItemType Directory -Force -Path "Materiale_non_progetto/Home Assistant" | Out-Null

$arguments = @("compose", "-f", $composeFile, "up", "-d")
if (-not $NoBuild) {
    $arguments += "--build"
}

Write-Host "Avvio Digital Twin con $composeFile..."
& docker @arguments
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

& docker compose -f $composeFile exec -T laravel.test sh -lc "if [ ! -x node_modules/.bin/vite ]; then npm ci; fi; if ! pgrep -f 'node.*vite' > /dev/null; then nohup npm run dev -- --host 0.0.0.0 > /tmp/vite.log 2>&1 & fi"
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Progetto avviato:"
Write-Host "  Frontend:       http://localhost:$appPort"
Write-Host "  API DigitalTwin: http://localhost:8000"
Write-Host "  Home Assistant: http://localhost:8123"
Write-Host "  Mailpit:        http://localhost:8025"

if ($Logs) {
    & docker compose -f $composeFile logs -f
}
