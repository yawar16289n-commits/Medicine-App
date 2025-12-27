import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { activitiesAPI } from "../utils/api";

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      setLoading(true);
      const res = await activitiesAPI.getRecent();
      setActivities(res.data);
    } catch (err) {
      console.error("Error fetching recent activities:", err);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'create': return '➕';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      case 'upload': return '📤';
      default: return '📝';
    }
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'create': return 'text-green-600 bg-green-100';
      case 'update': return 'text-blue-600 bg-blue-100';
      case 'delete': return 'text-red-600 bg-red-100';
      case 'upload': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatEntityType = (entityType) => {
    const types = {
      'sales_record': 'Sales Record',
      'sales_records': 'Sales Records',
      'stock_adjustment': 'Stock Adjustment',
      'stock_adjustments': 'Stock Adjustments',
      'medicine': 'Medicine',
      'formula': 'Formula',
      'district': 'District',
      'user': 'User',
    };
    return types[entityType] || entityType;
  };

  const formatActivityMessage = (activity) => {
    const entityType = formatEntityType(activity.entityType);
    let message = '';

    try {
      const details = activity.details ? JSON.parse(activity.details) : {};
      
      switch (activity.actionType) {
        case 'create':
          message = `created a ${entityType}`;
          if (details.medicine || details.brandName) {
            message += `: ${details.medicine || details.brandName}`;
          }
          break;
        case 'update':
          message = `updated a ${entityType}`;
          if (details.medicine || details.brandName) {
            message += `: ${details.medicine || details.brandName}`;
          }
          break;
        case 'delete':
          message = `deleted a ${entityType}`;
          if (details.brandName) {
            message += `: ${details.brandName}`;
          }
          break;
        case 'upload':
          message = `uploaded ${details.records_processed || 0} ${entityType.toLowerCase()}`;
          break;
        default:
          message = `performed ${activity.actionType} on ${entityType}`;
      }
    } catch {
      message = `performed ${activity.actionType} on ${formatEntityType(activity.entityType)}`;
    }

    return message;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="text-2xl mr-2">📊</span>
          Recent Activity
        </h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate('/activities')}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <span className="text-2xl mr-2">📊</span>
          Recent Activity
        </h3>
        <span className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          View All →
        </span>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No activities yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActionColor(activity.actionType)}`}>
                <span className="text-lg">{getActionIcon(activity.actionType)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">{activity.userName}</span>
                  {' '}
                  <span className="text-gray-600">{formatActivityMessage(activity)}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTimestamp(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
