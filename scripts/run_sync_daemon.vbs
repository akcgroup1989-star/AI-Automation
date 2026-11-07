Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "D:\AI Automation"
' Chạy node sync_engine.mjs --watch ẩn hoàn toàn trong nền (0 = ẩn cửa sổ)
WshShell.Run """C:\Program Files\nodejs\node.exe"" sync_engine.mjs --watch", 0, False
