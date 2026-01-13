"""
Test script for district_medicine_lookup auto-management
Run this after starting the backend server to test the functionality
"""

import requests
import json
from datetime import date

BASE_URL = "http://127.0.0.1:5001/api"

# You'll need to get a valid token first by logging in
# Replace this with your actual token
TOKEN = "your-jwt-token-here"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}


def test_create_sales():
    """Test creating a sales record"""
    print("\n=== Test 1: Create Sales Record ===")
    data = {
        "medicineId": 1,  # Replace with actual medicine ID
        "districtId": 1,  # Replace with actual district ID
        "date": date.today().isoformat(),
        "saleQuantity": 50
    }
    
    response = requests.post(f"{BASE_URL}/medicines/sales", json=data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201:
        return response.json()['salesRecord']['id']
    return None


def test_lookup_exists(district_id, medicine_id):
    """Check if lookup entry exists"""
    print(f"\n=== Checking Lookup Table for District={district_id}, Medicine={medicine_id} ===")
    # You can query the database directly or create an endpoint to check
    print("Query district_medicine_lookup table in your database to verify")


def test_delete_sales(sales_id):
    """Test deleting a sales record"""
    print(f"\n=== Test 2: Delete Sales Record (ID={sales_id}) ===")
    
    response = requests.delete(f"{BASE_URL}/medicines/sales/{sales_id}", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_upload_sales():
    """Test uploading sales data from file"""
    print("\n=== Test 3: Upload Sales File ===")
    
    # Create a test CSV file first
    csv_content = """Date,Area,Formula,Medicine Name/ID,Sale Quantity
2026-01-12,Karachi,Paracetamol,Panadol,100
2026-01-12,Lahore,Paracetamol,Panadol,150
"""
    
    with open('test_sales.csv', 'w') as f:
        f.write(csv_content)
    
    files = {'file': open('test_sales.csv', 'rb')}
    response = requests.post(
        f"{BASE_URL}/medicines/sales/upload", 
        files=files,
        headers={"Authorization": f"Bearer {TOKEN}"}  # No content-type for multipart
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def run_comprehensive_test():
    """Run a comprehensive test of the functionality"""
    print("=" * 60)
    print("DISTRICT MEDICINE LOOKUP AUTO-MANAGEMENT TEST")
    print("=" * 60)
    
    print("\nPREREQUISITES:")
    print("1. Backend server must be running")
    print("2. You must have a valid JWT token")
    print("3. Database must have at least one medicine and district")
    print("4. Update TOKEN variable in this script")
    
    print("\nMANUAL VERIFICATION STEPS:")
    print("1. Before running tests, check district_medicine_lookup table")
    print("2. Create a sale and verify entry is added")
    print("3. Create another sale for same district-medicine-formula")
    print("4. Verify no duplicate in lookup table")
    print("5. Delete one sale, verify lookup entry remains")
    print("6. Delete last sale, verify lookup entry is removed")
    
    # Uncomment to run actual tests
    # sales_id = test_create_sales()
    # if sales_id:
    #     test_delete_sales(sales_id)


if __name__ == "__main__":
    print("This is a test template. Update TOKEN and medicine/district IDs before running.")
    print("You can also test manually using curl or Postman with the endpoints:")
    print(f"  POST   {BASE_URL}/medicines/sales")
    print(f"  DELETE {BASE_URL}/medicines/sales/<id>")
    print(f"  POST   {BASE_URL}/medicines/sales/upload")
    
    # Uncomment to run tests
    # run_comprehensive_test()
