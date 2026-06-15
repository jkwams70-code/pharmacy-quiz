param(
  [Parameter(Mandatory = $false)]
  [string]$Message = "chore: update deployment",

  [Parameter(Mandatory = $false)]
  [string]$Server = "root@139.84.233.243",

  [Parameter(Mandatory = $false)]
  [string]$Branch = "deploy-baseline"
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Step 1/2: Push to GitHub"
powershell -ExecutionPolicy Bypass -File "$scriptRoot\deploy-push.ps1" -Message "$Message" -Branch "$Branch"

Write-Host "Step 2/2: Deploy on VPS ($Server)"
ssh $Server "cd /opt/pharmacy-quiz && git fetch origin && git checkout $Branch && git pull --ff-only origin $Branch && chmod +x scripts/vps-deploy.sh && ./scripts/vps-deploy.sh $Branch"

Write-Host "Done."
