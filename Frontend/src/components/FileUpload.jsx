import React, { useState } from "react";
import axios from "axios";
import { MEDICINES_API } from "../config";

function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("⚠️ Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await axios.post(`${MEDICINES_API}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(`✅ ${res.data.message}`);
      onUploadSuccess && onUploadSuccess();
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.error || "Upload failed."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-3 shadow-sm mb-4">
      <h5>Upload Medicines</h5>
      <input
        type="file"
        onChange={handleFileChange}
        className="form-control mt-2"
      />
      <button
        onClick={handleUpload}
        className="btn btn-secondary mt-3"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload File"}
      </button>
      {message && <p className="mt-2">{message}</p>}
      <p className="text-muted small mt-2">
        Supported formats: <strong>.csv</strong> or <strong>.xlsx</strong>
        <br />
        Required columns: formula, medicineId, name, stock, forecast,
        stockStatus
      </p>
    </div>
  );
}

export default FileUpload;
