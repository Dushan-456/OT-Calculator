import React, { useState, useEffect } from 'react';
import { X, Trash2, Printer, AlertCircle } from 'lucide-react';
import { formatMinutesToHHMM, formatTo12Hour } from '../utils/otCalculator';

export default function PrintPreviewModal({ isOpen, onClose, results, onPrint }) {
  const [printList, setPrintList] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Filter only rows that have OT hours
      const initialList = results.filter(row => row.otMinutes > 0);
      setPrintList(initialList);
    }
  }, [isOpen, results]);

  if (!isOpen) return null;

  const handleDelete = (id) => {
    setPrintList(prev => prev.filter(row => row.id !== id));
  };

  const handlePrintAction = () => {
    onPrint(printList);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Printer className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Print Preview</h3>
              <p className="text-xs text-slate-500">Select which dates to include in your OT application</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {printList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">No dates selected for printing.</p>
              <p className="text-sm text-slate-400">Only dates with OT hours are shown here by default.</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm text-slate-600 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-center">Check-in</th>
                    <th className="px-6 py-4 text-center">Check-out</th>
                    <th className="px-6 py-4 text-center">OT Hours</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {printList.map((row) => (
                    <tr key={row.id} className="hover:bg-blue-50/30 group transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">
                        {row.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="font-mono text-slate-600">{formatTo12Hour(row.checkIn)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="font-mono text-slate-600">{formatTo12Hour(row.checkOut)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="font-bold text-emerald-600">{formatMinutesToHHMM(row.otMinutes)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button 
                          onClick={() => handleDelete(row.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Remove from print list"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Total Days: <span className="font-bold text-slate-700">{printList.length}</span>
          </p>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handlePrintAction}
              disabled={printList.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-lg shadow-md shadow-blue-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Printer className="w-4 h-4" />
              Print List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
