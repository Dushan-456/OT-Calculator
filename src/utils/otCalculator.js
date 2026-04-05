import Papa from 'papaparse';
import { isValid, format } from 'date-fns';

export function formatMinutesToHHMM(totalMinutes) {
  if (totalMinutes <= 0 || isNaN(totalMinutes)) return "00:00";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function parseCSVData(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
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
    
    let parsedDate = new Date(dateStr);
    if (!isValid(parsedDate)) {
      const parts = dateStr.split(/[-/]/);
      if (parts.length === 3) parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    
    if (isValid(parsedDate)) {
      dateStr = format(parsedDate, 'yyyy-MM-dd');
    }

    if (!grouped[dateStr]) {
      grouped[dateStr] = {
        date: dateStr,
        originalDate: rawDate.trim(),
        parsedDate: isValid(parsedDate) ? parsedDate : null,
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
    
    // Get first day of the minimum month, to the last day of the maximum month
    const intervalStart = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const intervalEnd = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);

    // Build array of days
    for (let d = new Date(intervalStart); d <= intervalEnd; d.setDate(d.getDate() + 1)) {
      allDays.push(new Date(d));
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
        id: crypto.randomUUID(),
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
        const eveningOT = Math.max(0, outMins - officeEndMins);
        let morningOT = 0;
        if (includeMorningOT) {
          morningOT = Math.max(0, officeStartMins - inMins);
        }
        otMinutes = eveningOT + morningOT;
      }
    }

    results.push({
      id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
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
