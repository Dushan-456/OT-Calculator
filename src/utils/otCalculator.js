import Papa from 'papaparse';
import { isValid, format } from 'date-fns';

export function formatMinutesToHHMM(totalMinutes) {
  if (totalMinutes <= 0 || isNaN(totalMinutes)) return "00:00";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function formatTo12Hour(tStr) {
  if (!tStr || tStr === 'N/A') return tStr;
  
  // Convert to minutes first to get a normalized time
  const mins = timeToMins(tStr);
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  
  h = h % 12;
  if (h === 0) h = 12;
  
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
}

export function parseCSVData(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors = [...results.errors];
        const fields = results.meta.fields || [];
        
        // Check for required headers (case-insensitive)
        const hasDate = fields.some(f => f.toLowerCase() === 'date');
        const hasTime = fields.some(f => f.toLowerCase() === 'time');
        
        if (!hasDate || !hasTime) {
          let missing = [];
          if (!hasDate) missing.push("'Date'");
          if (!hasTime) missing.push("'Time'");
          
          errors.push({
            type: 'Validation',
            message: `Missing required header(s): ${missing.join(' and ')}. Found: ${fields.length > 0 ? fields.join(', ') : 'None'}`
          });
        }
        
        if (results.data.length === 0 && errors.length === 0) {
          errors.push({
            type: 'Validation',
            message: "The CSV file contains no data rows."
          });
        }

        resolve({
          data: results.data,
          errors: errors,
          fields: fields
        });
      },
      error: (error) => reject(error),
    });
  });
}

function timeToMins(tStr) {
  if (!tStr) return 0;
  
  // Clean string
  tStr = tStr.trim().toLowerCase();
  
  // Basic check for format
  let isPM = tStr.includes('pm') || tStr.includes('p.m.');
  let isAM = tStr.includes('am') || tStr.includes('a.m.');
  
  // Strip letters
  let timeStrMatch = tStr.match(/(\d{1,2}):(\d{2})/);
  if (!timeStrMatch) return 0;
  
  let h = parseInt(timeStrMatch[1], 10);
  let m = parseInt(timeStrMatch[2], 10);
  
  if (isPM && h !== 12) h += 12;
  if (isAM && h === 12) h = 0;
  
  return h * 60 + m;
}

