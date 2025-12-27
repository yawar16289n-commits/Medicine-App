"""Test Flask app initialization"""
import sys
sys.path.insert(0, 'D:\\Medicine-App-main\\backend')

try:
    from app import create_app
    print("✅ Importing app module... OK")
    
    app = create_app()
    print("✅ Creating Flask app... OK")
    
    print("\n📋 Registered Routes:")
    for rule in app.url_map.iter_rules():
        if rule.endpoint != 'static':
            print(f"  {rule.methods} {rule.rule}")
    
    print("\n✅ Backend initialization successful!")
    print(f"   Total routes: {len(list(app.url_map.iter_rules()))}")
    
except Exception as e:
    print(f"❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
