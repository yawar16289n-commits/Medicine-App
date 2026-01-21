/**
 * ReportGenerationModal - Modal for generating PDF reports
 * Only accessible by admin and analyst roles
 */
import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../utils/api';

const ReportGenerationModal = ({ isOpen, onClose, reportType, entityId, entityName }) => {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Report type descriptions
  const reportDescriptions = {
    comprehensive: 'Complete annual report with all formulas, areas, and forecasts',
    'formula-summary': 'Summary report of all formula performance',
    'area-summary': 'Summary report of all area performance',
    formula: `Individual report for ${entityName || 'selected formula'}`,
    area: `Individual report for ${entityName || 'selected area'}`,
  };

  // Fetch available years when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableYears();
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const fetchAvailableYears = async () => {
    setLoadingYears(true);
    try {
      const response = await reportsAPI.getAvailableYears();
      const { years: availableYears, default: defaultYear } = response.data;
      setYears(availableYears);
      setSelectedYear(defaultYear || availableYears[0]);
    } catch (err) {
      console.error('Failed to fetch years:', err);
      if (err.response?.status === 403) {
        setError('Access denied. Only admin and analyst roles can generate reports.');
      } else {
        setError('Failed to load available years');
      }
    } finally {
      setLoadingYears(false);
    }
  };

  const handleDownload = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const generateReport = async () => {
    if (!selectedYear) {
      setError('Please select a year');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let response;
      let filename;

      switch (reportType) {
        case 'comprehensive':
          response = await reportsAPI.generateComprehensive(selectedYear);
          filename = `Comprehensive_Report_${selectedYear}.pdf`;
          break;
        case 'formula-summary':
          response = await reportsAPI.generateFormulaSummary(selectedYear);
          filename = `Formula_Summary_Report_${selectedYear}.pdf`;
          break;
        case 'area-summary':
          response = await reportsAPI.generateAreaSummary(selectedYear);
          filename = `Area_Summary_Report_${selectedYear}.pdf`;
          break;
        case 'formula':
          if (!entityId) {
            setError('No formula selected');
            return;
          }
          response = await reportsAPI.generateFormulaReport(entityId, selectedYear);
          filename = `Formula_${entityName?.replace(/\s+/g, '_') || entityId}_${selectedYear}.pdf`;
          break;
        case 'area':
          if (!entityId) {
            setError('No area selected');
            return;
          }
          response = await reportsAPI.generateAreaReport(entityId, selectedYear);
          filename = `Area_${entityName?.replace(/\s+/g, '_') || entityId}_${selectedYear}.pdf`;
          break;
        default:
          setError('Unknown report type');
          return;
      }

      handleDownload(response.data, filename);
      setSuccess(`Report generated successfully: ${filename}`);
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to generate report:', err);
      
      if (err.response?.status === 403) {
        setError('Access denied. Only admin and analyst roles can generate reports.');
      } else if (err.response?.status === 404) {
        setError('The requested entity was not found');
      } else if (err.response?.data instanceof Blob) {
        // Handle blob error responses (when backend returns JSON error with blob responseType)
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            setError(errorData.error || 'Failed to generate report');
          } catch {
            setError('Failed to generate report - server error');
          }
        };
        reader.readAsText(err.response.data);
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to generate report');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              📊 Generate Report
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {reportDescriptions[reportType] || 'Generate a PDF report'}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Year Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Year
            </label>
            {loadingYears ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-500">Loading years...</span>
              </div>
            ) : (
              <select
                value={selectedYear || ''}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || years.length === 0}
              >
                {years.length === 0 ? (
                  <option value="">No data available</option>
                ) : (
                  years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))
                )}
              </select>
            )}
          </div>

          {/* Report Type Info */}
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <strong className="text-gray-700">Report Type:</strong>{' '}
            {reportType === 'comprehensive' && 'Comprehensive Annual Report'}
            {reportType === 'formula-summary' && 'Formula Summary Report'}
            {reportType === 'area-summary' && 'Area Summary Report'}
            {reportType === 'formula' && `Individual Formula: ${entityName}`}
            {reportType === 'area' && `Individual Area: ${entityName}`}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={generateReport}
            disabled={loading || loadingYears || years.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerationModal;
