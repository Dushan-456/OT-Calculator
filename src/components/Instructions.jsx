// src/components/Instructions.jsx
import React from 'react';
import { FileText, Clock, Calculator, Download, CheckCircle, Printer } from 'lucide-react';

export default function Instructions() {
  const steps = [
    {
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      title: "Upload Attendance",
      description: "Select your attendance CSV file exported from the tracking system."
    },
    {
      icon: <Clock className="w-5 h-5 text-teal-500" />,
      title: "Set Office Hours",
      description: "Adjust the start and end times to match your official working schedule."
    },
    {
      icon: <Calculator className="w-5 h-5 text-indigo-500" />,
      title: "Calculate",
      description: "Click 'Calculate OT' to process the data with the 1-hour minimum evening rule."
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      title: "Review & Adjust",
      description: "Manually toggle public holidays or weekends if they aren't auto-detected."
    },
    {
      icon: <Printer className="w-5 h-5 text-purple-500" />,
      title: "Print Preview",
      description: "Open print preview to select dates and generate your official OT application."
    }
  ];

  return (
    <div className="mt-8 animate-fadeIn">
      <div className="glass-card p-8 border-dashed border-2 border-slate-200/50">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-3">How it works</h2>
          <p className="text-slate-600">
            Follow these simple steps to accurately calculate your overtime hours and generate a summary report.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                {step.icon}
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50">
          <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Download className="w-4 h-4" /> CSV Format Requirements
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
              Must have 'Date' and 'Time' columns
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
              Time format: 08:30 or 08:30 AM/PM
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
              Date format: YYYY-MM-DD or DD/MM/YYYY
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
              Minimum 1 hour evening work for OT
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
              Generates Legal size OT application forms
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
