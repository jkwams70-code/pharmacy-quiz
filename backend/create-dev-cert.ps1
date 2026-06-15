param(
  [string]$DnsName = "localhost",
  [string]$OutputPath = "",
  [string]$Password = "quiz-local-dev"
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
  $OutputPath = Join-Path $PSScriptRoot "certs\localhost-dev.pfx"
}

$certDir = Split-Path -Parent $OutputPath
if (-not (Test-Path $certDir)) {
  New-Item -Path $certDir -ItemType Directory -Force | Out-Null
}

$securePassword = ConvertTo-SecureString -String $Password -AsPlainText -Force

$cert = New-SelfSignedCertificate `
  -DnsName $DnsName `
  -CertStoreLocation "Cert:\CurrentUser\My" `
  -FriendlyName "Pharmacy Quiz Local Dev TLS" `
  -KeyAlgorithm RSA `
  -KeyLength 2048 `
  -NotAfter (Get-Date).AddYears(2)

Export-PfxCertificate `
  -Cert "Cert:\CurrentUser\My\$($cert.Thumbprint)" `
  -FilePath $OutputPath `
  -Password $securePassword | Out-Null

Write-Output "Generated TLS certificate:"
Write-Output "  DNS Name : $DnsName"
Write-Output "  PFX Path : $OutputPath"
Write-Output "  Password : $Password"
