import React, { useState } from "react";
import { medicinesAPI } from "../utils/api";

function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setErrors([]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("⚠️ Please select a file first.");
      setErrors([]);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await medicinesAPI.upload(formData);
      setMessage(`✅ ${res.data.message}`);
      setErrors([]);
      onUploadSuccess && onUploadSuccess();
    } catch (err) {
      const errorData = err.response?.data || {};
      setMessage(`❌ ${errorData.error || "Upload failed."}`);
      
      // Display detailed errors if available
      if (errorData.errors && Array.isArray(errorData.errors)) {
        setErrors(errorData.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-6">
      <h5 className="text-xl font-bold text-gray-900 mb-4">Upload Medicines</h5>
      <input
        type="file"
        onChange={handleFileChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
      />
      <button
        onClick={handleUpload}
        className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload File"}
      </button>
      {message && <p className="mt-3 text-sm font-semibold">{message}</p>}
      
      {errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h6 className="text-sm font-semibold text-red-800 mb-2">
            Validation Errors ({errors.length}):
          </h6>
          <ul className="space-y-1 text-sm text-red-700">
            {errors.map((error, idx) => (
              <li key={idx} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <p className="text-gray-600 text-sm mt-4">
        Supported formats: <strong>.csv</strong> or <strong>.xlsx</strong>
        <br />
        Required columns: formula, medicineId, name, stock, forecast,
        stockStatus
      </p>
    </div>
  );
}

export default FileUpload;
