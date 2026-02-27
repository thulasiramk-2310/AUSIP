import { useState } from 'react';
import { FileDown, FileText, FileSpreadsheet, Calendar, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { mockKpiData } from '../data/mockData';

type ReportType = 'dashboard' | 'alerts' | 'combined';
type ExportFormat = 'csv' | 'pdf';

export default function ReportsPage() {
  const { analysisData } = useAnalysis();
  
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('dashboard');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Date range states
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const reportTypes = [
    {
      id: 'dashboard' as ReportType,
      name: 'Dashboard Analytics',
      description: 'KPIs, Industry Scores, and Market Insights',
      icon: FileText,
      color: 'blue',
    },
    {
      id: 'alerts' as ReportType,
      name: 'System Alerts',
      description: 'Active and historical alerts from monitoring',
      icon: AlertCircle,
      color: 'orange',
    },
    {
      id: 'combined' as ReportType,
      name: 'Combined Report',
      description: 'Full analytics and alerts in one report',
      icon: FileDown,
      color: 'purple',
    },
  ];

  const formatOptions = [
    {
      id: 'csv' as ExportFormat,
      name: 'CSV',
      description: 'Spreadsheet format for Excel/Sheets',
      icon: FileSpreadsheet,
    },
    {
      id: 'pdf' as ExportFormat,
      name: 'PDF',
      description: 'Professional document format',
      icon: FileText,
    },
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Not authenticated');

      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      
      const response = await fetch(`${API_URL}/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          report_type: selectedReportType,
          format: selectedFormat,
          start_date: startDate,
          end_date: endDate,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate report');
      }

      // Get filename from headers or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `unicorn_report_${selectedReportType}_${Date.now()}.${selectedFormat}`;
      
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccessMessage(`Report downloaded successfully as ${filename}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to generate report';
      setErrorMessage(errorMsg);
      console.error('Report generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Reports</h1>
        <p className="text-gray-300">Download analytical data and alerts in your preferred format</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Type Selection */}
          <div className="bg-[#27272A] rounded-2xl shadow-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Report Type</h2>
                <p className="text-sm text-gray-300">Choose what data to include</p>
              </div>
            </div>

            <div className="space-y-3">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedReportType === type.id;
                
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedReportType(type.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        type.color === 'blue' ? 'bg-blue-500/20' :
                        type.color === 'orange' ? 'bg-orange-500/20' :
                        'bg-purple-500/20'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          type.color === 'blue' ? 'text-blue-400' :
                          type.color === 'orange' ? 'text-orange-400' :
                          'text-purple-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{type.name}</h3>
                        <p className="text-sm text-gray-400">{type.description}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export Format Selection */}
          <div className="bg-[#27272A] rounded-2xl shadow-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Download className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Export Format</h2>
                <p className="text-sm text-gray-300">Select output file type</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {formatOptions.map((format) => {
                const Icon = format.icon;
                const isSelected = selectedFormat === format.id;
                
                return (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-purple-500/20' : 'bg-gray-700'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          isSelected ? 'text-purple-400' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">{format.name}</h3>
                        <p className="text-xs text-gray-400">{format.description}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="bg-[#27272A] rounded-2xl shadow-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Date Range</h2>
                <p className="text-sm text-gray-300">Filter data by date</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-300">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{errorMessage}</p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl px-6 py-4 font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Generate & Download Report
              </>
            )}
          </button>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="bg-[#27272A] rounded-2xl shadow-xl border border-gray-700 p-6 sticky top-4">
            <h2 className="text-lg font-bold text-white mb-4">Report Preview</h2>
            
            <div className="space-y-4">
              {/* Report Details */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-2">Report Type</p>
                <p className="text-white font-medium">
                  {reportTypes.find(t => t.id === selectedReportType)?.name}
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-2">Format</p>
                <p className="text-white font-medium uppercase">{selectedFormat}</p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-2">Date Range</p>
                <p className="text-white font-medium">
                  {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                </p>
              </div>

              {/* Data Summary */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-3">Included Data</p>
                <div className="space-y-2 text-sm text-gray-300">
                  {(selectedReportType === 'dashboard' || selectedReportType === 'combined') && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span>KPI Metrics ({mockKpiData.length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span>Industry Scores ({analysisData.industryScores.length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span>Chart Data (3 charts)</span>
                      </div>
                    </>
                  )}
                  {(selectedReportType === 'alerts' || selectedReportType === 'combined') && (
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                      <span>System Alerts</span>
                    </div>
                  )}
                </div>
              </div>

              {/* File Info */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-xs text-blue-400 mb-2">Estimated File Size</p>
                <p className="text-white font-medium">
                  {selectedFormat === 'csv' ? '< 1 MB' : '1-2 MB'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
