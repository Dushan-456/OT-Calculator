import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import ControlBar from './components/ControlBar'
import SummaryCard from './components/SummaryCard'
import ResultsTable from './components/ResultsTable'
import Instructions from './components/Instructions'
import PrintPreviewModal from './components/PrintPreviewModal'
import PrintTemplate from './components/PrintTemplate'
import { parseCSVData, processAttendance } from './utils/otCalculator'
import { Printer } from 'lucide-react'

function App() {
  const [config, setConfig] = useState({
    officeStartTime: '08:30',
    officeEndTime: '16:15',
    includeMorningOT: false,
    roundTo15Min: false,
    morningOTThreshold: 30,
    eveningOTThreshold: 60
  });
  
  const [file, setFile] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [results, setResults] = useState([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printData, setPrintData] = useState([]);
  const [printFormData, setPrintFormData] = useState(null);
  
  // Automatically recalculate when config changes
  useEffect(() => {
    if (rawData.length > 0) {
      recalculateFromRaw();
    }
  }, [config]);

  // Handle file selection
  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Perform calculation
  const handleCalculate = async () => {
    if (!file) return;
    
    try {
      // Re-parse only if it's the initial run or file changed, but for simplicity we parse on each click so overrides don't get lost
      const data = await parseCSVData(file);
      setRawData(data);
      
      const processed = processAttendance(data, config);
      setResults(processed);
    } catch (error) {
      console.error("Error processing CSV:", error);
      alert(`Error: ${error.message || "Unknown error during CSV processing. Please check if the file format is correct."}`);
    }
  };

  const handleReset = () => {
    setResults([]);
    setRawData([]);
  };

  // Recalculate without reparsing
  const recalculateFromRaw = () => {
    if (rawData.length === 0) return;
    const processed = processAttendance(rawData, config);
    // Preserve existing holidays since processAttendance recreates it, wait, we need to pass the holiday overrides to processAttendance or apply them after.
    // Better to apply holidays to the `results` directly:
    const updatedResults = processAttendance(rawData, config).map(newRow => {
      // Find old row to keep holiday state
      const oldRow = results.find(r => r.date === newRow.date);
      if (oldRow && oldRow.isHoliday) {
         newRow.isHoliday = true;
         // Recalculate OT for holiday
         const inMins = timeToMins(newRow.checkIn);
         const outMins = timeToMins(newRow.checkOut);
         newRow.otMinutes = Math.max(0, outMins - inMins);
      }
      return newRow;
    });
    setResults(updatedResults);
  };
  
  // timeToMins helper copy for inline recalculation
  const timeToMins = (tStr) => {
    if (!tStr || tStr === 'N/A') return 0;
    const str = tStr.trim().toLowerCase();
    const match = str.match(/(\d{1,2}):(\d{2})/);
    if (!match) return 0;
    let h = parseInt(match[1], 10);
    let m = parseInt(match[2], 10);
    if ((str.includes('pm') || str.includes('p.m.')) && h !== 12) h += 12;
    if ((str.includes('am') || str.includes('a.m.')) && h === 12) h = 0;
    return h * 60 + m;
  };

  const handleToggleHoliday = (id) => {
    setResults(prevResults => {
      return prevResults.map(row => {
        if (row.id === id) {
          const isHoliday = !row.isHoliday;
          
          let otMinutes = 0;
          const inMins = timeToMins(row.checkIn);
          const outMins = timeToMins(row.checkOut);
          
          if (row.status !== 'Missing Punch' && row.status !== 'Not Attended') {
            if (row.isWeekend || isHoliday) {
              otMinutes = Math.max(0, outMins - inMins);
            } else {
              const officeStartMins = timeToMins(config.officeStartTime);
              const officeEndMins = timeToMins(config.officeEndTime);
              
              let eveningOT = Math.max(0, outMins - officeEndMins);
              if (eveningOT < config.eveningOTThreshold) eveningOT = 0;
              let morningOT = 0;
              if (config.includeMorningOT) {
                morningOT = Math.max(0, officeStartMins - inMins);
                if (morningOT < config.morningOTThreshold) morningOT = 0;
              }
              otMinutes = eveningOT + morningOT;
            }

            if (config.roundTo15Min) {
              otMinutes = Math.floor(otMinutes / 15) * 15;
            }
          }

          return { ...row, isHoliday, otMinutes };
        }
        return row;
      });
    });
  };

  const handlePrint = (dataToPrint, formData) => {
    setPrintData(dataToPrint);
    setPrintFormData(formData);
    // Increase timeout to ensure images have loaded and React has rendered into the DOM before printing
    setTimeout(() => {
      window.print();
    }, 1500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 print:bg-transparent">
      {/* Main UI - Hidden during print */}
      <div className="no-print">
        {/* Ambient background styling */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <ControlBar 
            config={config}
            setConfig={setConfig}
            onFileUpload={handleFileUpload}
            onCalculate={handleCalculate}
            onReset={handleReset}
            file={file}
            hasResults={results.length > 0}
          />
          
          {results.length > 0 ? (
            <div className="mt-8 space-y-6">
              <div className="flex justify-between items-center bg-white/50 p-4 rounded-2xl border border-white/50 backdrop-blur-sm">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                     <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                   </div>
                   <div>
                     <h3 className="text-sm font-bold text-slate-700">Calculation Ready</h3>
                     <p className="text-xs text-slate-500">Review your results below or prepare for printing</p>
                   </div>
                 </div>
                 <button 
                  onClick={() => setShowPrintModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-200 transition-all hover:-translate-y-0.5 active:translate-y-0 group"
                 >
                   <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" />
                   Print Preview
                 </button>
              </div>
              <SummaryCard results={results} />
              <ResultsTable results={results} toggleHoliday={handleToggleHoliday} />
            </div>
          ) : (
            <Instructions />
          )}
        </main>

        <PrintPreviewModal 
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          results={results}
          onPrint={handlePrint}
        />
      </div>

      {/* Print Template - Only visible during print */}
      <PrintTemplate data={printData} formData={printFormData} />
    </div>
  )
}

export default App
