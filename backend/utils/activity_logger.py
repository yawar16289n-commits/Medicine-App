"""Activity logging utility for tracking user actions"""
from database import db
from models import Activity
import json


def log_activity(user_id, user_name, action_type, entity_type, entity_id=None, details=None):
    """
    Log a user activity to the database.
    
    Args:
        user_id: ID of the user performing the action
        user_name: Username of the user
        action_type: Type of action ('create', 'update', 'delete', 'upload')
        entity_type: Type of entity affected ('sales_record', 'stock_adjustment', 'medicine', etc.)
        entity_id: ID of the affected entity (optional)
        details: Dictionary with additional details (will be converted to JSON string)
    """
    try:
        details_str = json.dumps(details) if details else None
        
        activity = Activity(
            user_id=user_id,
            user_name=user_name,
            action_type=action_type,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id else None,
            details=details_str
        )
        
        db.session.add(activity)
        db.session.commit()
        
        return True
    except Exception as e:
        print(f"Error logging activity: {str(e)}")
        db.session.rollback()
        return False
