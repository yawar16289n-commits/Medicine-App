import { useState, useEffect } from "react";
import { formulasAPI } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

export default function FormulaManager() {
  const [formulas, setFormulas] = useState([]);
  const [formData, setFormData] = useState({
    name: ""
  });
  const [editing, setEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFormulas = async () => {
    try {
      const res = await formulasAPI.getAll();
      setFormulas(res.data);
    } catch (err) {
      console.error("Error fetching formulas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormulas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.name.trim()) {
      alert("Formula name is required");
      return;
    }

    try {
      if (editing) {
        await formulasAPI.update(currentId, formData);
        alert("Formula updated successfully!");
      } else {
        await formulasAPI.create(formData);
        alert("Formula created successfully!");
      }
      setFormData({ name: "" });
      setEditing(false);
      setCurrentId(null);
      fetchFormulas();
    } catch (err) {
      console.error("Error saving formula:", err);
      const errorMsg = err.response?.data?.error || "Failed to save formula";
      alert(errorMsg);
    }
  };

  const handleEdit = (formula) => {
    setFormData({
      name: formula.name
    });
    setEditing(true);
    setCurrentId(formula.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This will delete all associated medicines.")) return;
    try {
      await formulasAPI.delete(id);
      fetchFormulas();
    } catch (err) {
      console.error("Error deleting formula:", err);
      alert(err.response?.data?.error || "Failed to delete formula");
    }
  };

  const handleCancel = () => {
    setFormData({ name: "" });
    setEditing(false);
    setCurrentId(null);
  };

  if (loading) {
    return <div className="text-center py-8">Loading formulas...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Formula Management</h1>
          <p className="text-gray-600">Manage medicine formulas</p>
        </div>

        {/* Form */}
        {(user?.role === 'admin' || user?.role === 'data_operator') && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">{editing ? "✏️" : "➕"}</span>
              {editing ? "Edit Formula" : "Add New Formula"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Formula Name * (e.g., Paracetamol)"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
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
                  {editing ? "Update" : "Add Formula"}
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

        {/* Formulas List */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Formulas ({formulas.length})
          </h3>
          {formulas.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No formulas found. Add your first formula above.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formulas.map((formula) => (
                <div
                  key={formula.id}
                  className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xl font-semibold text-gray-900">{formula.name}</h4>
                    {(user?.role === 'admin' || user?.role === 'data_operator') && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(formula)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(formula.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
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
