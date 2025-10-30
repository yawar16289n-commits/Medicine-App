import React, { useState, useEffect } from "react";

function MedicineForm({ onAdd, onUpdate, editing, currentMedicine }) {
  const [formData, setFormData] = useState({
    formula: "",
    medicineId: "",
    name: "",
    stock: "",
    forecast: "",
    stockStatus: "",
  });

  useEffect(() => {
    if (editing && currentMedicine) {
      setFormData(currentMedicine);
    } else {
      setFormData({
        formula: "",
        medicineId: "",
        name: "",
        stock: "",
        forecast: "",
        stockStatus: "",
      });
    }
  }, [editing, currentMedicine]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.formula || !formData.name) return;
    if (editing) onUpdate(formData);
    else onAdd(formData);
  };

  return (
    <form className="mb-3" onSubmit={handleSubmit}>
      <div className="row g-2">
        <div className="col-md-2">
          <input
            type="text"
            name="formula"
            className="form-control"
            placeholder="Formula"
            value={formData.formula}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-2">
          <input
            type="text"
            name="medicineId"
            className="form-control"
            placeholder="Medicine ID"
            value={formData.medicineId}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-3">
          <input
            type="text"
            name="name"
            className="form-control"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-1">
          <input
            type="number"
            name="stock"
            className="form-control"
            placeholder="Stock"
            value={formData.stock}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-1">
          <input
            type="number"
            name="forecast"
            className="form-control"
            placeholder="Forecast"
            value={formData.forecast}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-2">
          <input
            type="text"
            name="stockStatus"
            className="form-control"
            placeholder="Stock Status"
            value={formData.stockStatus}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-1 d-grid">
          <button
            className={`btn ${editing ? "btn-success" : "btn-primary"}`}
            type="submit"
          >
            {editing ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default MedicineForm;
