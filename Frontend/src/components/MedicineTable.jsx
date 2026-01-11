import React from "react";
import { useAuth } from "../contexts/AuthContext";

export default function MedicineTable({ medicines, onDelete, onEdit }) {
  const { user } = useAuth();
  if (!medicines || medicines.length === 0) {
    return <p className="text-center mt-4">No medicines found.</p>;
  }

  // Group by formula name
  const groupedData = medicines.reduce((acc, med) => {
    const formulaName = med.formulaName || 'Unknown';
    if (!acc[formulaName]) acc[formulaName] = [];
    acc[formulaName].push(med);
    return acc;
  }, {});

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white border border-gray-300 rounded-lg shadow">
        <thead>
          <tr className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
            <th className="px-4 py-3 border border-gray-300 text-left text-sm font-semibold">District</th>
            <th className="px-4 py-3 border border-gray-300 text-left text-sm font-semibold">Formula</th>
            <th className="px-4 py-3 border border-gray-300 text-left text-sm font-semibold">Medicine ID</th>
            <th className="px-4 py-3 border border-gray-300 text-left text-sm font-semibold">Brand Name</th>
            <th className="px-4 py-3 border border-gray-300 text-left text-sm font-semibold">Dosage</th>
            <th className="px-4 py-3 border border-gray-300 text-left text-sm font-semibold">Sale Quantity</th>
            {(user?.role === 'admin' || user?.role === 'data_operator') && (
              <th className="px-4 py-3 border border-gray-300 text-left text-sm font-semibold">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {medicines.map((med) => (
            <tr key={med.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 border border-gray-300">{med.districtName || '-'}</td>
              <td className="px-4 py-3 border border-gray-300 font-medium">{med.formulaName || '-'}</td>
              <td className="px-4 py-3 border border-gray-300">{med.medicineId}</td>
              <td className="px-4 py-3 border border-gray-300 font-semibold text-gray-900">{med.brandName}</td>
              <td className="px-4 py-3 border border-gray-300">{med.dosageStrength || '-'}</td>
              <td className="px-4 py-3 border border-gray-300 text-right font-medium">{med.saleQuantity || '0'}</td>
              {(user?.role === 'admin' || user?.role === 'data_operator') && (
                <td className="px-4 py-3 border border-gray-300">
                  <button
                    onClick={() => onEdit(med)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg mr-2 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(med.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
