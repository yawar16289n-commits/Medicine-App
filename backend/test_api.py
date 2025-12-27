"""Test script to verify all API endpoints work correctly"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000/api"

def test_endpoint(method, endpoint, data=None, description=""):
    """Test an API endpoint and print results"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        
        print(f"\n{'='*60}")
        print(f"{description}")
        print(f"{method} {endpoint}")
        print(f"Status: {response.status_code}")
        
        if response.status_code < 400:
            result = response.json()
            print(f"Response: {json.dumps(result, indent=2)[:500]}...")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ ERROR: Cannot connect to {url}")
        print("   Backend server is not running!")
        return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def main():
    print("Testing Backend API Endpoints")
    print("="*60)
    
    tests_passed = 0
    tests_failed = 0
    
    # Test Districts
    if test_endpoint("GET", "/districts", description="Test 1: Get all districts"):
        tests_passed += 1
    else:
        tests_failed += 1
    
    # Test Formulas
    if test_endpoint("GET", "/formulas", description="Test 2: Get all formulas"):
        tests_passed += 1
    else:
        tests_failed += 1
    
    # Test Medicines
    if test_endpoint("GET", "/medicines", description="Test 3: Get all medicines (grouped by formula)"):
        tests_passed += 1
    else:
        tests_failed += 1
    
    # Test Weather
    if test_endpoint("GET", "/weather", description="Test 4: Get weather data"):
        tests_passed += 1
    else:
        tests_failed += 1
    
    print(f"\n{'='*60}")
    print(f"RESULTS: {tests_passed} passed, {tests_failed} failed")
    print(f"{'='*60}")
    
    if tests_failed > 0:
        print("\n⚠️  Some tests failed. Backend may not be running or has errors.")
        return False
    else:
        print("\n✅ All tests passed! Backend is working correctly.")
        return True

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)
