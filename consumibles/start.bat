@echo off
cd /d "C:\Users\Serv System\Desktop\calidad\consumibles"
waitress-serve --host=0.0.0.0 --port=5001 app:app
pause