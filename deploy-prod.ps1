# ==============================================================================
# Script tự động triển khai CD trên Local Docker Engine (PowerShell)
# Cách chạy: .\deploy-prod.ps1 -DockerHubUser "your-username"
# ==============================================================================
param (
    [string]$DockerHubUser = $env:DOCKERHUB_USERNAME
)

if (-not $DockerHubUser) {
    Write-Host "Vui lòng nhập Docker Hub Username (hoặc gán biến môi trường DOCKERHUB_USERNAME):" -ForegroundColor Yellow
    $DockerHubUser = Read-Host "Docker Hub Username"
}

$env:DOCKERHUB_USERNAME = $DockerHubUser

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Triển khai Product API từ Docker Hub về Local Docker Engine" -ForegroundColor Cyan
Write-Host " User Docker Hub: $DockerHubUser" -ForegroundColor Green
Write-Host " Image: $DockerHubUser/product-api:latest" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

Write-Host "[1/4] Kéo image mới nhất từ Docker Hub..." -ForegroundColor Yellow
docker pull "$DockerHubUser/product-api:latest"

Write-Host "[2/4] Khởi động stack bằng docker-compose-prod.yaml..." -ForegroundColor Yellow
docker compose -f docker-compose-prod.yaml up -d

Write-Host "[3/4] Đang kiểm tra trạng thái Healthcheck..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
docker compose -f docker-compose-prod.yaml ps

Write-Host "[4/4] Gọi endpoint /health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get -TimeoutSec 5
    Write-Host "Kết quả Healthcheck:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 4
} catch {
    Write-Host "Chưa kết nối được ngay tới /health, container đang khởi động..." -ForegroundColor Yellow
}

Write-Host "Triển khai hoàn tất! Watchtower đang tự động theo dõi các bản cập nhật mới từ Docker Hub." -ForegroundColor Green
