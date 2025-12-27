import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

function ForecastChart({ historicalData = [], forecastData = [], title = "Forecast Chart" }) {
  // Combine historical and forecast data
  const chartData = [
    ...historicalData.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actual: item.quantity,
      type: 'historical'
    })),
    ...forecastData.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      forecast: item.predicted_quantity,
      type: 'forecast'
    }))
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border-2 border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].payload.date}</p>
          {payload[0].payload.actual !== undefined && (
            <p className="text-blue-600">
              Actual: <span className="font-bold">{payload[0].payload.actual} units</span>
            </p>
          )}
          {payload[0].payload.forecast !== undefined && (
            <p className="text-green-600">
              Forecast: <span className="font-bold">{payload[0].payload.forecast} units</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        📈 {title}
      </h3>
      
      {chartData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No data available for chart</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'Units', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: '#2563eb', r: 4 }}
              name="Historical Sales"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#10b981', r: 4 }}
              name="Forecasted Demand"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )}
      
      <div className="mt-4 flex gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 bg-blue-600"></div>
          <span className="text-gray-700">Historical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 bg-green-600 border-dashed border-2 border-green-600"></div>
          <span className="text-gray-700">Forecast</span>
        </div>
      </div>
    </div>
  );
}

export default ForecastChart;
