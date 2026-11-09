@echo off
REM Serves this folder on http://localhost:8080 and opens it, so the 3D coins and the Ratings pages can load.
cd /d "%~dp0"
start "" "http://localhost:8080/index.html"
python -m http.server 8080
