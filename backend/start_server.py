"""Simple server starter without debug mode issues"""
import os
os.chdir('D:\\Medicine-App-main\\backend')

from app import create_app

app = create_app()

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 Starting Backend Server")
    print("="*60)
    print("Server: http://127.0.0.1:5000")
    print("Press CTRL+C to quit")
    print("="*60 + "\n")
    
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)
