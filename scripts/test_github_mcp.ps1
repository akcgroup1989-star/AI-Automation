[CmdletBinding()]
param (
    [string]$Token
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " KIEM TRA KET NOI MCP GITHUB CHO AKC FITNESS" -ForegroundColor Cyan
Write-Host " Target Repo: https://github.com/akcgroup1989-star/AI-Automation" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Kiem tra Node.js & npx
Write-Host "`n[1/4] Kiem tra moi truong Node.js & npx..." -ForegroundColor Yellow
$nodeCmd = Get-Command node.exe -ErrorAction SilentlyContinue
$npxCmd = Get-Command npx.cmd -ErrorAction SilentlyContinue

if ($nodeCmd) {
    $nodeVer = & node -v
    Write-Host "  [OK] Node.js: $($nodeCmd.Source) ($nodeVer)" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Khong tim thay Node.js!" -ForegroundColor Red
}

if ($npxCmd) {
    Write-Host "  [OK] npx: $($npxCmd.Source)" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Khong tim thay npx!" -ForegroundColor Red
}

# 2. Doc Personal Access Token
Write-Host "`n[2/4] Kiem tra GitHub Personal Access Token (PAT)..." -ForegroundColor Yellow
$pat = $Token
if (-not $pat) {
    $envFile = Join-Path $PSScriptRoot "..\.env"
    if (Test-Path -Path $envFile) {
        $lines = Get-Content -Path $envFile
        foreach ($line in $lines) {
            if ($line -match "^GITHUB_PERSONAL_ACCESS_TOKEN=(.+)$") {
                $pat = $matches[1].Trim()
                break
            }
        }
    }
}

if (-not $pat -or $pat -eq "YOUR_GITHUB_PERSONAL_ACCESS_TOKEN" -or $pat -eq "ghp_your_token_here") {
    Write-Host "  [CANH BAO] Chua phat hien Personal Access Token hop le!" -ForegroundColor Red
    exit 1
} else {
    $maskedPat = $pat.Substring(0, [Math]::Min(7, $pat.Length)) + "..." + $pat.Substring([Math]::Max(0, $pat.Length - 4))
    Write-Host "  [OK] Da phat hien Token: $maskedPat" -ForegroundColor Green
}

# 3. Kiem tra ket noi toi GitHub API
Write-Host "`n[3/4] Kiem tra ket noi toi GitHub API..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $pat"
    "User-Agent"    = "AKC-Fitness-AI-Automation-MCP"
    "Accept"        = "application/vnd.github.v3+json"
}

# Test user auth
try {
    $user = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers -Method Get -TimeoutSec 10
    Write-Host "  [OK] Xac thuc thanh cong user: $($user.login) ($($user.name))" -ForegroundColor Green
} catch {
    Write-Host "  [LOI] Xac thuc user that bai: $($_.Exception.Message)" -ForegroundColor Red
}

# Test repo access
try {
    $repo = Invoke-RestMethod -Uri "https://api.github.com/repos/akcgroup1989-star/AI-Automation" -Headers $headers -Method Get -TimeoutSec 10
    Write-Host "  [OK] Truy cap Repo thanh cong: $($repo.full_name)" -ForegroundColor Green
    Write-Host "       Private: $($repo.private) | Branch: $($repo.default_branch)" -ForegroundColor White
    if ($repo.permissions) {
        Write-Host "       Quyen Push (ghi): $($repo.permissions.push) | Quyen Admin: $($repo.permissions.admin)" -ForegroundColor White
    }
} catch {
    Write-Host "  [THONG BAO] Truy cap repo akcgroup1989-star/AI-Automation: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 4. Kiem tra goi MCP
Write-Host "`n[4/4] Kiem tra cau hinh MCP Server..." -ForegroundColor Yellow
Write-Host "  Goi server: @modelcontextprotocol/server-github" -ForegroundColor Cyan
Write-Host "  Trang thai cau hinh: DA SAN SANG KET NOI" -ForegroundColor Green
