@echo off
chcp 65001 >nul
title AI AUTOMATION — ĐỒNG BỘ 2 CHIỀU VỚI GITHUB
color 0B

echo =====================================================================
echo           AKC FITNESS — HỆ THỐNG ĐỒNG BỘ 2 CHIỀU TỰ ĐỘNG
echo   Máy trạm Windows (D:\AI Automation) ^<====^> GitHub (akcgroup1989-star)
echo =====================================================================
echo.

cd /d "%~dp0"

if "%1"=="--watch" goto AUTO_WATCH
if "%1"=="--silent" goto AUTO_SILENT

echo [1] Đồng bộ 2 chiều NGAY BÂY GIỜ (Chạy 1 lần)
echo [2] Bật chế độ TỰ ĐỘNG ĐỒNG BỘ LIÊN TỤC (Mỗi 60 giây)
echo [3] Cài đặt TỰ ĐỘNG CHẠY NGẦM KHI BẬT MÁY TÍNH (Windows Startup)
echo [4] Hủy tự động chạy cùng Windows
echo [0] Thoát
echo.
set /p opt=">>> Xin mời Sếp Ricky chọn [1/2/3/4/0]: "

if "%opt%"=="1" goto SYNC_ONCE
if "%opt%"=="2" goto AUTO_WATCH
if "%opt%"=="3" goto INSTALL_STARTUP
if "%opt%"=="4" goto UNINSTALL_STARTUP
if "%opt%"=="0" exit
goto EXIT

:SYNC_ONCE
echo.
echo ⏳ Đang tiến hành đồng bộ 2 chiều...
node sync_engine.mjs
echo.
echo Nhấn phím bất kỳ để đóng cửa sổ...
pause >nul
goto EXIT

:AUTO_WATCH
echo.
echo 🚀 ĐANG KÍCH HOẠT CHẾ ĐỘ TỰ ĐỘNG ĐỒNG BỘ LIÊN TỤC...
echo (Cửa sổ này sẽ tự động kiểm tra và đồng bộ mỗi 60 giây. Giữ cửa sổ hoặc thu nhỏ xuống thanh taskbar)
node sync_engine.mjs --watch
pause
goto EXIT

:INSTALL_STARTUP
echo.
echo ⚙️ Đang thiết lập tự động khởi động cùng Windows...
powershell -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([Environment]::GetFolderPath('Startup') + '\AKC_AI_Automation_Sync.lnk'); $s.TargetPath = 'wscript.exe'; $s.Arguments = '\"%~dp0scripts\run_sync_daemon.vbs\"'; $s.WorkingDirectory = '%~dp0'; $s.WindowStyle = 7; $s.Save(); Write-Host ' [THÀNH CÔNG] Đã thêm vào thư mục Windows Startup!' -ForegroundColor Green"
echo.
echo Sếp Ricky có thể yên tâm: Mỗi khi mở máy tính, hệ thống sẽ tự động đồng bộ ngầm!
pause
goto EXIT

:UNINSTALL_STARTUP
echo.
powershell -ExecutionPolicy Bypass -Command "$path = [Environment]::GetFolderPath('Startup') + '\AKC_AI_Automation_Sync.lnk'; if (Test-Path $path) { Remove-Item $path; Write-Host ' [ĐÃ XÓA] Đã hủy tự động chạy cùng Windows!' -ForegroundColor Yellow } else { Write-Host ' [THÔNG BÁO] Chưa cài đặt chạy cùng Windows.' -ForegroundColor Cyan }"
pause
goto EXIT

:EXIT
