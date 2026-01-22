import { useState, useEffect } from "react";
import { formulasAPI, districtsAPI, medicinesAPI } from "../utils/api";

function MedicineForm({ onAdd, onUpdate, editing, currentMedicine }) {
  const [formData, setFormData] = useState({
    districtId: "",
    formulaId: "",
    medicineId: "",
    dosageStrength: "",
    saleQuantity: "",
    date: new Date().toISOString().split('T')[0], // Today's date
  });
  const [formulas, setFormulas] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [allMedicines, setAllMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [availableDosages, setAvailableDosages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch formulas, districts, and medicines on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formulasRes, districtsRes, medicinesRes] = await Promise.all([
          formulasAPI.getAll(),
          districtsAPI.getAll(),
          medicinesAPI.getAll()
        ]);
        setFormulas(formulasRes.data);
        setDistricts(districtsRes.data);
        // Convert grouped object to flat array
        const allMeds = Object.values(medicinesRes.data).flat();
        setAllMedicines(allMeds);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter medicines when formula changes - group by brand name
  useEffect(() => {
    if (formData.formulaId) {
      const filtered = allMedicines.filter(
        med => med.formulaId === parseInt(formData.formulaId)
      );
      // Get unique brand names
      const uniqueBrands = [...new Set(filtered.map(m => m.brandName))];
      setFilteredMedicines(uniqueBrands.map(brand => ({
        brandName: brand,
        medicines: filtered.filter(m => m.brandName === brand)
      })));
    } else {
      setFilteredMedicines([]);
    }
  }, [formData.formulaId, allMedicines]);

  // Update available dosages when medicine brand is selected
  useEffect(() => {
    if (formData.medicineId) {
      const selectedBrand = filteredMedicines.find(
        m => m.brandName === formData.medicineId
      );
      if (selectedBrand) {
        setAvailableDosages(selectedBrand.medicines);
      }
    } else {
      setAvailableDosages([]);
    }
  }, [formData.medicineId, filteredMedicines]);

  useEffect(() => {
    if (editing && currentMedicine) {
      // For sales records, the structure includes medicineName, dosageStrength, etc.
      setFormData({
        districtId: currentMedicine.districtId || "",
        formulaId: currentMedicine.formulaId || "",
        medicineId: currentMedicine.medicineName || "",  // Use medicineName for sales records
        dosageStrength: currentMedicine.dosageStrength || "",
        saleQuantity: currentMedicine.quantity || "",  // Sales records use 'quantity' not 'saleQuantity'
        date: currentMedicine.date || new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({
        districtId: "",
        formulaId: "",
        medicineId: "",
        dosageStrength: "",
        saleQuantity: "",
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [editing, currentMedicine]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Reset medicine and dosage selection when formula changes
    if (name === "formulaId") {
      setFormData({ ...formData, formulaId: value, medicineId: "", dosageStrength: "" });
    } 
    // Reset dosage when medicine brand changes
    else if (name === "medicineId") {
      setFormData({ ...formData, medicineId: value, dosageStrength: "" });
    } 
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.districtId || !formData.formulaId || !formData.medicineId) {
      alert("Please fill in all required fields (District, Formula, Medicine)");
      return;
    }
    
    // Find the actual medicine ID based on brand and dosage
    let actualMedicineId;
    if (formData.dosageStrength) {
      const selectedMedicine = availableDosages.find(
        m => m.dosageStrength === formData.dosageStrength
      );
      actualMedicineId = selectedMedicine ? selectedMedicine.id : null;
    } else {
      // If no dosage selected, use the first available medicine for that brand
      actualMedicineId = availableDosages.length > 0 ? availableDosages[0].id : null;
    }
    
    const dataToSend = {
      ...formData,
      medicineId: actualMedicineId
    };
    
    if (editing) onUpdate(dataToSend);
    else onAdd(dataToSend);
  };

  if (loading) {
    return <div className="text-center py-4">Loading formulas...</div>;
  }

  return (
    <form className="mb-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* District Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
          <select
            name="districtId"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={formData.districtId}
            onChange={handleChange}
            required
          >
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name} {district.areaCode && `(${district.areaCode})`}
              </option>
            ))}
          </select>
        </div>

        {/* Formula Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Formula *</label>
          <select
            name="formulaId"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={formData.formulaId}
            onChange={handleChange}
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

        {/* Medicine Dropdown - Filtered by Formula (Brand Names) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Medicine *</label>
          <select
            name="medicineId"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            value={formData.medicineId}
            onChange={handleChange}
            disabled={!formData.formulaId}
            required
          >
            <option value="">
              {!formData.formulaId ? "Select formula first" : "Select Medicine"}
            </option>
            {filteredMedicines.map((medicine, idx) => (
              <option key={idx} value={medicine.brandName}>
                {medicine.brandName}
              </option>
            ))}
          </select>
          {filteredMedicines.length === 0 && formData.formulaId && (
            <p className="text-xs text-amber-600 mt-1">No medicines found for this formula</p>
          )}
        </div>

        {/* Dosage Dropdown - Filtered by Medicine Brand (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
          <select
            name="dosageStrength"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            value={formData.dosageStrength}
            onChange={handleChange}
            disabled={!formData.medicineId}
          >
            <option value="">
              {!formData.medicineId ? "Select medicine first" : "Any dosage"}
            </option>
            {availableDosages.map((medicine) => (
              <option key={medicine.id} value={medicine.dosageStrength}>
                {medicine.dosageStrength || 'N/A'}
              </option>
            ))}
          </select>
        </div>

        {/* Date Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
          <input
            type="date"
            name="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        {/* Sale Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sale Quantity</label>
          <input
            type="number"
            name="saleQuantity"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g. 1000"
            value={formData.saleQuantity}
            onChange={handleChange}
            min="0"
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-end md:col-span-2 lg:col-span-3">
          <button
            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
              editing 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white"
            }`}
            type="submit"
          >
            {editing ? "✓ Update Sales Record" : "+ Add Sales Record"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default MedicineForm;
