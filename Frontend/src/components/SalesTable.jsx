import React from "react";
import { useAuth } from "../contexts/AuthContext";

export default function SalesTable({ salesRecords, onDelete, onEdit }) {
  const { user } = useAuth();
  const canModify = user?.role === 'admin' || user?.role === 'data_operator';

  return (
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
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to delete this sales record?`
                          )
                        )
                          onDelete(record.id);
                      }}
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
  );
}
