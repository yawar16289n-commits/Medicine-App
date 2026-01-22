import { useState, useEffect } from "react";
import { activitiesAPI } from "../utils/api";

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterAction, setFilterAction] = useState("all");

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await activitiesAPI.getAll();
      setActivities(res.data);
    } catch (err) {
      console.error("Error fetching activities:", err);
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
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'upload': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatEntityType = (entityType) => {
    const types = {
      'sales_record': 'Sales Data',
      'sales_records': 'Sales Data',
      'sales_data': 'Sales Data',
      'stock_adjustment': 'Stock Data',
      'stock_adjustments': 'Stock Data',
      'stock_data': 'Stock Data',
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
          message = `Created ${entityType}`;
          if (details.medicine || details.brandName) {
            message += `: ${details.medicine || details.brandName}`;
          }
          if (details.district) {
            message += ` in ${details.district}`;
          }
          if (details.quantity) {
            message += ` (${details.quantity} units)`;
          }
          break;
        case 'update':
          message = `Updated ${entityType}`;
          if (details.medicine || details.brandName) {
            message += `: ${details.medicine || details.brandName}`;
          }
          if (details.district) {
            message += ` in ${details.district}`;
          }
          if (details.quantity) {
            message += ` (${details.quantity} units)`;
          }
          break;
        case 'delete':
          message = `Deleted ${entityType}`;
          if (details.brandName) {
            message += `: ${details.brandName}`;
          }
          break;
        case 'upload':
          const uploadType = details.upload_type ? ` (${details.upload_type})` : '';
          const fileName = details.file_name ? ` from ${details.file_name}` : '';
          message = `Uploaded ${details.records_processed || 0} records${fileName}${uploadType}`;
          if (details.total_errors > 0) {
            message += ` - ${details.total_errors} errors`;
          }
          break;
        default:
          message = `${activity.actionType} ${entityType}`;
      }
    } catch {
      message = `${activity.actionType} ${formatEntityType(activity.entityType)}`;
    }

    return message;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      activity.userName.toLowerCase().includes(searchLower) ||
      activity.actionType.toLowerCase().includes(searchLower) ||
      activity.entityType.toLowerCase().includes(searchLower) ||
      formatActivityMessage(activity).toLowerCase().includes(searchLower);

    // Type filter
    const matchesType = filterType === 'all' || activity.entityType === filterType;

    // Action filter
    const matchesAction = filterAction === 'all' || activity.actionType === filterAction;

    return matchesSearch && matchesType && matchesAction;
  });

  // Get unique entity types and action types for filters
  const entityTypes = [...new Set(activities.map(a => a.entityType))];
  const actionTypes = [...new Set(activities.map(a => a.actionType))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
            <span className="text-4xl mr-3">📊</span>
            Activity Log
          </h1>
          <p className="text-gray-600">Complete history of all user activities and changes</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                placeholder="🔍 Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Entity Type Filter */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entity Type
              </label>
              <select
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                {entityTypes.map(type => (
                  <option key={type} value={type}>{formatEntityType(type)}</option>
                ))}
              </select>
            </div>

            {/* Action Filter */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action
              </label>
              <select
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
              >
                <option value="all">All Actions</option>
                {actionTypes.map(action => (
                  <option key={action} value={action}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-4">
            Showing {filteredActivities.length} of {activities.length} activities
          </p>
        </div>

        {/* Activities Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Entity Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No activities found
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getActionIcon(activity.actionType)}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(activity.actionType)}`}>
                            {activity.actionType.charAt(0).toUpperCase() + activity.actionType.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {activity.userName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatActivityMessage(activity)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatEntityType(activity.entityType)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatTimestamp(activity.timestamp)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-600">Total Activities</p>
            <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-600">Creates</p>
            <p className="text-2xl font-bold text-green-600">
              {activities.filter(a => a.actionType === 'create').length}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-600">Updates</p>
            <p className="text-2xl font-bold text-blue-600">
              {activities.filter(a => a.actionType === 'update').length}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-600">Uploads</p>
            <p className="text-2xl font-bold text-purple-600">
              {activities.filter(a => a.actionType === 'upload').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
