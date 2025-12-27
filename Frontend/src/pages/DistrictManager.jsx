import React, { useState, useEffect } from "react";
import { districtsAPI } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

export default function DistrictManager() {
  const [districts, setDistricts] = useState([]);
  const [formData, setFormData] = useState({ name: "", areaCode: "" });
  const [editing, setEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDistricts = async () => {
    try {
      const res = await districtsAPI.getAll();
      setDistricts(res.data);
    } catch (err) {
      console.error("Error fetching districts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert("District name is required");
      return;
    }

    try {
      if (editing) {
        await districtsAPI.update(currentId, formData);
      } else {
        await districtsAPI.create(formData);
      }
      setFormData({ name: "", areaCode: "" });
      setEditing(false);
      setCurrentId(null);
      fetchDistricts();
    } catch (err) {
      console.error("Error saving district:", err);
      alert(err.response?.data?.error || "Failed to save district");
    }
  };

  const handleEdit = (district) => {
    setFormData({ name: district.name, areaCode: district.areaCode || "" });
    setEditing(true);
    setCurrentId(district.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This will delete all associated data.")) return;
    try {
      await districtsAPI.delete(id);
      fetchDistricts();
    } catch (err) {
      console.error("Error deleting district:", err);
      alert(err.response?.data?.error || "Failed to delete district");
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", areaCode: "" });
    setEditing(false);
    setCurrentId(null);
  };

  if (loading) {
    return <div className="text-center py-8">Loading districts...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">District Management</h1>
          <p className="text-gray-600">Manage sales districts and areas</p>
        </div>

        {/* Form */}
        {(user?.role === 'admin') && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">{editing ? "✏️" : "➕"}</span>
              {editing ? "Edit District" : "Add New District"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="District Name *"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Area Code (e.g., KC001)"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={formData.areaCode}
                  onChange={(e) => setFormData({ ...formData, areaCode: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    editing
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white"
                  }`}
                >
                  {editing ? "Update" : "Add District"}
                </button>
                {editing && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Districts List */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Districts ({districts.length})
          </h3>
          {districts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No districts found. Add your first district above.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {districts.map((district) => (
                <div
                  key={district.id}
                  className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">{district.name}</h4>
                      <p className="text-gray-600 text-sm mt-1">
                        Area Code: {district.areaCode || "N/A"}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Created: {new Date(district.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {user?.role === 'admin' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(district)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(district.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
