// src/components/ResultsTable.jsx
import React from 'react';
import { formatMinutesToHHMM, formatTo12Hour } from '../utils/otCalculator';

export default function ResultsTable({ results, toggleHoliday }) {
  if (!results || results.length === 0) {
    return (
      <div className="glass-card p-12 text-center animate-fadeIn" style={{ animationDelay: '0.2s' }}>
        <div className="text-slate-400 mb-2">No data to display</div>
        <div className="text-sm text-slate-500">Upload a CSV file and click 'Calculate OT' to see results.</div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden animate-fadeIn" style={{ animationDelay: '0.2s' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 uppercase text-xs font-semibold text-slate-500 tracking-wider">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Day</th>
              <th className="px-6 py-4 text-center">Check-in</th>
              <th className="px-6 py-4 text-center">Check-out</th>
              <th className="px-6 py-4 text-center">OT Hours</th>
              <th className="px-6 py-4 text-center">Holiday?</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results.map((row) => {
              const rowClass = row.isWeekend 
                ? "bg-blue-50/50 hover:bg-blue-50 transition-colors" 
                : row.status === 'Missing Punch'
                  ? "bg-orange-50/30 hover:bg-orange-50/50 transition-colors"
                  : row.status === 'Not Attended'
                    ? "bg-slate-50/80 hover:bg-slate-100/80 transition-colors"
                    : "bg-white hover:bg-slate-50/50 transition-colors";

              return (
                <tr key={row.id} className={rowClass}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">
                    {row.date}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap font-medium ${row.isWeekend ? 'text-blue-600' : 'text-slate-500'}`}>
                    {row.dayOfWeek}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60 font-mono text-slate-700">
                      {formatTo12Hour(row.checkIn)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60 font-mono text-slate-700">
                      {formatTo12Hour(row.checkOut)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {row.status === 'Missing Punch' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Missing Punch
                      </span>
                    ) : row.status === 'Not Attended' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-200 text-red-800">
                        Not Attended
                      </span>
                    ) : (
                      <span className={`font-bold ${row.otMinutes > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {formatMinutesToHHMM(row.otMinutes)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <label className="relative inline-flex items-center cursor-pointer justify-center">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={row.isHoliday}
                        onChange={() => toggleHoliday(row.id)}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
