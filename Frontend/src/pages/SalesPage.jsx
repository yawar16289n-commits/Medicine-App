import { useState, useEffect, useMemo } from "react";
import MedicineForm from "../components/MedicineForm";
import SalesTable from "../components/SalesTable";
import FileUpload from "../components/FileUpload";
import SalesUpload from "../components/SalesUpload";
import { useAuth } from "../contexts/AuthContext";
import { medicinesAPI } from "../utils/api";
import { MEDICINES_PER_PAGE } from "../utils/constants";

export default function SalesPage() {
  const [salesRecords, setSalesRecords] = useState([]);
  const [editing, setEditing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [salesUploadOpen, setSalesUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const { user } = useAuth();

  // Fetch all sales records
  const fetchSalesRecords = async () => {
    try {
      setLoading(true);
      const res = await medicinesAPI.getSalesRecords(); // Get all records
      setSalesRecords(res.data);
    } catch (err) {
      console.error("Error fetching sales records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesRecords();
  }, []);

  // Add new sales record
  const addMedicine = async (newMedicine) => {
    try {
      const res = await medicinesAPI.createSalesRecord(newMedicine);
      // Refresh sales records list
      fetchSalesRecords();
      alert(res.data.message || 'Sales record added successfully');
    } catch (err) {
      alert(err.response?.data?.error || 'Error adding sales record');
      console.error("Error adding sales record:", err);
    }
  };

  // Update sales record
  const updateMedicine = async (updatedMedicine) => {
    try {
      const res = await medicinesAPI.createSalesRecord(updatedMedicine);
      // Refresh sales records list
      fetchSalesRecords();
      setEditing(false);
      setCurrentIndex(null);
      setSuccessMessage(res.data.message || 'Sales record updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Error updating sales record');
      console.error("Error updating sales record:", err);
    }
  };

  // Delete sales record
  const deleteMedicine = async (id) => {
    try {
      await medicinesAPI.deleteSalesRecord(id);
      setSalesRecords(salesRecords.filter((m) => m.id !== id));
      setEditing(false);
      setSuccessMessage('Sales record deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting sales record');
      console.error("Error deleting sales record:", err);
    }
  };

  // Start editing
  const startEdit = (medicine) => {
    setEditing(true);
    const index = salesRecords.findIndex((m) => m.id === medicine.id);
    setCurrentIndex(index);
  };

  // Search + Pagination (memoized for performance)
  const filteredRecords = useMemo(
    () => salesRecords.filter((m) =>
      Object.values(m).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [salesRecords, searchTerm]
  );

  const { currentMedicines, totalPages } = useMemo(() => {
    const indexOfLast = currentPage * MEDICINES_PER_PAGE;
    const indexOfFirst = indexOfLast - MEDICINES_PER_PAGE;
    return {
      currentMedicines: filteredRecords.slice(indexOfFirst, indexOfLast),
      totalPages: Math.ceil(filteredRecords.length / MEDICINES_PER_PAGE),
    };
  }, [filteredRecords, currentPage]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Medicine Sales Record</h1>
          <p className="text-gray-600">Manage your medicine sales record</p>
        </div>

        {(user?.role === 'admin' || user?.role === 'data_operator') && (
          <>
            {/* ====== Add / Edit Form ====== */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="text-2xl mr-2">{editing ? "✏️" : "➕"}</span>
                  {editing ? "Edit Sales Record" : "Add Sales Record"}
                </h3>
                <button
                  onClick={() => setSalesUploadOpen(true)}
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
</svg>



              Upload Bulk Record
                </button>
              </div>
              <MedicineForm
                onAdd={addMedicine}
                onUpdate={updateMedicine}
                editing={editing}
                currentMedicine={editing ? salesRecords[currentIndex] : null}
              />
            </div>
          </>
        )}

        {/* ====== Search ====== */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              placeholder="🔍 Search medicine by name, formula, or stock..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <span className="absolute left-4 top-4 text-gray-400 text-xl">🔍</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Found {filteredRecords.length} sale record{filteredRecords.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* ====== Sales Records Table ====== */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
              <p className="text-gray-600">Loading sales records...</p>
            </div>
          ) : (
            <SalesTable
              salesRecords={currentMedicines}
              onDelete={deleteMedicine}
              onEdit={startEdit}
            />
          )}
        </div>

        {/* ====== Pagination ====== */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ← Previous
            </button>
            
            <div className="flex space-x-1">
              {/* Show first page */}
              {currentPage > 3 && (
                <>
                  <button
                    onClick={() => paginate(1)}
                    className="px-4 py-2 rounded-lg font-medium transition-all bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    1
                  </button>
                  <span className="px-2 py-2 text-gray-500">...</span>
                </>
              )}

              {/* Show pages around current page */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show current page and 2 pages before and after
                  return page >= currentPage - 2 && page <= currentPage + 2;
                })
                .map(page => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

              {/* Show last page */}
              {currentPage < totalPages - 2 && (
                <>
                  <span className="px-2 py-2 text-gray-500">...</span>
                  <button
                    onClick={() => paginate(totalPages)}
                    className="px-4 py-2 rounded-lg font-medium transition-all bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Sales Upload Modal */}
      <SalesUpload 
        isOpen={salesUploadOpen} 
        onClose={() => setSalesUploadOpen(false)} 
        onSuccess={fetchSalesRecords} 
      />

      {/* Success Notification */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
