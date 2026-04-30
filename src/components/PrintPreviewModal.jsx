import React, { useState, useEffect } from 'react';
import { X, Trash2, Printer, AlertCircle } from 'lucide-react';
import { formatMinutesToHHMM, formatTo12Hour } from '../utils/otCalculator';

export default function PrintPreviewModal({ isOpen, onClose, results, onPrint }) {
  const [printList, setPrintList] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    designation: 'Management Assistant',
    placeOfWork: '',
    payUnit: 'Shroff / PGIM',
    salary: ''
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
    onPrint(printList, formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Printer className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Print Preview
              </h3>
              <p className="text-xs text-slate-500">
                Select which dates to include in your OT application
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Print Instruction Alert */}
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-bold">Print Instruction:</p>
            <p>
              This template is designed for{" "}
              <strong>Legal paper (8.5" x 14")</strong>. Please ensure "Paper
              size" is set to <strong>Legal</strong> in your printer settings.
            </p>
          </div>
        </div>

        {/* Content - Two Column Layout */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Side: Personal Info Form */}
          <div className="w-full md:w-5/12 p-6 border-r border-slate-100 overflow-y-auto bg-slate-50/30">
            <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                1
              </span>
              Personal Details
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Name of Claimant
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-700"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-700"
                  placeholder="e.g. Management Assistant"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Place of Work
                </label>
                <input
                  type="text"
                  name="placeOfWork"
                  value={formData.placeOfWork}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-700"
                  placeholder="Office/Department"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Pay Unit
                  </label>
                  <input
                    type="text"
                    name="payUnit"
                    value={formData.payUnit}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Monthly Salary
                  </label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-700"
                    placeholder="49 475.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Print List */}
          <div className="w-full md:w-7/12 p-6 overflow-y-auto">
            <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">
                2
              </span>
              Print List
            </h4>

            {printList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">
                  No dates selected for printing.
                </p>
                <p className="text-sm text-slate-400">
                  Only dates with OT hours are shown here by default.
                </p>
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
                      <tr
                        key={row.id}
                        className="hover:bg-blue-50/30 group transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">
                          {row.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="font-mono text-slate-600">
                            {formatTo12Hour(row.checkIn)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="font-mono text-slate-600">
                            {formatTo12Hour(row.checkOut)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="font-bold text-emerald-600">
                            {formatMinutesToHHMM(row.otMinutes)}
                          </span>
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
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Total Days:{" "}
            <span className="font-bold text-slate-700">{printList.length}</span>
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
