@echo off
REM Batch script to populate medicine forecasts on Windows
REM This script activates the virtual environment and runs the populate script

echo ========================================
echo  Populate Medicine Forecasts
echo ========================================
echo.

REM Change to the backend directory
cd /d "%~dp0"

REM Check if virtual environment exists
if exist "..\\.venv\\Scripts\\activate.bat" (
    echo Activating virtual environment...
    call "..\\.venv\\Scripts\\activate.bat"
) else if exist "venv\\Scripts\\activate.bat" (
    echo Activating virtual environment...
    call "venv\\Scripts\\activate.bat"
) else (
    echo WARNING: Virtual environment not found
    echo Using system Python...
)

echo.
echo Running forecast population script...
echo.

REM Run the script with default parameters (change as needed)
python populate_forecasts.py

echo.
echo ========================================
echo  Script completed!
echo ========================================
echo.

pause
