import requests

try:
    # Test without auth first
    print("Testing /api/weather/template endpoint...")
    r = requests.get('http://127.0.0.1:5000/api/weather/template')
    print(f'Status: {r.status_code}')
    print(f'Content-Type: {r.headers.get("Content-Type")}')
    
    if r.status_code == 200:
        print(f'Content-Length: {len(r.content)} bytes')
        print("✓ Template download endpoint working!")
    elif r.status_code == 401:
        print("✓ Endpoint exists and requires authentication (as expected)")
        print("  Frontend will send auth token automatically")
    else:
        print(f'Response: {r.text}')
        
except requests.exceptions.ConnectionError:
    print("✗ Cannot connect to backend server at http://127.0.0.1:5000")
    print("Make sure the backend is running!")
except Exception as e:
    print(f"✗ Error: {e}")