export function processAttendance(data, config) {
  const { officeStartTime, officeEndTime, includeMorningOT } = config;
  const grouped = {};
  
  data.forEach(row => {
    const rawDate = row.Date || row.date;
    const rawTime = row.Time || row.time;

    if (!rawDate || !rawTime) return;
    
    let dateStr = rawDate.trim();
    const timeStr = rawTime.trim();
    
    let parsedDate = null;
    
    // Try DD/MM/YYYY first (Strictly split by common delimiters)
    const parts = dateStr.split(/[-/.]/);
    if (parts.length === 3) {
      // If the first part is > 12, it's definitely a Day-first format
      // If the first part is 4 digits, it's Year-first
      if (parts[0].length === 4) {
        parsedDate = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
      } else {
        // Assume DD/MM/YYYY
        parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    } else {
      parsedDate = new Date(dateStr);
    }

    if (!isValid(parsedDate)) return;

    dateStr = format(parsedDate, 'yyyy-MM-dd');

    if (!grouped[dateStr]) {
      grouped[dateStr] = {
        date: dateStr,
        originalDate: rawDate.trim(),
        parsedDate: parsedDate,
        punches: []
      };
    }
    grouped[dateStr].punches.push(timeStr);
  });

  const validDates = Object.values(grouped).map(d => d.parsedDate).filter(d => d !== null);
  
  let allDays = [];
  if (validDates.length > 0) {
    const minDate = new Date(Math.min(...validDates));
    const maxDate = new Date(Math.max(...validDates));
    
    // If the detected range is more than 31 days but the user thinks it's one month,
    // we should stick to the month of the MAJORITY of dates to avoid the "year view" bug.
    // However, the standard expectation is to fill the month of the dates found.
    
    // Safety check: If year difference is found, someone probably has a wrong date in CSV
    if (maxDate.getFullYear() !== minDate.getFullYear()) {
       // Just show actual dates found if it's too messy
       Object.keys(grouped).sort().forEach(key => {
         allDays.push(new Date(key));
       });
    } else {
      // Standard: Get first day of the minimum month, to the last day of the maximum month
      const intervalStart = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      const intervalEnd = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);

      // Limit safety: don't generate more than 62 days (2 months) to prevent UI crash
      for (let d = new Date(intervalStart); d <= intervalEnd && allDays.length < 62; d.setDate(d.getDate() + 1)) {
        allDays.push(new Date(d));
      }
    }
  }

  const results = [];
  
  // Handle continuous parsed days
  allDays.forEach(day => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const dayIndex = day.getDay();
    const isWeekend = dayIndex === 0 || dayIndex === 6;
    const dayOfWeek = format(day, 'EEEE');
    
    let dayData = grouped[dateKey];
    
    if (!dayData) {
      results.push({
        id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
        date: format(day, 'yyyy-MM-dd'),
        dayOfWeek,
        isWeekend,
        isHoliday: false,
        checkIn: 'N/A',
        checkOut: 'N/A',
        otMinutes: 0,
        status: 'Not Attended',
        parsedDate: new Date(day)
      });
      return;
    }

    dayData.isProcessed = true;
    
    dayData.punches.sort((a, b) => timeToMins(a) - timeToMins(b));

    const checkIn = dayData.punches.length >= 1 ? dayData.punches[0] : 'N/A';
    const checkOut = dayData.punches.length > 1 ? dayData.punches[dayData.punches.length - 1] : 'N/A';
    
    let status = 'OK';
    let otMinutes = 0;

    if (dayData.punches.length < 2) {
      status = dayData.punches.length === 1 ? 'Missing Punch' : 'Not Attended';
    } else {
      const inMins = timeToMins(checkIn);
      const outMins = timeToMins(checkOut);
      const officeStartMins = timeToMins(officeStartTime);
      const officeEndMins = timeToMins(officeEndTime);

      if (isWeekend) {
        otMinutes = Math.max(0, outMins - inMins);
      } else {
        // Late Arrival Logic
        const cutoffMins = timeToMins(config.lateCutoffTime);
        const lateMinutes = Math.max(0, inMins - officeStartMins);
        
        if (inMins > cutoffMins) {
          status = 'Late';
          otMinutes = 0;
        } else {
          let eveningOT = Math.max(0, outMins - officeEndMins);
          if (eveningOT < config.eveningOTThreshold) eveningOT = 0;
          
          let morningOT = 0;
          if (includeMorningOT) {
            morningOT = Math.max(0, officeStartMins - inMins);
            if (morningOT < config.morningOTThreshold) morningOT = 0;
          }
          
          otMinutes = eveningOT + morningOT;
          
          // Deduct late minutes if any
          if (lateMinutes > 0) {
            otMinutes = Math.max(0, otMinutes - lateMinutes);
          }
        }
      }

      // Apply rounding if configured
      if (config.roundTo15Min && status !== 'Late') {
        otMinutes = Math.floor(otMinutes / 15) * 15;
      }
    }

    results.push({
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      date: dayData.originalDate,
      dayOfWeek,
      isWeekend,
      isHoliday: false,
      checkIn,
      checkOut,
      otMinutes,
      status,
      parsedDate: new Date(day)
    });
  });

  // Handle unparsable dates
  Object.values(grouped).forEach(dayData => {
    if (!dayData.isProcessed) {
      dayData.punches.sort((a, b) => timeToMins(a) - timeToMins(b));
      const checkIn = dayData.punches[0] || 'N/A';
      const checkOut = dayData.punches.length > 1 ? dayData.punches[dayData.punches.length - 1] : 'N/A';
      let status = dayData.punches.length < 2 ? 'Missing Punch' : 'OK';
      results.push({
        id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
        date: dayData.originalDate,
        dayOfWeek: 'Unknown',
        isWeekend: false,
        isHoliday: false,
        checkIn,
        checkOut,
        otMinutes: 0,
        status,
        parsedDate: new Date(8640000000000000) // Put at end
      });
    }
  });

  return results.sort((a,b) => a.parsedDate - b.parsedDate);
}
