import React, { useState, useEffect } from "react";
import { medicinesAPI, formulasAPI } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

export default function MedicineManager() {
  const [medicines, setMedicines] = useState([]);
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    formulaId: "",
    brandName: "",
    dosageStrength: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [medicinesRes, formulasRes] = await Promise.all([
        medicinesAPI.getAll(),
        formulasAPI.getAll(),
      ]);
      
      // Flatten medicines from grouped object
      const allMeds = Object.values(medicinesRes.data).flat();
      setMedicines(allMeds);
      setFormulas(formulasRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.formulaId || !formData.brandName || !formData.brandName.trim()) {
      alert("Please fill in all required fields (Formula, Brand Name)");
      return;
    }

    try {
      if (editing) {
        await medicinesAPI.update(currentMedicine.id, formData);
        alert("Medicine updated successfully!");
      } else {
        await medicinesAPI.create(formData);
        alert("Medicine created successfully!");
      }
      
      fetchData();
      resetForm();
    } catch (error) {
      console.error("Error saving medicine:", error);
      const errorMsg = error.response?.data?.error || "Failed to save medicine";
      alert(errorMsg);
    }
  };

  const handleEdit = (medicine) => {
    setEditing(true);
    setCurrentMedicine(medicine);
    setFormData({
      formulaId: medicine.formulaId || "",
      brandName: medicine.brandName || "",
      dosageStrength: medicine.dosageStrength || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this medicine? This will also delete all associated sales and forecast records.")) {
      try {
        await medicinesAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error("Error deleting medicine:", error);
        alert("Failed to delete medicine");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      formulaId: "",
      brandName: "",
      dosageStrength: "",
    });
    setEditing(false);
    setCurrentMedicine(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">💊 Manage Medicines</h1>
          <p className="text-gray-600">Create medicine master records. Districts are assigned when sales data is uploaded.</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            {editing ? "✏️ Edit Medicine" : "➕ Add New Medicine"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Formula */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formula <span className="text-red-500">*</span>
                </label>
                <select
                  name="formulaId"
                  value={formData.formulaId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Formula</option>
                  {formulas.map((formula) => (
                    <option key={formula.id} value={formula.id}>
                      {formula.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicine Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Panadol"
                  required
                />
              </div>

              {/* Dosage Strength */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dosage Strength
                </label>
                <input
                  type="text"
                  name="dosageStrength"
                  value={formData.dosageStrength}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 500mg"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-lg font-semibold transition-all"
              >
                {editing ? "✓ Update Medicine" : "+ Add Medicine"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Medicines List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 All Medicines ({medicines.length})</h2>

          {medicines.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600 text-lg">No medicines found. Add your first medicine above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {medicines.map((medicine) => (
                <div
                  key={medicine.id}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:border-primary-400 hover:shadow-lg transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{medicine.brandName}</h3>
                      <p className="text-sm text-gray-600">ID: {medicine.medicineId}</p>
                    </div>
                    <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                      💊
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Formula:</span>
                      <span className="font-medium text-gray-900">{medicine.formulaName}</span>
                    </div>
                    {medicine.dosageStrength && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Dosage:</span>
                        <span className="font-medium text-gray-900">{medicine.dosageStrength}</span>
                      </div>
                    )}
                    {medicine.therapeuticClass && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Class:</span>
                        <span className="font-medium text-gray-900">{medicine.therapeuticClass}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {(user?.role === 'admin' || user?.role === 'data_operator') && (
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleEdit(medicine)}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(medicine.id)}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
