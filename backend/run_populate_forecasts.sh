#!/bin/bash
# Shell script to populate medicine forecasts on Linux/Mac
# This script activates the virtual environment and runs the populate script

echo "========================================"
echo " Populate Medicine Forecasts"
echo "========================================"
echo ""

# Change to the script's directory
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ -d "../.venv" ]; then
    echo "Activating virtual environment..."
    source ../.venv/bin/activate
elif [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
else
    echo "WARNING: Virtual environment not found"
    echo "Using system Python..."
fi

echo ""
echo "Running forecast population script..."
echo ""

# Run the script with default parameters (change as needed)
python3 populate_forecasts.py "$@"

echo ""
echo "========================================"
echo " Script completed!"
echo "========================================"
