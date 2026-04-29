// src/components/ControlBar.jsx
import React from 'react';
import { Upload, Settings, Play, RotateCcw } from 'lucide-react';

export default function ControlBar({
  config,
  setConfig,
  onFileUpload,
  onCalculate,
  onReset,
  file,
  hasResults
}) {
  
  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Lock everything except includeMorningOT if results are showing
    if (hasResults && name !== 'includeMorningOT') return; 
    
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="glass-card p-6 mt-8 mb-6 animate-fadeIn">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200/50 pb-3">
        <Settings className="w-5 h-5 text-slate-500" />
        <h2 className="text-lg font-semibold text-slate-700">Settings & Input</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
        {/* File Upload */}
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-600">Attendance CSV File</label>
            <div className="relative">
                <input 
                  type="file" 
                  accept=".csv" 
                  name="file"
                  id="csv-file"
                  className="hidden"
                  onChange={onFileUpload}
                  disabled={hasResults}
                />
                <label 
                  htmlFor="csv-file"
                  className={`input-field flex items-center justify-between cursor-pointer group ${hasResults ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-50'}`}
                >
                    <span className="truncate text-slate-500 group-hover:text-slate-700 focus:outline relative">
                        {file ? file.name : "Choose CSV..."}
                    </span>
                    <Upload className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform ml-2 shrink-0" />
                </label>
            </div>
        </div>

        {/* Start Time */}
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-600">Office Start Time</label>
            <input 
              type="time" 
              name="officeStartTime"
              value={config.officeStartTime}
              onChange={handleConfigChange}
              disabled={hasResults}
              className={`input-field ${hasResults ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
        </div>

        {/* End Time */}
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-600">Office End Time</label>
            <input 
              type="time" 
              name="officeEndTime"
              value={config.officeEndTime}
              onChange={handleConfigChange}
              disabled={hasResults}
              className={`input-field ${hasResults ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
        </div>

        {/* Action Button */}
        <div className="flex flex-col gap-2">
            <button 
                onClick={onCalculate}
                className="btn-primary w-full"
                disabled={!file || hasResults}
                title={!file ? "Please upload a CSV file first" : hasResults ? "Results already calculated" : ""}
            >
                {hasResults ? "Calculation Complete" : <><Play className="w-4 h-4" /> Calculate OT</>}
            </button>
            {hasResults && (
              <button 
                  onClick={onReset}
                  className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors py-2 group"
              >
                  <RotateCcw className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform" /> Start Again
              </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-slate-100 items-center">
        {/* Morning OT Toggle */}
        <label className="flex items-center gap-3 cursor-pointer group px-1">
            <input 
              type="checkbox" 
              name="includeMorningOT"
              checked={config.includeMorningOT}
              onChange={handleConfigChange}
              className="checkbox-custom"
            />
            <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
              Include Morning OT
            </span>
        </label>

        {/* Morning Threshold */}
        <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Morning Min (min)</label>
            <input 
              type="number" 
              name="morningOTThreshold"
              value={config.morningOTThreshold}
              onChange={handleConfigChange}
              min="0"
              disabled={hasResults}
              className={`input-field py-1.5 ${hasResults ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
        </div>

        {/* Evening Threshold */}
        <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Evening Min (min)</label>
            <input 
              type="number" 
              name="eveningOTThreshold"
              value={config.eveningOTThreshold}
              onChange={handleConfigChange}
              min="0"
              disabled={hasResults}
              className={`input-field py-1.5 ${hasResults ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
        </div>
      </div>
    </div>
  );
}
