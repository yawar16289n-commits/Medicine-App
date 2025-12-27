import React, { useState } from "react";
import { medicinesAPI } from "../utils/api";

export default function StockUpload({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileExt = selectedFile.name.split(".").pop().toLowerCase();
      if (!["csv", "xlsx", "xls"].includes(fileExt)) {
        setError("Please select a CSV or Excel file");
        setFile(null);
        setErrors([]);
        return;
      }
      setFile(selectedFile);
      setError("");
      setErrors([]);
      setSuccess("");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await medicinesAPI.downloadStockTemplate();
      
      // Create blob and download
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "stock_adjustments_template.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download template");
      console.error(err);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      setErrors([]);
      return;
    }

    setUploading(true);
    setError("");
    setErrors([]);
    setSuccess("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await medicinesAPI.uploadStockAdjustments(formData);
      
      setSuccess(
        response.data.message || 
        `Successfully processed ${response.data.records_processed} stock adjustments`
      );
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById("stock-file-input");
      if (fileInput) fileInput.value = "";
      
      // Call success callback after a delay
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 2000);
      
    } catch (err) {
      const errorData = err.response?.data || {};
      setError(
        errorData.error || 
        "Failed to upload file. Please check the format and try again."
      );
      
      // Display detailed validation errors if available
      if (errorData.errors && Array.isArray(errorData.errors)) {
        setErrors(errorData.errors);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError("");
    setErrors([]);
    setSuccess("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-5 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">📤</span>
              Upload Stock Adjustments
            </h2>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Download Template */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <span>📋</span>
              Template & Required Columns
            </h3>
            <p className="text-sm text-green-800 mb-3">
              Download the Excel template with the following required columns:
            </p>
            <ul className="text-sm text-green-800 space-y-1 list-disc list-inside mb-4">
              <li><strong>Medicine ID</strong> - Unique medicine identifier</li>
              <li><strong>Adjustment Type</strong> - ADD or REDUCE</li>
              <li><strong>Quantity</strong> - Number of units to adjust</li>
              <li><strong>Reason</strong> - Reason for adjustment</li>
            </ul>
            <button
              onClick={handleDownloadTemplate}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Template
            </button>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Select File (CSV or Excel)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <input
                  id="stock-file-input"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg px-6 py-8 text-center hover:border-primary-500 hover:bg-primary-50 transition-all">
                  {file ? (
                    <div className="flex items-center justify-center gap-2 text-purple-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-medium">{file.name}</span>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm font-medium">Click to browse or drag & drop</p>
                      <p className="text-xs">CSV or Excel files only</p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-2xl">❌</span>
                <div>
                  <p className="font-semibold text-red-900">Upload Failed</p>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Validation Errors Details */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-red-800 mb-2">
                Validation Issues ({errors.length}):
              </h4>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {errors.map((err, idx) => (
                  <p key={idx} className="text-sm text-red-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{err}</span>
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-semibold text-green-900">Upload Successful</p>
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Upload</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
