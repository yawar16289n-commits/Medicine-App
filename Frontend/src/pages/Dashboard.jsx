import { useState, useEffect } from "react";
import { medicinesAPI } from "../utils/api";
import RecentActivity from "../components/RecentActivity";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    outOfStock: 0,
    inStock: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchMedicineStats();
  }, []);

  const fetchMedicineStats = async () => {
    try {
      const response = await medicinesAPI.getStats();
      
      setStats({
        total: response.data.total,
        lowStock: response.data.lowStock,
        outOfStock: response.data.outOfStock,
        inStock: response.data.inStock
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching medicine stats:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome to your medicine inventory management system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Medicines</p>
                {loading ? (
                  <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💊</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Low Stock</p>
                <p className="text-xs text-gray-500 mb-1">(Stock &lt; Forecast)</p>
                {loading ? (
                  <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-orange-600">{stats.lowStock}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
                {loading ? (
                  <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-red-600">{stats.outOfStock}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚫</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Stock</p>
                {loading ? (
                  <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-green-600">{stats.inStock}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/sales" className="flex items-center p-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all">
              <span className="text-2xl mr-3">📋</span>
              <div>
                <p className="font-semibold">Manage Sales</p>
                <p className="text-sm text-primary-100">Record sales data</p>
              </div>
            </a>
            
            {/* Show Inventory for data_operator, Forecast for admin/analyst */}
            {user?.role === 'data_operator' ? (
              <a href="/inventory" className="flex items-center p-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-all">
                <span className="text-2xl mr-3">📦</span>
                <div>
                  <p className="font-semibold">Manage Inventory</p>
                  <p className="text-sm text-purple-100">Update stock levels</p>
                </div>
              </a>
            ) : (
              <a href="/forecast" className="flex items-center p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all">
                <span className="text-2xl mr-3">🤖</span>
                <div>
                  <p className="font-semibold">AI Forecasting</p>
                  <p className="text-sm text-blue-100">Predict demand trends</p>
                </div>
              </a>
            )}
            
            <a href="/weather" className="flex items-center p-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:shadow-lg transition-all">
              <span className="text-2xl mr-3">🌤️</span>
              <div>
                <p className="font-semibold">Weather Analytics</p>
                <p className="text-sm text-orange-100">View correlations</p>
              </div>
            </a>
          </div>
        </div>

        {/* Recent Activity - Only for Admin */}
        {user?.role === 'admin' && <RecentActivity />}
      </div>
    </div>
  );
}
