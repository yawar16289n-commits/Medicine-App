import React, { useState, useEffect } from "react";
import { medicinesAPI } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import StockUpload from "../components/StockUpload";

export default function InventoryPage() {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch all medicines with stock levels
  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await medicinesAPI.getAll();
      // Convert grouped object to flat array
      const allMeds = Object.values(res.data).flat();
      setMedicines(allMeds);
    } catch (err) {
      console.error("Error fetching medicines:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Filter medicines by search term and stock level (formula-based)
  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch = Object.values(m).join(" ").toLowerCase().includes(searchTerm.toLowerCase());
    const isFormulaLowStock = m.isFormulaLowStock || false;
    
    if (stockFilter === "all") return matchesSearch;
    if (stockFilter === "out") return matchesSearch && m.stockLevel === 0;
    if (stockFilter === "low") return matchesSearch && m.stockLevel > 0 && isFormulaLowStock;
    if (stockFilter === "in") return matchesSearch && m.stockLevel > 0 && !isFormulaLowStock;
    
    return matchesSearch;
  });

  // Calculate stock statistics based on formula-level comparison
  const totalItems = medicines.length;
  const lowStockItems = medicines.filter(m => m.stockLevel > 0 && m.isFormulaLowStock).length;
  const outOfStockItems = medicines.filter(m => m.stockLevel === 0).length;

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <span className="text-4xl mr-3">📦</span>
                Inventory Management
              </h1>
              <p className="text-gray-600">Monitor stock levels and manage inventory adjustments</p>
            </div>
            {(user?.role === 'admin' || user?.role === 'data_operator') && (
              <button
                onClick={() => setUploadModalOpen(true)}
              className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:shadow-lg text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
              >
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  {/* Cloud */}
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9"
  />

  {/* Arrow – pushed DOWN more */}
  <g transform="translate(0,6)">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 6l3-3m0 0l3 3m-3-3v10"
    />
  </g>
</svg>                Upload Stock Adjustments
              </button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Items</p>
                <p className="text-4xl font-bold mt-2">{totalItems}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <span className="text-4xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Low Stock</p>
                <p className="text-4xl font-bold mt-2">{lowStockItems}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <span className="text-4xl">⚠️</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Out of Stock</p>
                <p className="text-4xl font-bold mt-2">{outOfStockItems}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <span className="text-4xl">❌</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Filter & Search */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setStockFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  stockFilter === "all"
                    ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Medicines
              </button>
              <button
                onClick={() => setStockFilter("in")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  stockFilter === "in"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                In Stock
              </button>
              <button
                onClick={() => setStockFilter("low")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  stockFilter === "low"
                    ? "bg-amber-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Low Stock
              </button>
              <button
                onClick={() => setStockFilter("out")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  stockFilter === "out"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Out of Stock
              </button>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              placeholder="🔍 Search by medicine name, formula, brand, or dosage..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-4 top-4 text-gray-400 text-xl">🔍</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Found {filteredMedicines.length} medicine{filteredMedicines.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Medicine ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Formula</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Medicine</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Dosage</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Stock Level</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMedicines.map((medicine) => {
                  const stockLevel = medicine.stockLevel || 0;
                  const isFormulaLowStock = medicine.isFormulaLowStock || false;
                  let statusBadge;
                  if (stockLevel === 0) {
                    statusBadge = <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Out of Stock</span>;
                  } else if (isFormulaLowStock) {
                    statusBadge = <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">Low Stock</span>;
                  } else {
                    statusBadge = <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">In Stock</span>;
                  }

                  return (
                    <tr key={medicine.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{medicine.id}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{medicine.formulaName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{medicine.brandName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{medicine.dosageStrength || 'N/A'}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-lg font-bold ${
                          stockLevel === 0 ? 'text-red-600' : 
                          isFormulaLowStock ? 'text-amber-600' : 
                          'text-green-600'
                        }`}>
                          {stockLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">{statusBadge}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredMedicines.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No medicines found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stock Upload Modal */}
      <StockUpload
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={fetchMedicines}
      />
    </div>
  );
}
