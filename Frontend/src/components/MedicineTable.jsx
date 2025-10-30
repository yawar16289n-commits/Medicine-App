import React from "react";

export default function MedicineTable({ medicines, onDelete, onEdit }) {
  if (!medicines || medicines.length === 0) {
    return <p className="text-center mt-4">No medicines found.</p>;
  }

  // Group by formula
  const groupedData = medicines.reduce((acc, med) => {
    if (!acc[med.formula]) acc[med.formula] = [];
    acc[med.formula].push(med);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <h2 className="text-primary mb-3 ">Medicine Forecast</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Formula</th>
            <th className="p-2 border">MedicineID</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Stock</th>
            <th className="p-2 border">Forecast</th>
            <th className="p-2 border">Stock Status</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedData).map(([formula, meds]) =>
            meds.map((med, idx) => (
              <tr key={med.id}>
                {idx === 0 && (
                  <>
                    <td className="p-2 border" rowSpan={meds.length}>
                      {med.id}
                    </td>
                    <td className="p-2 border" rowSpan={meds.length}>
                      {formula}
                    </td>
                  </>
                )}
                <td className="p-2 border">{med.medicineId}</td>
                <td className="p-2 border">{med.name}</td>
                <td className="p-2 border">{med.stock}</td>
                <td className="p-2 border">{med.forecast}</td>
                <td className="p-2 border">{med.stockStatus}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => onDelete(med.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => onEdit(med)}
                    className="bg-blue-500 text-white px-2 py-1 rounded ml-2"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
