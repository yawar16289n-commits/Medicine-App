"""Production server using waitress"""
import os
os.chdir('D:\\Medicine-App-main\\backend')

from waitress import serve
from app import create_app

app = create_app()

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 Starting Backend Server (Waitress)")
    print("="*60)
    print("Server: http://127.0.0.1:5000")
    print("Press CTRL+C to quit")
    print("="*60 + "\n")
    
    try:
        serve(app, host='127.0.0.1', port=5000, threads=4)
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        print("\n Server stopped.")
