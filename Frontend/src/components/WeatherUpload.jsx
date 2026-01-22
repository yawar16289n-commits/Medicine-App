import React, { useState } from "react";
import { weatherAPI } from "../utils/api";

export default function WeatherUpload({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileExt = selectedFile.name.split(".").pop().toLowerCase();
      if (!["csv", "xlsx", "xls"].includes(fileExt)) {
        setError("Please select a CSV or Excel file");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError("");
      setSuccess("");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await weatherAPI.downloadTemplate();
      
      // Create blob and download
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "weather_data_template.xlsx";
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
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await weatherAPI.uploadFile(formData);
      
      const recordsAdded = response.data.records_added || 0;
      const recordsUpdated = response.data.records_updated || 0;
      const totalProcessed = recordsAdded + recordsUpdated;
      
      let successMsg = response.data.message;
      if (!successMsg || successMsg.includes('undefined')) {
        successMsg = `Successfully processed ${totalProcessed} weather records (${recordsAdded} added, ${recordsUpdated} updated)`;
      }
      
      setSuccess(successMsg);
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById("weather-file-input");
      if (fileInput) fileInput.value = "";
      
      // Call success callback but don't auto-close - let user read and close manually
      onSuccess?.();
      
    } catch (err) {
      console.error('Weather upload error:', err);
      let errorMsg = "Failed to upload file. Please check the format and try again.";
      
      if (err.response) {
        // Server responded with error
        errorMsg = err.response.data?.error || err.response.data?.message || errorMsg;
        
        // Check for authentication errors
        if (err.response.status === 401) {
          errorMsg = "Authentication required. Please log in first.";
        } else if (err.response.status === 403) {
          errorMsg = "Access denied. Only Admin and Analyst users can upload weather data.";
        }
      } else if (err.request) {
        // Request made but no response
        errorMsg = "No response from server. Please check if the backend is running.";
      }
      
      setError(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError("");
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
              <span className="text-3xl">🌤️</span>
              Upload Weather Data
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
              <span>📥</span>
              Download Template
            </h3>
            <p className="text-sm text-green-800 mb-3">
              Download the Excel template with pre-filled column headers and sample dates.
              Just fill in the weather data and upload!
            </p>
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
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  file 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-primary-400 bg-gray-50'
                }`}>
                  <input
                    id="weather-file-input"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {file ? (
                    <div className="flex items-center justify-center gap-2 text-green-700">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold">{file.name}</p>
                        <p className="text-sm">Click to change file</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="font-medium">Click to select file</p>
                      <p className="text-sm">CSV, XLSX, or XLS</p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-2">
              <span className="text-xl">❌</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-start gap-2">
              <span className="text-xl">✅</span>
              <span className="flex-1">{success}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                !file || uploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:shadow-lg text-white'
              }`}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Upload Weather Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
