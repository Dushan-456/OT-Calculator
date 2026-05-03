// src/components/SummaryCard.jsx
import React from 'react';
import { Briefcase, Clock, CalendarDays } from 'lucide-react';
import { formatMinutesToHHMM } from '../utils/otCalculator';

export default function SummaryCard({ results }) {
  if (!results || results.length === 0) return null;

  const totalOTMinutes = results.reduce((acc, row) => acc + (row.otMinutes || 0), 0);
  const totalDays = results.length;
  const missingPunches = results.filter(r => r.status === 'Missing Punch').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
      
      {/* Total OT */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 transform hover:-translate-y-1 transition duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-blue-100">Total OT for Month</h3>
          <div className="p-2 bg-blue-500/30 rounded-lg">
            <Clock className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="text-4xl font-bold tracking-tight">
          {formatMinutesToHHMM(totalOTMinutes)}
        </div>
        <p className="text-sm text-blue-200 mt-2">Hours : Minutes</p>
      </div>

      {/* Days Recorded */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-lg shadow-slate-200/50 transform hover:-translate-y-1 transition duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-slate-500">Days Recorded</h3>
          <div className="p-2 bg-slate-100 rounded-lg">
            <CalendarDays className="w-5 h-5 text-slate-600" />
          </div>
        </div>
        <div className="text-3xl font-bold text-slate-800">
          {totalDays}
        </div>
      </div>

      {/* Exceptions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-lg shadow-slate-200/50 transform hover:-translate-y-1 transition duration-300">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-slate-500">Exceptions</h3>
          <div className="flex gap-2">
             <div className="p-2 bg-orange-100 rounded-lg">
               <Briefcase className="w-4 h-4 text-orange-600" />
             </div>
             <div className="p-2 bg-red-100 rounded-lg">
               <Clock className="w-4 h-4 text-red-600" />
             </div>
          </div>
        </div>
        <div className="flex gap-6 mt-2">
          <div>
            <div className="text-2xl font-bold text-slate-800">{missingPunches}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Missing</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{results.filter(r => r.status === 'Late').length}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Late</div>
          </div>
        </div>
        {(missingPunches > 0 || results.some(r => r.status === 'Late')) && (
          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
            These days do not contribute to the total OT calculation.
          </p>
        )}
      </div>

    </div>
  );
}
