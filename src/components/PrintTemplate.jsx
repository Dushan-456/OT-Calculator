import React from 'react';
import { formatMinutesToHHMM, formatTo12Hour } from '../utils/otCalculator';
import page1 from '../assets/images/page-1.jpg';
import page2 from '../assets/images/page-2.jpg';

export default function PrintTemplate({ data, formData }) {
  if (!data || data.length === 0) return null;

  const personalInfo = formData || {
    name: '',
    designation: '',
    placeOfWork: '',
    payUnit: '',
    salary: ''
  };

  const totalMinutes = data.reduce((acc, row) => acc + (row.otMinutes || 0), 0);

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: legal;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            color: #000 !important;
            background: white;
          }
          .print-page {
            width: 215.9mm;
            height: 355.6mm;
            position: relative;
            page-break-after: always;
            overflow: hidden;
            background-color: white !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .print-bg-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            object-fit: cover;
          }

          .print-table-container {
            position: absolute;
            top: 154mm;
            left: 20mm;
            right: 15mm;
            z-index: 10;
          }

          .print-table {
            border-collapse: collapse;
          }

          .print-table td {
            border: none;
            padding: 1.75px;
            text-align: left;
            font-family: Arial, sans-serif;
            color: #000 !important;
          }

          .print-table th {
            opacity: 0;
            height: 10mm;
          }
          
          .no-print {
            display: none !important;
          }

          .print-only {
            display: block !important;
          }
        }

        .print-only {
          display: none;
        }
      `}</style>

      <div className="print-only">
        {/* Page 1 */}
        <div className="print-page page-1">
          <img src={page1} alt="Background" className="print-bg-image" />

          {/* Personal Details using inline styles for maximum reliability in print */}
          <div
            style={{
              position: "absolute",
              top: "42mm",
              left: "80mm",
              zIndex: 100,
              color: "black",
              fontSize: "13pt",
              fontFamily: "Arial",
            }}
          >
            {personalInfo.name}
          </div>
          <div
            style={{
              position: "absolute",
              top: "42mm",
              left: "170mm",
              zIndex: 100,
              color: "black",
              fontSize: "12pt",
              fontFamily: "Arial",
            }}
          >
            {personalInfo.designation}
          </div>
          <div
            style={{
              position: "absolute",
              top: "54mm",
              left: "75mm",
              zIndex: 100,
              color: "black",
              fontSize: "11pt",
              fontFamily: "Arial",
            }}
          >
            {personalInfo.placeOfWork}
          </div>
          <div
            style={{
              position: "absolute",
              top: "54mm",
              left: "170mm",
              zIndex: 100,
              color: "black",
              fontSize: "11pt",
              fontFamily: "Arial",
            }}
          >
            {personalInfo.payUnit}
          </div>
          <div
            style={{
              position: "absolute",
              top: "66mm",
              left: "75mm",
              zIndex: 100,
              color: "black",
              fontSize: "11pt",
              fontFamily: "Arial",
            }}
          >
            Rs . {personalInfo.salary}
          </div>

          <div className="print-table-container">
            <table className="print-table">
              <thead>
                <tr>
                  <th style={{ width: "27mm" }}>Date</th>
                  <th style={{ width: "10mm" }}>From</th>
                  <th style={{ width: "10mm" }}>To</th>
                  <th style={{ width: "10mm" }}>Hours</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index}>
                    <td
                      style={{
                        paddingLeft: "9mm",
                        width: "27mm",
                        fontSize: "9pt",
                      }}
                    >
                      {row.date}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        width: "10mm",
                        fontSize: "8pt",
                      }}
                    >
                      {formatTo12Hour(row.checkIn).split(" ")[0]}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        width: "10mm",
                        fontSize: "8pt",
                      }}
                    >
                      {formatTo12Hour(row.checkOut).split(" ")[0]}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        width: "10mm",
                        fontSize: "8pt",
                      }}
                    >
                      {formatMinutesToHHMM(row.otMinutes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
      
            >
              <h3
                style={{
                  fontSize: "12pt",
                  fontWeight: "bold",
                  position: "absolute",
                  top: "162mm",
                  left: "50mm",
                }}
              >
                 {formatMinutesToHHMM(totalMinutes)}
              </h3>
            </div>
          </div>
        </div>

        {/* Page 2 */}
        <div className="print-page page-2">
          <img src={page2} alt="Background" className="print-bg-image" />
        </div>
      </div>
    </>
  );
}
