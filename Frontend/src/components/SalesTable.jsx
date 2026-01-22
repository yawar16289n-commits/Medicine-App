import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function SalesTable({ salesRecords, onDelete, onEdit }) {
  const { user } = useAuth();
  const canModify = user?.role === 'admin' || user?.role === 'data_operator';
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, record: null });

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
        <thead className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Medicine
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Dosage
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Formula
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              District
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Quantity
            </th>
            {canModify && (
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {salesRecords.length === 0 ? (
            <tr>
              <td
                colSpan={canModify ? 7 : 6}
                className="px-6 py-8 text-center text-gray-500"
              >
                <div className="flex flex-col items-center justify-center">
                  <span className="text-5xl mb-2">📦</span>
                  <p className="text-lg font-medium">No sales records found</p>
                  <p className="text-sm text-gray-400">
                    Add a sales record to get started
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            salesRecords.map((record, index) => (
              <tr
                key={record.id}
                className={`${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-blue-50 transition-colors`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {record.medicineName || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {record.dosageStrength || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {record.formulaName || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {record.districtName || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {record.quantity}
                  </span>
                </td>
                {canModify && (
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                    <button
                      onClick={() => onEdit(record)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, record })}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-t-2xl">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                Confirm Delete
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete this sales record?
              </p>
              {deleteModal.record && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <p><strong>Medicine:</strong> {deleteModal.record.medicineName}</p>
                  <p><strong>District:</strong> {deleteModal.record.districtName}</p>
                  <p><strong>Date:</strong> {deleteModal.record.date}</p>
                  <p><strong>Quantity:</strong> {deleteModal.record.quantity}</p>
                </div>
              )}
              <p className="text-sm text-gray-600">
                This action cannot be undone.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, record: null })}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete(deleteModal.record.id);
                    setDeleteModal({ isOpen: false, record: null });
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
