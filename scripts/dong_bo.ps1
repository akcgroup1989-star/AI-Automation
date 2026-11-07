[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
try {
    $Host.UI.RawUI.WindowTitle = "AKC FITNESS - HE THONG DONG BO 2 CHIEU AI AUTOMATION"
} catch {}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
Set-Location -LiteralPath $rootDir

function Show-Header {
    try { Clear-Host } catch {}
    Write-Host "=====================================================================" -ForegroundColor Cyan
    Write-Host "          AKC FITNESS - HỆ THỐNG ĐỒNG BỘ 2 CHIỀU TỰ ĐỘNG" -ForegroundColor Cyan
    Write-Host "   Máy trạm Windows (D:\AI Automation) <====> GitHub (akcgroup1989-star)" -ForegroundColor Cyan
    Write-Host "=====================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Run-SyncOnce {
    Show-Header
    Write-Host "⏳ Đang tiến hành đồng bộ 2 chiều với GitHub..." -ForegroundColor Yellow
    node ".\sync_engine.mjs"
    Write-Host ""
    Read-Host "Nhấn Enter để quay lại menu chính..."
}

function Run-AutoWatch {
    Show-Header
    Write-Host "🚀 ĐANG KÍCH HOẠT CHẾ ĐỘ TỰ ĐỘNG ĐỒNG BỘ LIÊN TỤC..." -ForegroundColor Green
    Write-Host "(Hệ thống tự động kiểm tra và đồng bộ mỗi 60 giây. Nhấn Ctrl+C để dừng)" -ForegroundColor Yellow
    Write-Host ""
    node ".\sync_engine.mjs" --watch
}

function Install-Startup {
    Show-Header
    Write-Host "⚙️ Đang thiết lập tự động khởi động cùng Windows..." -ForegroundColor Yellow
    try {
        $startupFolder = [Environment]::GetFolderPath('Startup')
        $shortcutPath = Join-Path $startupFolder "AKC_AI_Automation_Sync.lnk"
        $ws = New-Object -ComObject WScript.Shell
        $s = $ws.CreateShortcut($shortcutPath)
        $s.TargetPath = "wscript.exe"
        $s.Arguments = "`"$rootDir\scripts\run_sync_daemon.vbs`""
        $s.WorkingDirectory = $rootDir
        $s.WindowStyle = 7
        $s.Save()
        # Kích hoạt chạy ngầm ngay lập tức mà không cần đợi khởi động lại máy
        Start-Process -FilePath "wscript.exe" -ArgumentList "`"$rootDir\scripts\run_sync_daemon.vbs`"" -WorkingDirectory $rootDir
        Write-Host " [THÀNH CÔNG] Đã đăng ký thành công vào Windows Startup!" -ForegroundColor Green
        Write-Host " [ĐANG CHẠY] Tiến trình đồng bộ ngầm đã được KÍCH HOẠT CHẠY NGAY BÂY GIỜ!" -ForegroundColor Cyan
        Write-Host " Từ nay, mỗi khi Sếp bật máy tính, hệ thống cũng sẽ tự động chạy ngầm." -ForegroundColor White
    } catch {
        Write-Host " [LỖI] Không thể cài đặt: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
    Read-Host "Nhấn Enter để quay lại menu chính..."
}

function Uninstall-Startup {
    Show-Header
    $startupFolder = [Environment]::GetFolderPath('Startup')
    $shortcutPath = Join-Path $startupFolder "AKC_AI_Automation_Sync.lnk"
    if (Test-Path -LiteralPath $shortcutPath) {
        Remove-Item -LiteralPath $shortcutPath -Force
        Write-Host " [ĐÃ XÓA] Đã gỡ bỏ tính năng tự động chạy cùng Windows." -ForegroundColor Yellow
    } else {
        Write-Host " [THÔNG BÁO] Tính năng tự động chạy cùng Windows hiện chưa được bật." -ForegroundColor Cyan
    }
    Write-Host ""
    Read-Host "Nhấn Enter để quay lại menu chính..."
}

# Vòng lặp Menu chính
while ($true) {
    Show-Header
    Write-Host "[1] Đồng bộ 2 chiều NGAY BÂY GIỜ (Chạy 1 lần)" -ForegroundColor White
    Write-Host "[2] Bật chế độ TỰ ĐỘNG ĐỒNG BỘ LIÊN TỤC (Mỗi 60 giây)" -ForegroundColor White
    Write-Host "[3] Cài đặt TỰ ĐỘNG CHẠY NGẦM KHI BẬT MÁY TÍNH (Khuyến nghị)" -ForegroundColor Green
    Write-Host "[4] Hủy tự động chạy cùng Windows" -ForegroundColor Yellow
    Write-Host "[0] Thoát" -ForegroundColor Gray
    Write-Host ""
    $opt = Read-Host ">>> Xin mời Sếp Ricky chọn [1/2/3/4/0]"

    switch ($opt.Trim()) {
        "1" { Run-SyncOnce }
        "2" { Run-AutoWatch }
        "3" { Install-Startup }
        "4" { Uninstall-Startup }
        "0" { exit }
        default {
            Write-Host "Lựa chọn không hợp lệ, vui lòng chọn lại..." -ForegroundColor Red
            Start-Sleep -Seconds 1
        }
    }
}
