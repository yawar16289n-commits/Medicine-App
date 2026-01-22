import { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";
import { weatherAPI } from "../utils/api";
import WeatherUpload from "../components/WeatherUpload";

const TIME_RANGES = {
  "1M": { label: "1 Month", days: 30 },
  "6M": { label: "6 Months", days: 180 },
  "1Y": { label: "1 Year", days: 365 },
  "14D": { label: "14 Days Forecast", days: 14 },
  "28D": { label: "28 Days Forecast", days: 28 },
};

export default function WeatherAnalytics() {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState("1Y");
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [dataSource, setDataSource] = useState("csv"); // "csv" or "api"
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  useEffect(() => {
    if (selectedRange === "14D" || selectedRange === "28D") {
      loadWeatherFromAPI();
      setDataSource("api");
    } else {
      loadWeatherData();
      setDataSource("csv");
    }
  }, [selectedRange]);

  const loadWeatherFromAPI = async () => {
    try {
      setLoading(true);
      const response = await weatherAPI.getAll({ days: 730, include_forecast: true });
      
      const processedData = response.data.data
        .map(row => ({
          date: new Date(row.date),
          apparentTempMean: parseFloat(row.apparentTemperatureMean),
          apparentTempMin: parseFloat(row.apparentTemperatureMin),
          apparentTempMax: parseFloat(row.apparentTemperatureMax),
          humidityMean: parseFloat(row.relativeHumidity2mMean),
          humidityMin: parseFloat(row.relativeHumidity2mMin),
          humidityMax: parseFloat(row.relativeHumidity2mMax),
          isForecast: row.isForecast || false,
        }))
        .sort((a, b) => a.date - b.date);
      
      setWeatherData(processedData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading weather data from API:", error);
      // Fallback to CSV if API fails
      loadWeatherData();
    }
  };

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/karachi_weather_2023_2024_2.csv");
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          const processedData = results.data
            .filter(row => row.date && row.apparent_temperature_mean)
            .map(row => ({
              date: new Date(row.date),
              apparentTempMean: parseFloat(row.apparent_temperature_mean),
              apparentTempMin: parseFloat(row.apparent_temperature_min),
              apparentTempMax: parseFloat(row.apparent_temperature_max),
              humidityMean: parseFloat(row.relative_humidity_2m_mean),
              humidityMin: parseFloat(row.relative_humidity_2m_min),
              humidityMax: parseFloat(row.relative_humidity_2m_max),
              isForecast: false,
            }))
            .sort((a, b) => a.date - b.date);
          
          setWeatherData(processedData);
          setLoading(false);
        },
      });
    } catch (error) {
      console.error("Error loading weather data:", error);
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (weatherData.length === 0) return [];
    
    // For forecast view, show only forecast data
    if (selectedRange === "14D" || selectedRange === "28D") {
      return weatherData.filter(d => d.isForecast);
    }
    
    // For custom range
    if (selectedRange === "CUSTOM") {
      if (!customStartDate || !customEndDate) return weatherData.filter(d => !d.isForecast);
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      return weatherData.filter(d => d.date >= start && d.date <= end && !d.isForecast);
    }
    
    // For historical views, show only historical data
    const latestDate = weatherData[weatherData.length - 1].date;
    const cutoffDate = new Date(latestDate);
    const rangeConfig = TIME_RANGES[selectedRange];
    if (!rangeConfig) return weatherData.filter(d => !d.isForecast);
    cutoffDate.setDate(cutoffDate.getDate() - rangeConfig.days);
    
    return weatherData.filter(d => d.date >= cutoffDate && !d.isForecast);
  }, [weatherData, selectedRange, customStartDate, customEndDate]);

  const chartDimensions = {
    width: 1000,
    height: 400,
    padding: { top: 20, right: 20, bottom: 60, left: 60 },
  };

  const chartWidth = chartDimensions.width - chartDimensions.padding.left - chartDimensions.padding.right;
  const chartHeight = chartDimensions.height - chartDimensions.padding.top - chartDimensions.padding.bottom;

  const scales = useMemo(() => {
    if (filteredData.length === 0) return null;

    const tempMin = Math.min(...filteredData.map(d => d.apparentTempMin));
    const tempMax = Math.max(...filteredData.map(d => d.apparentTempMax));
    const humidityMax = Math.max(...filteredData.map(d => d.humidityMax));

    return {
      x: (date) => {
        const minDate = filteredData[0].date.getTime();
        const maxDate = filteredData[filteredData.length - 1].date.getTime();
        return ((date.getTime() - minDate) / (maxDate - minDate)) * chartWidth;
      },
      yTemp: (temp) => {
        const range = tempMax - tempMin;
        const padding = range * 0.1;
        return chartHeight - ((temp - (tempMin - padding)) / (range + 2 * padding)) * chartHeight;
      },
      yHumidity: (humidity) => {
        return chartHeight - (humidity / (humidityMax + 10)) * chartHeight;
      },
      tempMin: tempMin,
      tempMax: tempMax,
      humidityMax: humidityMax,
    };
  }, [filteredData, chartWidth, chartHeight]);

  const handlePointClick = (dataPoint, index) => {
    setSelectedPoint(selectedPoint?.index === index ? null : { ...dataPoint, index });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (filteredData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-yellow-100 border-2 border-yellow-400 text-yellow-700 px-6 py-4 rounded-xl flex items-center">
          <span className="text-2xl mr-3">⚠️</span>
          <span>No weather data available</span>
        </div>
      </div>
    );
  }

  // Downsample data for performance (show every nth point based on range)
  const sampleRate = Math.max(1, Math.floor(filteredData.length / 200));
  const displayData = filteredData.filter((_, i) => i % sampleRate === 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
            <span className="text-4xl mr-3">🌤️</span>
            Karachi Weather Analytics
          </h1>
          <p className="text-gray-600">
            Interactive weather trends showing apparent temperature and humidity patterns
          </p>
        </div>

        {/* Time Range Selector and Upload Button */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Select Time Range</h3>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:shadow-lg text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
            >
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  {/* Cloud */}
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9"
  />

  {/* Arrow – pushed DOWN more */}
  <g transform="translate(0,6)">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 6l3-3m0 0l3 3m-3-3v10"
    />
  </g>
</svg>
              Upload Weather Data
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(TIME_RANGES).map(([key, { label }]) => (
              <button
                key={key}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedRange === key
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedRange(key)}
              >
                {label}
              </button>
            ))}
            <button
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedRange === "CUSTOM"
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedRange("CUSTOM")}
            >
              Custom Range
            </button>
          </div>
          
          {/* Custom Date Range Inputs */}
          {selectedRange === "CUSTOM" && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    max={customEndDate || new Date().toISOString().split('T')[0]}
                    min={weatherData.length > 0 ? weatherData.filter(d => !d.isForecast)[0]?.date.toISOString().split('T')[0] : ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    min={customStartDate}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-600 mt-3">
            Showing {filteredData.length} days of data
          </p>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Weather Trends</h3>
          <div className="overflow-x-auto">
            <svg
              width={chartDimensions.width}
              height={chartDimensions.height}
              style={{ maxWidth: "100%", height: "auto" }}
            >
              <g transform={`translate(${chartDimensions.padding.left}, ${chartDimensions.padding.top})`}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                  <line
                    key={ratio}
                    x1={0}
                    y1={chartHeight * ratio}
                    x2={chartWidth}
                    y2={chartHeight * ratio}
                    stroke="#e0e0e0"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                ))}

                {/* Y-axis labels (Temperature) */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const temp = scales.tempMin + (scales.tempMax - scales.tempMin) * (1 - ratio);
                  return (
                    <text
                      key={`temp-${ratio}`}
                      x={-10}
                      y={chartHeight * ratio}
                      textAnchor="end"
                      fontSize="11"
                      fill="#666"
                      dominantBaseline="middle"
                    >
                      {temp.toFixed(1)}°C
                    </text>
                  );
                })}

                {/* Y-axis label */}
                <text
                  x={-45}
                  y={chartHeight / 2}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#333"
                  fontWeight="bold"
                  transform={`rotate(-90, -45, ${chartHeight / 2})`}
                >
                  Apparent Temperature (°C)
                </text>

                {/* Humidity area (background) */}
                <path
                  d={`
                    M 0,${chartHeight}
                    ${displayData
                      .map((d) => `L ${scales.x(d.date)},${scales.yHumidity(d.humidityMean)}`)
                      .join(" ")}
                    L ${scales.x(displayData[displayData.length - 1].date)},${chartHeight}
                    Z
                  `}
                  fill="#87CEEB"
                  opacity="0.2"
                />

                {/* Humidity line */}
                <path
                  d={`
                    M ${scales.x(displayData[0].date)},${scales.yHumidity(displayData[0].humidityMean)}
                    ${displayData
                      .slice(1)
                      .map((d) => `L ${scales.x(d.date)},${scales.yHumidity(d.humidityMean)}`)
                      .join(" ")}
                  `}
                  fill="none"
                  stroke="#4682B4"
                  strokeWidth="2"
                  opacity="0.5"
                />

                {/* Temperature area - Historical */}
                {(() => {
                  const historicalData = displayData.filter(d => !d.isForecast);
                  if (historicalData.length === 0) return null;
                  return (
                    <path
                      d={`
                        M ${scales.x(historicalData[0].date)},${scales.yTemp(historicalData[0].apparentTempMin)}
                        ${historicalData
                          .map((d) => `L ${scales.x(d.date)},${scales.yTemp(d.apparentTempMin)}`)
                          .join(" ")}
                        ${historicalData
                          .slice()
                          .reverse()
                          .map((d) => `L ${scales.x(d.date)},${scales.yTemp(d.apparentTempMax)}`)
                          .join(" ")}
                        Z
                      `}
                      fill="#FF6B6B"
                      opacity="0.2"
                    />
                  );
                })()}

                {/* Temperature area - Forecast */}
                {(() => {
                  const forecastData = displayData.filter(d => d.isForecast);
                  if (forecastData.length === 0) return null;
                  return (
                    <path
                      d={`
                        M ${scales.x(forecastData[0].date)},${scales.yTemp(forecastData[0].apparentTempMin)}
                        ${forecastData
                          .map((d) => `L ${scales.x(d.date)},${scales.yTemp(d.apparentTempMin)}`)
                          .join(" ")}
                        ${forecastData
                          .slice()
                          .reverse()
                          .map((d) => `L ${scales.x(d.date)},${scales.yTemp(d.apparentTempMax)}`)
                          .join(" ")}
                        Z
                      `}
                      fill="#FF6B6B"
                      opacity="0.2"
                    />
                  );
                })()}

                {/* Temperature mean line - Historical */}
                {(() => {
                  const historicalData = displayData.filter(d => !d.isForecast);
                  if (historicalData.length === 0) return null;
                  return (
                    <path
                      d={`
                        M ${scales.x(historicalData[0].date)},${scales.yTemp(historicalData[0].apparentTempMean)}
                        ${historicalData
                          .slice(1)
                          .map((d) => `L ${scales.x(d.date)},${scales.yTemp(d.apparentTempMean)}`)
                          .join(" ")}
                      `}
                      fill="none"
                      stroke="#FF6B6B"
                      strokeWidth="3"
                    />
                  );
                })()}

                {/* Temperature mean line - Forecast */}
                {(() => {
                  const forecastData = displayData.filter(d => d.isForecast);
                  if (forecastData.length === 0) return null;
                  return (
                    <path
                      d={`
                        M ${scales.x(forecastData[0].date)},${scales.yTemp(forecastData[0].apparentTempMean)}
                        ${forecastData
                          .slice(1)
                          .map((d) => `L ${scales.x(d.date)},${scales.yTemp(d.apparentTempMean)}`)
                          .join(" ")}
                      `}
                      fill="none"
                      stroke="#FF6B6B"
                      strokeWidth="3"
                    />
                  );
                })()}

                {/* Invisible clickable areas for interaction */}
                <rect
                  x={0}
                  y={0}
                  width={chartWidth}
                  height={chartHeight}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left; // Don't subtract padding - rect is already in transformed space
                    
                    // Convert x-coordinate back to a date
                    const minDate = filteredData[0].date.getTime();
                    const maxDate = filteredData[filteredData.length - 1].date.getTime();
                    const clickedTime = minDate + (x / chartWidth) * (maxDate - minDate);
                    
                    // Find the closest point in filteredData
                    let closestIndex = 0;
                    let minDistance = Math.abs(filteredData[0].date.getTime() - clickedTime);
                    
                    for (let i = 1; i < filteredData.length; i++) {
                      const distance = Math.abs(filteredData[i].date.getTime() - clickedTime);
                      if (distance < minDistance) {
                        minDistance = distance;
                        closestIndex = i;
                      }
                    }
                    
                    handlePointClick(filteredData[closestIndex], closestIndex);
                  }}
                />
                
                {/* Selected point indicator */}
                {selectedPoint && (
                  <>
                    <line
                      x1={scales.x(selectedPoint.date)}
                      y1={0}
                      x2={scales.x(selectedPoint.date)}
                      y2={chartHeight}
                      stroke="#FF4444"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                    <circle
                      cx={scales.x(selectedPoint.date)}
                      cy={scales.yTemp(selectedPoint.apparentTempMean)}
                      r={6}
                      fill="#FF4444"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </>
                )}

                {/* X-axis */}
                <line
                  x1={0}
                  y1={chartHeight}
                  x2={chartWidth}
                  y2={chartHeight}
                  stroke="#333"
                  strokeWidth="2"
                />

                {/* X-axis labels */}
                {displayData.filter((_, i) => i % Math.max(1, Math.floor(displayData.length / 8)) === 0).map((d, i) => (
                  <text
                    key={i}
                    x={scales.x(d.date)}
                    y={chartHeight + 20}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#666"
                  >
                    {d.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </text>
                ))}

                {/* Legend */}
                <g transform={`translate(${chartWidth - 200}, 10)`}>
                  <rect x={0} y={0} width={15} height={15} fill="#FF6B6B" />
                  <text x={20} y={12} fontSize="12" fill="#333">
                    Temperature
                  </text>
                  <rect x={0} y={25} width={15} height={15} fill="#4682B4" opacity="0.7" />
                  <text x={20} y={37} fontSize="12" fill="#333">
                    Humidity
                  </text>
                </g>
              </g>
            </svg>
          </div>
        </div>

        {/* Selected Point Details */}
        {selectedPoint && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-4 flex justify-between items-center">
              <h5 className="text-xl font-bold flex items-center gap-2">
                📊 Weather Details - {formatDate(selectedPoint.date)}
              </h5>
              <button
                className="text-white hover:bg-white hover:text-primary-500 px-3 py-1 rounded-lg transition-all font-semibold"
                onClick={() => setSelectedPoint(null)}
              >
                ✕ Close
              </button>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Temperature Section */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 p-5 rounded-xl border-2 border-red-200">
                  <h6 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
                    🌡️ Apparent Temperature
                  </h6>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">Mean:</span>
                      <span className="text-2xl font-bold text-gray-900">{selectedPoint.apparentTempMean.toFixed(2)}°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">Minimum:</span>
                      <span className="text-xl font-bold text-blue-600">{selectedPoint.apparentTempMin.toFixed(2)}°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">Maximum:</span>
                      <span className="text-xl font-bold text-red-600">{selectedPoint.apparentTempMax.toFixed(2)}°C</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t-2 border-red-200">
                      <span className="text-gray-700 font-semibold">Range:</span>
                      <span className="text-xl font-bold text-orange-600">{(selectedPoint.apparentTempMax - selectedPoint.apparentTempMin).toFixed(2)}°C</span>
                    </div>
                  </div>
                </div>

                {/* Humidity Section */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border-2 border-blue-200">
                  <h6 className="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
                    💧 Relative Humidity
                  </h6>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">Mean:</span>
                      <span className="text-2xl font-bold text-gray-900">{selectedPoint.humidityMean.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">Minimum:</span>
                      <span className="text-xl font-bold text-yellow-600">{selectedPoint.humidityMin.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">Maximum:</span>
                      <span className="text-xl font-bold text-cyan-600">{selectedPoint.humidityMax.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t-2 border-blue-200">
                      <span className="text-gray-700 font-semibold">Range:</span>
                      <span className="text-xl font-bold text-blue-600">{(selectedPoint.humidityMax - selectedPoint.humidityMin).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3">
            <h6 className="text-lg font-semibold">Temperature Summary ({TIME_RANGES[selectedRange]?.label || selectedRange})</h6>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <h3 className="text-4xl font-bold text-blue-600">
                  {(filteredData.reduce((sum, d) => sum + d.apparentTempMean, 0) / filteredData.length).toFixed(1)}°C
                </h3>
                <small className="text-gray-600">Average</small>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-cyan-600">
                  {Math.min(...filteredData.map(d => d.apparentTempMin)).toFixed(1)}°C
                </h3>
                <small className="text-gray-600">Coldest</small>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-red-600">
                  {Math.max(...filteredData.map(d => d.apparentTempMax)).toFixed(1)}°C
                </h3>
                <small className="text-gray-600">Hottest</small>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3">
            <h6 className="text-lg font-semibold">Humidity Summary ({TIME_RANGES[selectedRange]?.label || selectedRange})</h6>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <h3 className="text-4xl font-bold text-blue-600">
                  {(filteredData.reduce((sum, d) => sum + d.humidityMean, 0) / filteredData.length).toFixed(1)}%
                </h3>
                <small className="text-gray-600">Average</small>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-yellow-600">
                  {Math.min(...filteredData.map(d => d.humidityMin)).toFixed(1)}%
                </h3>
                <small className="text-gray-600">Driest</small>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-cyan-600">
                  {Math.max(...filteredData.map(d => d.humidityMax)).toFixed(1)}%
                </h3>
                <small className="text-gray-600">Most Humid</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Weather Upload Modal */}
      <WeatherUpload
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => {
          // Reload data after successful upload
          if (selectedRange === "14D" || selectedRange === "28D") {
            loadWeatherFromAPI();
          } else {
            loadWeatherFromAPI(); // Switch to API data to see uploaded records
          }
        }}
      />
    </div>
  );
}
