import React, { useState, useEffect } from "react";
import axios from "axios";
import MedicineForm from "../components/MedicineForm";
import MedicineTable from "../components/MedicineTable";
import FileUpload from "../components/FileUpload";
import { MEDICINES_API } from "../config";

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [editing, setEditing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const medicinesPerPage = 10;

  const API_URL = MEDICINES_API;

  // Fetch all medicines
  const fetchMedicines = async () => {
    try {
      const res = await axios.get(API_URL);
      // Convert grouped object to flat array
      const allMeds = Object.values(res.data).flat();
      setMedicines(allMeds);
    } catch (err) {
      console.error("Error fetching medicines:", err);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Add new medicine
  const addMedicine = async (newMedicine) => {
    try {
      const res = await axios.post(API_URL, newMedicine);
      setMedicines([res.data.medicine, ...medicines]);
    } catch (err) {
      console.error("Error adding medicine:", err);
    }
  };

  // Delete medicine
  const deleteMedicine = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMedicines(medicines.filter((m) => m.id !== id));
      setEditing(false);
    } catch (err) {
      console.error("Error deleting medicine:", err);
    }
  };

  // Start editing
  const startEdit = (medicine) => {
    setEditing(true);
    const index = medicines.findIndex((m) => m.id === medicine.id);
    setCurrentIndex(index);
  };

  // Update medicine
  const updateMedicine = async (updatedMedicine) => {
    const id = medicines[currentIndex].id;
    try {
      const res = await axios.put(`${API_URL}/${id}`, updatedMedicine);
      const updated = medicines.map((m, i) =>
        i === currentIndex ? res.data.medicine : m
      );
      setMedicines(updated);
      setEditing(false);
      setCurrentIndex(null);
    } catch (err) {
      console.error("Error updating medicine:", err);
    }
  };

  // Search + Pagination
  const filteredMedicines = medicines.filter((m) =>
    Object.values(m).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * medicinesPerPage;
  const indexOfFirst = indexOfLast - medicinesPerPage;
  const currentMedicines = filteredMedicines.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredMedicines.length / medicinesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mt-4">
      {/* ====== Upload Section ====== */}
      <h3 className="text-primary mb-3">Upload Medicine Data</h3>
      <FileUpload onUploadSuccess={fetchMedicines} />
      <hr />

      {/* ====== Add / Edit Form ====== */}
      <h3 className="text-primary mt-4 mb-3">
        {editing ? "Edit Medicine" : "Add New Medicine"}
      </h3>
      <MedicineForm
        onAdd={addMedicine}
        onUpdate={updateMedicine}
        editing={editing}
        currentMedicine={editing ? medicines[currentIndex] : null}
      />
      <hr />

      {/* ====== Search ====== */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search medicine by name, formula, or stock..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* ====== Medicine Table ====== */}
      <MedicineTable
        medicines={currentMedicines}
        onDelete={deleteMedicine}
        onEdit={startEdit}
      />

      {/* ====== Pagination ====== */}
      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                <button className="page-link" onClick={() => paginate(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
