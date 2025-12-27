"""Activity tracking routes - View user activities and audit logs"""
from flask import Blueprint, jsonify
from models import Activity
from sqlalchemy import desc

activities_bp = Blueprint('activities', __name__)


@activities_bp.route('/activities', methods=['GET'])
def get_all_activities():
    """
    Get all activities, ordered by most recent first
    
    Returns:
        [
            {
                "id": 1,
                "userId": 1,
                "userName": "admin",
                "actionType": "create",
                "entityType": "sales_record",
                "entityId": "123",
                "details": "...",
                "timestamp": "2024-01-01T12:00:00"
            }
        ]
    """
    activities = Activity.query.order_by(desc(Activity.timestamp)).all()
    return jsonify([activity.to_dict() for activity in activities]), 200


@activities_bp.route('/activities/recent', methods=['GET'])
def get_recent_activities():
    """
    Get recent activities (last 10)
    
    Returns: Same format as get_all_activities but limited to 10
    """
    activities = Activity.query.order_by(desc(Activity.timestamp)).limit(10).all()
    return jsonify([activity.to_dict() for activity in activities]), 200


@activities_bp.route('/activities/<int:id>', methods=['GET'])
def get_activity(id):
    """Get a specific activity by ID"""
    activity = Activity.query.get_or_404(id)
    return jsonify(activity.to_dict()), 200
