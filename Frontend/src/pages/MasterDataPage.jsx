import React, { useState, useEffect } from 'react';
import { districtsAPI, formulasAPI, medicinesAPI } from '../utils/api';

function MasterDataPage() {
  const [activeTab, setActiveTab] = useState('areas');
  const [areas, setAreas] = useState([]);
  const [formulas, setFormulas] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  
  // Edit states
  const [editingArea, setEditingArea] = useState(null);
  const [editingFormula, setEditingFormula] = useState(null);
  const [editingMedicine, setEditingMedicine] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [areasRes, formulasRes, medicinesRes] = await Promise.all([
        districtsAPI.getAll(),
        formulasAPI.getAll(),
        medicinesAPI.getAll()
      ]);
      setAreas(areasRes.data || []);
      setFormulas(formulasRes.data || []);
      // Medicines API returns grouped by formula, need to flatten
      const medicinesData = medicinesRes.data 
        ? Object.values(medicinesRes.data).flat() 
        : [];
      setMedicines(medicinesData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddArea = () => {
    setEditingArea(null);
    setShowAreaModal(true);
  };

  const handleEditArea = (area) => {
    setEditingArea(area);
    setShowAreaModal(true);
  };

  const handleDeleteArea = async (id) => {
    if (!window.confirm('Are you sure you want to delete this area?')) return;
    try {
      await districtsAPI.delete(id);
      await fetchAllData();
    } catch (err) {
      alert('Error deleting area: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddFormula = () => {
    setEditingFormula(null);
    setShowFormulaModal(true);
  };

  const handleEditFormula = (formula) => {
    setEditingFormula(formula);
    setShowFormulaModal(true);
  };

  const handleDeleteFormula = async (id) => {
    if (!window.confirm('Are you sure you want to delete this formula?')) return;
    try {
      await formulasAPI.delete(id);
      await fetchAllData();
    } catch (err) {
      alert('Error deleting formula: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddMedicine = () => {
    setEditingMedicine(null);
    setShowMedicineModal(true);
  };

  const handleEditMedicine = (medicine) => {
    setEditingMedicine(medicine);
    setShowMedicineModal(true);
  };

  const handleDeleteMedicine = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    try {
      await medicinesAPI.delete(id);
      await fetchAllData();
    } catch (err) {
      alert('Error deleting medicine: ' + (err.response?.data?.error || err.message));
    }
  };

  const tabs = [
    { id: 'areas', label: 'Areas', icon: '🏢' },
    { id: 'formulas', label: 'Formulas', icon: '⚗️' },
    { id: 'medicines', label: 'Medicines', icon: '💊' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🗂️ Master Data Management</h1>
          <p className="text-gray-600">Manage areas, formulas, and medicines in one place</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-lg font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <>
                {/* Areas Tab */}
                {activeTab === 'areas' && (
                  <AreasTable
                    areas={areas}
                    onAdd={handleAddArea}
                    onEdit={handleEditArea}
                    onDelete={handleDeleteArea}
                  />
                )}

                {/* Formulas Tab */}
                {activeTab === 'formulas' && (
                  <FormulasTable
                    formulas={formulas}
                    onAdd={handleAddFormula}
                    onEdit={handleEditFormula}
                    onDelete={handleDeleteFormula}
                  />
                )}

                {/* Medicines Tab */}
                {activeTab === 'medicines' && (
                  <MedicinesTable
                    medicines={medicines}
                    formulas={formulas}
                    onAdd={handleAddMedicine}
                    onEdit={handleEditMedicine}
                    onDelete={handleDeleteMedicine}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAreaModal && (
        <AreaModal
          area={editingArea}
          onClose={() => setShowAreaModal(false)}
          onSuccess={() => {
            setShowAreaModal(false);
            fetchAllData();
          }}
        />
      )}

      {showFormulaModal && (
        <FormulaModal
          formula={editingFormula}
          onClose={() => setShowFormulaModal(false)}
          onSuccess={() => {
            setShowFormulaModal(false);
            fetchAllData();
          }}
        />
      )}

      {showMedicineModal && (
        <MedicineModal
          medicine={editingMedicine}
          formulas={formulas}
          onClose={() => setShowMedicineModal(false)}
          onSuccess={() => {
            setShowMedicineModal(false);
            fetchAllData();
          }}
        />
      )}
    </div>
  );
}

// Areas Table Component
function AreasTable({ areas, onAdd, onEdit, onDelete }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">Areas ({areas.length})</h3>
        <button
          onClick={onAdd}
          className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
        >
          + Add Area
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Area Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Area Code</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Created At</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {areas.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  No areas found. Click "Add Area" to create one.
                </td>
              </tr>
            ) : (
              areas.map((area) => (
                <tr key={area.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{area.id}</td>
                  <td className="px-4 py-3 font-semibold">{area.name}</td>
                  <td className="px-4 py-3 text-sm">{area.areaCode || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(area.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onEdit(area)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(area.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Formulas Table Component
function FormulasTable({ formulas, onAdd, onEdit, onDelete }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">Formulas ({formulas.length})</h3>
        <button
          onClick={onAdd}
          className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
        >
          + Add Formula
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Formula Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Created At</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {formulas.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                  No formulas found. Click "Add Formula" to create one.
                </td>
              </tr>
            ) : (
              formulas.map((formula) => (
                <tr key={formula.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{formula.id}</td>
                  <td className="px-4 py-3 font-semibold">{formula.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(formula.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onEdit(formula)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(formula.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Medicines Table Component
function MedicinesTable({ medicines, onAdd, onEdit, onDelete }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">Medicines ({medicines.length})</h3>
        <button
          onClick={onAdd}
          className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
        >
          + Add Medicine
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Medicine ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Brand Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Formula</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Therapeutic Class</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Dosage</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  No medicines found. Click "Add Medicine" to create one.
                </td>
              </tr>
            ) : (
              medicines.map((medicine) => (
                <tr key={medicine.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">{medicine.medicineId}</td>
                  <td className="px-4 py-3 font-semibold">{medicine.brandName}</td>
                  <td className="px-4 py-3 text-sm">{medicine.formulaName}</td>
                  <td className="px-4 py-3 text-sm">{medicine.therapeuticClass || '-'}</td>
                  <td className="px-4 py-3 text-sm">{medicine.dosageStrength || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onEdit(medicine)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(medicine.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Area Modal Component
function AreaModal({ area, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: area?.name || '',
    areaCode: area?.areaCode || ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (area) {
        await districtsAPI.update(area.id, formData);
      } else {
        await districtsAPI.create(formData);
      }
      onSuccess();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-4 rounded-t-xl">
          <h3 className="text-xl font-bold">{area ? 'Edit Area' : 'Add New Area'}</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Bahadurabad"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area Code
            </label>
            <input
              type="text"
              value={formData.areaCode}
              onChange={(e) => setFormData({ ...formData, areaCode: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., BHD01"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
            >
              {submitting ? 'Saving...' : area ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Formula Modal Component
function FormulaModal({ formula, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: formula?.name || ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (formula) {
        await formulasAPI.update(formula.id, formData);
      } else {
        await formulasAPI.create(formData);
      }
      onSuccess();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-4 rounded-t-xl">
          <h3 className="text-xl font-bold">{formula ? 'Edit Formula' : 'Add New Formula'}</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formula Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Acetylsalicylic Acid"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
            >
              {submitting ? 'Saving...' : formula ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Medicine Modal Component
function MedicineModal({ medicine, formulas, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    medicineId: medicine?.medicineId || '',
    brandName: medicine?.brandName || '',
    formulaId: medicine?.formulaId || '',
    dosageStrength: medicine?.dosageStrength || '',
    therapeuticClass: medicine?.therapeuticClass || ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (medicine) {
        // Edit: send all fields except medicineId
        const payload = {
          brandName: formData.brandName,
          formulaId: parseInt(formData.formulaId),
          dosageStrength: formData.dosageStrength,
          therapeuticClass: formData.therapeuticClass
        };
        await medicinesAPI.update(medicine.id, payload);
      } else {
        // Create: medicine ID is auto-assigned by backend
        const payload = {
          brandName: formData.brandName,
          formulaId: parseInt(formData.formulaId),
          dosageStrength: formData.dosageStrength,
          therapeuticClass: formData.therapeuticClass
        };
        await medicinesAPI.create(payload);
      }
      onSuccess();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-4 rounded-t-xl sticky top-0">
          <h3 className="text-xl font-bold">{medicine ? 'Edit Medicine' : 'Add New Medicine'}</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Aspirin"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formula <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.formulaId}
                onChange={(e) => setFormData({ ...formData, formulaId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Formula</option>
                {formulas.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dosage Strength
              </label>
              <input
                type="text"
                value={formData.dosageStrength}
                onChange={(e) => setFormData({ ...formData, dosageStrength: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., 100mg"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Therapeutic Class
              </label>
              <input
                type="text"
                value={formData.therapeuticClass}
                onChange={(e) => setFormData({ ...formData, therapeuticClass: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Analgesic"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
            >
              {submitting ? 'Saving...' : medicine ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MasterDataPage;
