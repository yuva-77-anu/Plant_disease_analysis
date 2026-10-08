@echo off
echo ==========================================
echo   PlantGuard Setup Script
echo ==========================================
echo.

echo [1/4] Creating Python virtual environment...
cd backend
python -m venv venv
call venv\Scripts\activate
echo Virtual environment created.
echo.

echo [2/4] Installing Python dependencies...
pip install -r requirements.txt
echo Python dependencies installed.
echo.

echo [3/4] Setting up database...
echo Please ensure MySQL is running, then execute:
echo   mysql -u root -p ^< ..\database\schema.sql
echo.
pause

echo [4/4] Setting up frontend...
cd ..\frontend
call npm install
echo Frontend dependencies installed.
echo.

echo ==========================================
echo   Setup Complete!
echo ==========================================
echo.
echo To run the application:
echo   1. Backend: cd backend && venv\Scripts\activate && python app.py
echo   2. Frontend: cd frontend && npm start
echo.
echo Make sure to configure backend\.env with your MySQL credentials.
pause
