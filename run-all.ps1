#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting required infra (Postgres + Redis) with Docker..."
try {
    docker compose up -d
} catch {
    Write-Warning "docker compose failed; trying docker-compose..."
    docker-compose up -d
}

Write-Host "Opening services in new PowerShell windows..."

# Backend (NestJS)
Start-Process powershell -ArgumentList @('-NoExit', "-Command cd '$root\\backend'; npm run start:dev")

# AI service (FastAPI)
Start-Process powershell -ArgumentList @('-NoExit', "-Command cd '$root\\ai-service'; python -m uvicorn app.main:app --reload --port 8000")

# Mobile (Expo)
Start-Process powershell -ArgumentList @('-NoExit', "-Command cd '$root\\mobile'; npm run start")

Write-Host "All start commands issued. Check the new terminal windows for logs."
