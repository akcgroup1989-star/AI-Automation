@echo off
chcp 65001 >nul
title AKC Fitness - AI Automation Telegram Bot
echo =========================================================
echo   AKC FITNESS — BOT ĐIỀU HÀNH & GIAO VIỆC TELEGRAM
echo   Tổng chỉ huy: AI Automation | Lãnh đạo: Sếp Ricky
echo =========================================================
echo.
cd /d "%~dp0"
node telegram_bot/bot.mjs
pause
