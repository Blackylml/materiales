@echo off
cd /d "C:\Users\Serv System\Desktop\calidad"
waitress-serve --host=0.0.0.0 --port=5000 app:app
pause