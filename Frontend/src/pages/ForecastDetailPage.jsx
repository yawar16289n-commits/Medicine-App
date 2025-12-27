import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { districtsAPI, forecastAPI, formulasAPI } from "../utils/api";
import ForecastChart from "../components/ForecastChart";

function ForecastDetailPage() {
  const { districtName, formulaName } = useParams();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [districtData, setDistrictData] = useState(null);
  const [expandedMedicines, setExpandedMedicines] = useState({});
  
  // Forecast options state
  const [forecastRange, setForecastRange] = useState("14"); // days: 14, 30, 90
  const [historicalRange, setHistoricalRange] = useState({ enabled: false, start: "", end: "" });
  const [forecastData, setForecastData] = useState(null);
  const [chartData, setChartData] = useState({ historical: [], forecast: [] });
  const [activeTab, setActiveTab] = useState("forecast"); // "forecast" or "medicines"

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get all districts to find the district ID
      const districtsResponse = await districtsAPI.getAll();
      const district = districtsResponse.data.find(
        d => d.name.toLowerCase() === districtName.toLowerCase()
      );

      if (!district) {
        setError(`District "${districtName}" not found`);
        setLoading(false);
        return;
      }

      setDistrictData(district);

      // Get formulas for this district
      const formulasResponse = await districtsAPI.getFormulas(district.id);
      const formula = formulasResponse.data.find(
        f => f.name.toLowerCase() === formulaName.toLowerCase()
      );

      if (!formula) {
        setError(`Formula "${formulaName}" not found in district "${district.name}"`);
        setLoading(false);
        return;
      }

      // Get medicines for this district and formula
      const medicinesResponse = await districtsAPI.getMedicines(district.id, formula.id);
      setMedicines(medicinesResponse.data);
      
    } catch (err) {
      console.error("Error fetching medicines:", err);
      setError("Failed to load medicines. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchForecastData = async (areaName, formName) => {
    try {
      const response = await forecastAPI.getAreaFormulaForecast({
        area: areaName,
        formula: formName.replace(/ /g, '_'),
        days: parseInt(forecastRange)
      });
      
      setForecastData(response.data);
      
      // Set chart data - only forecast initially
      setChartData({
        historical: [],
        forecast: response.data.forecast || []
      });
    } catch (err) {
      console.error("Error fetching forecast data:", err);
    }
  };
  
  const handleForecastRangeChange = (days) => {
    setForecastRange(days);
  };
  
  const handleHistoricalToggle = () => {
    setHistoricalRange(prev => ({ ...prev, enabled: !prev.enabled }));
  };
  
  const handleHistoricalDateChange = (field, value) => {
    setHistoricalRange(prev => ({ ...prev, [field]: value }));
  };
  
  const toggleMedicine = (medicineId) => {
    setExpandedMedicines(prev => ({
      ...prev,
      [medicineId]: !prev[medicineId]
    }));
  };

  const handleMedicineClick = (medicine) => {
    setSelectedMedicine(selectedMedicine?.id === medicine.id ? null : medicine);
  };

  useEffect(() => {
    fetchMedicines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districtName, formulaName]);

  // Separate useEffect for forecast data that updates when range changes
  useEffect(() => {
    if (districtData) {
      const formName = formulaName;
      fetchForecastData(districtData.name, formName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forecastRange, districtData]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 mt-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 mt-8">
        <div className="bg-red-50 border-l-4 border-red-400 text-red-800 p-6 rounded-lg">
          <h5 className="text-xl font-bold mb-2 flex items-center gap-2">⚠️ Error</h5>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => navigate("/forecast")}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            ← Back to Forecast
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button 
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-primary-500 transition-all flex items-center gap-2 font-semibold mb-4"
            onClick={() => navigate("/forecast")}
          >
            ← Back to Forecast
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            💊 {formulaName.charAt(0).toUpperCase() + formulaName.slice(1)}
          </h1>
          <p className="text-gray-600">
            District: <span className="font-semibold">{districtData?.name}</span> 
            {districtData?.areaCode && <span className="text-sm ml-2">({districtData.areaCode})</span>}
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-4">
            <h5 className="text-xl font-bold">Formula Details</h5>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2 text-sm uppercase tracking-wide">Total Medicines</p>
                <h3 className="text-5xl font-bold text-blue-600">{medicines.length}</h3>
              </div>
              <div className="text-center">
                <p className="text-gray-600 mb-2 text-sm uppercase tracking-wide">Total Forecast</p>
                <h3 className="text-5xl font-bold text-green-600">
                  {forecastData?.summary?.total_forecast ? Math.round(forecastData.summary.total_forecast).toLocaleString() : '0'}
                </h3>
              </div>
              <div className="text-center">
                <p className="text-gray-600 mb-2 text-sm uppercase tracking-wide">Forecast Period</p>
                <p className="text-3xl font-bold text-gray-900">{forecastRange} days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Forecast Date Options */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 p-6">
          <h5 className="text-lg font-bold text-gray-900 mb-4">📅 Forecast Options</h5>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Forecast Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forecast Period
              </label>
              <div className="flex gap-2">
                {["14", "30", "90"].map(days => (
                  <button
                    key={days}
                    onClick={() => handleForecastRangeChange(days)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${ forecastRange === days
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {days === "14" ? "2 Weeks" : days === "30" ? "1 Month" : "3 Months"}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Historical Sales Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Historical Sales Range
              </label>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={handleHistoricalToggle}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    historicalRange.enabled
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {historicalRange.enabled ? '✓ Enabled' : 'Show Historical'}
                </button>
              </div>
              {historicalRange.enabled && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={historicalRange.start}
                    onChange={(e) => handleHistoricalDateChange('start', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                    placeholder="Start date"
                  />
                  <input
                    type="date"
                    value={historicalRange.end}
                    onChange={(e) => handleHistoricalDateChange('end', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                    placeholder="End date"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("forecast")}
              className={`flex-1 px-6 py-4 text-lg font-semibold transition-all ${
                activeTab === "forecast"
                  ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              📈 Forecast
            </button>
            <button
              onClick={() => setActiveTab("medicines")}
              className={`flex-1 px-6 py-4 text-lg font-semibold transition-all ${
                activeTab === "medicines"
                  ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              💊 Medicines ({medicines.length})
            </button>
          </div>
        </div>

        {/* Forecast Tab Content */}
        {activeTab === "forecast" && forecastData && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 p-6">
            <h5 className="text-lg font-bold text-gray-900 mb-4">📈 Forecast Chart</h5>
            <ForecastChart
              historicalData={chartData.historical}
              forecastData={chartData.forecast}
              title={`${districtData?.name} - ${formulaName} Forecast`}
            />
          </div>
        )}

        {/* Medicines Tab Content */}
        {activeTab === "medicines" && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-4">
            <h5 className="text-xl font-bold flex items-center gap-2">
              💊 Medicines ({medicines.length})
            </h5>
          </div>
          <div className="p-6">
            {medicines.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-600 text-lg">No medicines found for this formula in this district.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medicines.map((medicine) => (
                  <div
                    key={medicine.id}
                    className="border-2 border-gray-200 rounded-xl overflow-hidden"
                  >
                    {/* Medicine Header */}
                    <div
                      className="bg-gray-50 px-5 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-all"
                      onClick={() => toggleMedicine(medicine.id)}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`text-gray-600 transition-transform ${expandedMedicines[medicine.id] ? "rotate-90" : ""}`}>▶</span>
                        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                          {medicine.brandName?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{medicine.brandName}</h3>
                          <p className="text-gray-600 text-sm">
                            {medicine.medicineId} • {medicine.dosageStrength || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {forecastData && (
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Forecast ({forecastRange} days)</p>
                            <p className="text-2xl font-bold text-green-600">
                              {Math.round((forecastData.summary?.total_forecast || 0) / medicines.length).toLocaleString()}
                            </p>
                          </div>
                        )}
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Stock Level</p>
                          <p className={`text-2xl font-bold ${
                            medicine.stockLevel === 0 ? 'text-red-600' :
                            medicine.stockLevel <= 100 ? 'text-amber-600' :
                            'text-green-600'
                          }`}>
                            {medicine.stockLevel || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Medicine Dropdown Content with Graph */}
                    {expandedMedicines[medicine.id] && (
                      <div className="p-6 bg-white border-t-2 border-gray-200">
                        {/* Medicine Stats */}
                        <div className="grid md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Medicine ID</p>
                            <p className="text-lg font-bold text-gray-900">{medicine.medicineId}</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Therapeutic Class</p>
                            <p className="text-lg font-bold text-gray-900">
                              {medicine.therapeuticClass || 'Not specified'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Stock Status</p>
                            <p className={`text-lg font-bold ${
                              medicine.stockLevel === 0 ? 'text-red-600' :
                              medicine.stockLevel <= 100 ? 'text-amber-600' :
                              'text-green-600'
                            }`}>
                              {medicine.stockLevel === 0 ? 'Out of Stock' :
                               medicine.stockLevel <= 100 ? 'Low Stock' :
                               'In Stock'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Dosage</p>
                            <p className="text-lg font-bold text-gray-900">{medicine.dosageStrength || 'N/A'}</p>
                          </div>
                        </div>

                        {/* Graph Placeholder */}
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                          <h6 className="font-bold text-blue-900 mb-2">📊 Medicine-Specific Graph</h6>
                          <p className="text-sm text-blue-800">
                            Sales and forecast graph for {medicine.brandName} will be displayed here according to the selected date range 
                            {historicalRange.enabled && ` (Historical: ${historicalRange.start || 'start'} to ${historicalRange.end || 'end'})`}
                            {!historicalRange.enabled && ` (Forecast only: ${forecastRange} days)`}.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>        )}      </div>
    </div>
  );
}

export default ForecastDetailPage;
