Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "D:\AI Automation"
' Chạy node sync_engine.mjs --watch ở chế độ ẩn (0 = ẩn hoàn toàn cửa sổ)
WshShell.Run "node sync_engine.mjs --watch", 0, False
