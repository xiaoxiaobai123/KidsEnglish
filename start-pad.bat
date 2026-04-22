@echo off
REM ============================================================
REM englishkids · MatePad/局域网一键启动
REM 双击这个文件就跑,允许防火墙后 MatePad 浏览器访问下面 IP 即可
REM ============================================================
chcp 65001 >nul 2>&1
title englishkids · LAN server (port 5173)

cd /d "%~dp0"

echo.
echo ============================================================
echo  🚀 englishkids 局域网服务启动中...
echo ============================================================
echo.
echo  📡 你的电脑在局域网的 IP(挑一个能 ping 通的试):
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  echo     http://%%a:5173/index.html
)
echo.
echo ============================================================
echo  📱 在 MatePad 浏览器里输入上面的 URL(去掉前面空格)
echo  ⚠️  电脑和 pad 必须连同一个 WiFi
echo  ⚠️  Windows 首次运行会弹防火墙窗口,要选"允许访问"
echo  ⚠️  要停止,按 Ctrl+C 或直接关掉这个黑窗口
echo ============================================================
echo.

python -m http.server 5173 --bind 0.0.0.0

pause
