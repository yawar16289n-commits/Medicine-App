import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { forecastAPI, districtsAPI, formulasAPI } from "../utils/api";
import { DEFAULT_FORECAST_PERIODS, FEATURES } from "../utils/constants";
import ForecastChart from "../components/ForecastChart";

function ForecastPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Parameter selection: '', 'area', or 'formula'
  const [viewParameter, setViewParameter] = useState('');
  const [selectedDays, setSelectedDays] = useState(DEFAULT_FORECAST_PERIODS * 7);
  
  // Data lists
  const [districts, setDistricts] = useState([]);
  const [formulas, setFormulas] = useState([]);
  
  // Filter selections
  const [filterArea, setFilterArea] = useState(''); // When viewing by area
  const [filterFormula, setFilterFormula] = useState(''); // When viewing by formula
  
  // Forecast data by area or formula
  const [areaForecasts, setAreaForecasts] = useState([]); // Array of {area, formulas: [{formula, forecast}]}
  const [formulaForecasts, setFormulaForecasts] = useState([]); // Array of {formula, areas: [{area, forecast}]}
  
  // Expansion states
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    fetchDistrictsAndFormulas();
  }, []);
  
  const fetchDistrictsAndFormulas = async () => {
    try {
      setLoading(true);
      const [districtsRes, formulasRes] = await Promise.all([
        districtsAPI.getAll(),
        formulasAPI.getAll()
      ]);
      setDistricts(districtsRes.data || []);
      setFormulas(formulasRes.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch districts/formulas:", err);
      setError("Failed to load data");
      setLoading(false);
    }
  };
  
  const fetchAreaForecasts = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const areasToFetch = filterArea ? [districts.find(d => d.name === filterArea)] : districts;
      const results = [];
      
      for (const area of areasToFetch) {
        if (!area) continue;
        
        // Get formulas for this area
        const formulasRes = await districtsAPI.getFormulas(area.id);
        const areaFormulas = formulasRes.data || [];
        
        // Fetch forecast for each formula in this area
        const formulaForecasts = [];
        for (const formula of areaFormulas) {
          try {
            const forecastRes = await forecastAPI.getAreaFormulaForecast({
              area: area.name,
              formula: formula.name.replace(/ /g, '_'),
              days: selectedDays
            });
            formulaForecasts.push({
              formula: formula.name,
              totalForecast: forecastRes.data.summary?.total_forecast || 0,
              forecastData: forecastRes.data.forecast || []
            });
          } catch (err) {
            console.error(`Failed to fetch forecast for ${area.name} - ${formula.name}:`, err);
          }
        }
        
        results.push({
          area: area.name,
          formulas: formulaForecasts
        });
      }
      
      setAreaForecasts(results);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch area forecasts:", err);
      setError("Failed to load area forecasts");
      setLoading(false);
    }
  }, [filterArea, selectedDays, districts, formulas]);
  
  const fetchFormulaForecasts = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const formulasToFetch = filterFormula 
        ? [formulas.find(f => f.name.replace(/ /g, '_') === filterFormula)] 
        : formulas;
      const results = [];
      
      for (const formula of formulasToFetch) {
        if (!formula) continue;
        
        // Get districts for this formula
        const districtsRes = await formulasAPI.getDistricts(formula.id);
        const formulaDistricts = districtsRes.data || [];
        
        // Fetch forecast for each area where this formula is sold
        const areaForecasts = [];
        let totalForecast = 0;
        
        for (const district of formulaDistricts) {
          try {
            const forecastRes = await forecastAPI.getAreaFormulaForecast({
              area: district.name,
              formula: formula.name.replace(/ /g, '_'),
              days: selectedDays
            });
            const forecast = forecastRes.data.summary?.total_forecast || 0;
            areaForecasts.push({
              area: district.name,
              forecast: forecast,
              forecastData: forecastRes.data.forecast || []
            });
            totalForecast += forecast;
          } catch (err) {
            console.error(`Failed to fetch forecast for ${district.name} - ${formula.name}:`, err);
          }
        }
        
        results.push({
          formula: formula.name,
          totalForecast: totalForecast,
          areas: areaForecasts
        });
      }
      
      setFormulaForecasts(results);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch formula forecasts:", err);
      setError("Failed to load formula forecasts");
      setLoading(false);
    }
  }, [filterFormula, selectedDays, formulas]);
  
  useEffect(() => {
    if (viewParameter === 'area') {
      fetchAreaForecasts();
    } else if (viewParameter === 'formula') {
      fetchFormulaForecasts();
    }
  }, [viewParameter, selectedDays, filterArea, filterFormula, fetchAreaForecasts, fetchFormulaForecasts]);
  
  const toggleItem = (itemKey) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };
  
  const handleParameterChange = (param) => {
    setViewParameter(param);
    setFilterArea('');
    setFilterFormula('');
    setExpandedItems({});
    setAreaForecasts([]);
    setFormulaForecasts([]);
  };
  
  const navigateToDetail = (areaName, formulaName) => {
    navigate(`/forecast/${areaName.toLowerCase()}/${formulaName.toLowerCase().replace(/ /g, '%20')}`);
  };

  const formatNumber = (num) => {
    return num ? Math.round(num).toLocaleString() : "0";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-6 rounded-lg">
            <h5 className="text-xl font-bold mb-2">⚠️ Error</h5>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            🏢 Medicine Demand Forecast
          </h1>
          <p className="text-gray-600">View forecasts by area or by formula</p>
        </div>
        
        {/* Parameters Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 p-6">
          <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            🔍 Forecast Parameters
          </h5>
          <div className="grid md:grid-cols-3 gap-4">
            {/* View Parameter Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View By
              </label>
              <select
                value={viewParameter}
                onChange={(e) => handleParameterChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Parameter</option>
                <option value="area">Area</option>
                <option value="formula">Formula</option>
              </select>
            </div>
            
            {/* Conditional Filter Dropdown */}
            {viewParameter === 'area' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Area (Optional)
                </label>
                <select
                  value={filterArea}
                  onChange={(e) => setFilterArea(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Areas</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.name}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {viewParameter === 'formula' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Formula (Optional)
                </label>
                <select
                  value={filterFormula}
                  onChange={(e) => setFilterFormula(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Formulas</option>
                  {formulas.map((formula) => (
                    <option key={formula.id} value={formula.name.replace(/ /g, '_')}>
                      {formula.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Forecast Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forecast Days
              </label>
              <select
                value={selectedDays}
                onChange={(e) => setSelectedDays(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Forecast Results */}
        {!viewParameter ? (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
            <p className="text-blue-800 text-lg font-medium">
              📊 Please select a view parameter (Area or Formula) to see forecast results
            </p>
          </div>
        ) : viewParameter === 'area' ? (
          /* View by Area */
          <div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">📍 Forecast by Area</h4>
            <div className="space-y-4">
              {areaForecasts.map((areaData, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden">
                  {/* Area Header */}
                  <div
                    onClick={() => toggleItem(`area-${idx}`)}
                    className="bg-gradient-to-r from-blue-100 to-cyan-100 px-6 py-4 flex justify-between items-center cursor-pointer hover:from-blue-200 hover:to-cyan-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-gray-600 transition-transform ${expandedItems[`area-${idx}`] ? "rotate-90" : ""}`}>▶</span>
                      <h5 className="text-xl font-bold text-gray-900">{areaData.area}</h5>
                      <span className="text-sm text-gray-600">({areaData.formulas.length} formulas)</span>
                    </div>
                    <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      {selectedDays} days
                    </span>
                  </div>
                  
                  {/* Formulas Dropdown */}
                  {expandedItems[`area-${idx}`] && (
                    <div className="p-6 bg-gray-50">
                      {areaData.formulas.length > 0 ? (
                        <div className="space-y-3">
                          {areaData.formulas.map((formulaData, fIdx) => (
                            <div
                              key={fIdx}
                              onClick={() => navigateToDetail(areaData.area, formulaData.formula)}
                              className="bg-white border-2 border-gray-200 rounded-xl p-5 flex justify-between items-center cursor-pointer hover:border-primary-400 hover:shadow-lg transition-all"
                            >
                              <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                  💊
                                </div>
                                <strong className="text-xl text-gray-900">{formulaData.formula}</strong>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">Total Forecast</p>
                                  <p className="text-2xl font-bold text-gray-900">
                                    {formatNumber(formulaData.totalForecast)}
                                  </p>
                                </div>
                                <span className="text-2xl text-gray-400">→</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-6 rounded-lg">
                          <p className="font-semibold">ℹ️ No formulas available for this area.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* View by Formula */
          <div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">💊 Forecast by Formula</h4>
            <div className="space-y-4">
              {formulaForecasts.map((formulaData, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden">
                  {/* Formula Header */}
                  <div
                    onClick={() => toggleItem(`formula-${idx}`)}
                    className="bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-4 flex justify-between items-center cursor-pointer hover:from-purple-200 hover:to-pink-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-gray-600 transition-transform ${expandedItems[`formula-${idx}`] ? "rotate-90" : ""}`}>▶</span>
                      <h5 className="text-xl font-bold text-gray-900">{formulaData.formula}</h5>
                      <span className="text-sm text-gray-600">({formulaData.areas.length} areas)</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Demand</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatNumber(formulaData.totalForecast)}
                        </p>
                      </div>
                      <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        {selectedDays} days
                      </span>
                    </div>
                  </div>
                  
                  {/* Areas Dropdown */}
                  {expandedItems[`formula-${idx}`] && (
                    <div className="p-6 bg-gray-50">
                      {formulaData.areas.length > 0 ? (
                        <div className="space-y-3">
                          {formulaData.areas.map((areaData, aIdx) => (
                            <div
                              key={aIdx}
                              onClick={() => navigateToDetail(areaData.area, formulaData.formula)}
                              className="bg-white border-2 border-gray-200 rounded-xl p-5 flex justify-between items-center cursor-pointer hover:border-primary-400 hover:shadow-lg transition-all"
                            >
                              <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                  📍
                                </div>
                                <strong className="text-xl text-gray-900">{areaData.area}</strong>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">Area Forecast</p>
                                  <p className="text-2xl font-bold text-gray-900">
                                    {formatNumber(areaData.forecast)}
                                  </p>
                                </div>
                                <span className="text-2xl text-gray-400">→</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-6 rounded-lg">
                          <p className="font-semibold">ℹ️ No areas available for this formula.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForecastPage;