import { useState, useEffect, useMemo } from "react";
import { medicinesAPI } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import StockUpload from "../components/StockUpload";

export default function InventoryPage() {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
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

  // Memoize filtered medicines to avoid recalculating on every render
  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const matchesSearch = Object.values(m).join(" ").toLowerCase().includes(searchTerm.toLowerCase());
      const isFormulaLowStock = m.isFormulaLowStock || false;
      
      if (stockFilter === "all") return matchesSearch;
      if (stockFilter === "out") return matchesSearch && m.stockLevel === 0;
      if (stockFilter === "low") return matchesSearch && m.stockLevel > 0 && isFormulaLowStock;
      if (stockFilter === "in") return matchesSearch && m.stockLevel > 0 && !isFormulaLowStock;
      
      return matchesSearch;
    });
  }, [medicines, searchTerm, stockFilter]);

  // Paginate filtered results
  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);
  const paginatedMedicines = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMedicines.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMedicines, currentPage]);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stockFilter]);

  // Memoize stock statistics to avoid recalculating
  const stockStats = useMemo(() => {
    const totalItems = medicines.length;
    const lowStockItems = medicines.filter(m => m.stockLevel > 0 && m.isFormulaLowStock).length;
    const outOfStockItems = medicines.filter(m => m.stockLevel === 0).length;
    return { totalItems, lowStockItems, outOfStockItems };
  }, [medicines]);

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
                {loading ? (
                  <div className="h-10 w-20 bg-white bg-opacity-20 rounded animate-pulse mt-2"></div>
                ) : (
                  <p className="text-4xl font-bold mt-2">{stockStats.totalItems}</p>
                )}
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
                {loading ? (
                  <div className="h-10 w-20 bg-white bg-opacity-20 rounded animate-pulse mt-2"></div>
                ) : (
                  <p className="text-4xl font-bold mt-2">{stockStats.lowStockItems}</p>
                )}
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
                {loading ? (
                  <div className="h-10 w-20 bg-white bg-opacity-20 rounded animate-pulse mt-2"></div>
                ) : (
                  <p className="text-4xl font-bold mt-2">{stockStats.outOfStockItems}</p>
                )}
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
                {loading ? (
                  // Skeleton loading rows
                  Array.from({ length: 10 }).map((_, idx) => (
                    <tr key={`skeleton-${idx}`} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-40"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="h-6 bg-gray-200 rounded w-12 ml-auto"></div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="h-6 bg-gray-200 rounded-full w-24 mx-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  paginatedMedicines.map((medicine) => {
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
                  })
                )}
              </tbody>
            </table>
            
            {!loading && filteredMedicines.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No medicines found</p>
              </div>
            )}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredMedicines.length)} of {filteredMedicines.length} medicines
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  ← Previous
                </button>
                <span className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
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
