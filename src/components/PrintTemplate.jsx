import React from 'react';
import { formatMinutesToHHMM, formatTo12Hour } from '../utils/otCalculator';
import page1 from '../assets/images/page-1.png';
import page2 from '../assets/images/page-2.png';

export default function PrintTemplate({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="print-only">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .print-page {
            width: 210mm;
            height: 297mm;
            position: relative;
            page-break-after: always;
            overflow: hidden;
            background-size: cover;
            background-position: center;
            background-color: transparent !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .print-bg-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            object-fit: cover;
          }

          .print-table-container {
            position: absolute;
            top: 60mm; /* Adjust based on your office application template */
            left: 20mm;
            right: 20mm;
            background-color: transparent !important;
          }

          .print-table {
            width: 100%;
            border-collapse: collapse;
          }

          .print-table th, .print-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: center;
            font-family: Arial, sans-serif;
            font-size: 12pt;
            background-color: transparent !important;
          }

          .print-table th {
            /* background-color: #f2f2f2; */
            font-weight: bold;
          }
          
          .no-print {
            display: none !important;
          }

          .print-only {
            display: block !important;
          }
        }

        /* Styles for screen visibility if needed for debugging */
        .print-only {
          display: none;
        }
      `}</style>

      {/* Page 1 */}
      <div className="print-page page-1">
        <img src={page1} alt="Background Page 1" className="print-bg-image" />
        <div className="print-table-container">
          <table className="print-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Date</th>
                <th style={{ width: '20%' }}>Check-in</th>
                <th style={{ width: '20%' }}>Check-out</th>
                <th style={{ width: '20%' }}>OT Hours</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td>{row.date}</td>
                  <td>{formatTo12Hour(row.checkIn)}</td>
                  <td>{formatTo12Hour(row.checkOut)}</td>
                  <td>{formatMinutesToHHMM(row.otMinutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Page 2 */}
      <div className="print-page page-2">
        <img src={page2} alt="Background Page 2" className="print-bg-image" />
        {/* Content for second page will go here */}
      </div>
    </div>
  );
}
