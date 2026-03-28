const moment = require('moment');

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} - Today's date
 */
exports.getTodayDate = () => new Date().toISOString().split('T')[0];

/**
 * Format time from 24-hour to 12-hour format
 * @param {string} timeString - Time in HH:mm format
 * @returns {string} - Time in 12-hour format (e.g., "1:30 PM")
 */
exports.formatTime = (timeString) => {
  if (!timeString) return '';
  const [hourStr, minuteStr] = timeString.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr || '00';
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${period}`;
};

/**
 * Get date options for the next N days
 * @param {number} days - Number of days to generate
 * @returns {Array} - Array of date strings
 */
exports.getDateOptions = (days = 7) => {
  const options = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    options.push(d.toISOString().split('T')[0]);
  }
  return options;
};

/**
 * Format date for display
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {string} - Formatted date string
 */
exports.formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Check if a slot time has passed for today's date
 * @param {string} startTime - Start time in HH:mm format
 * @param {string} selectedDate - Selected date in YYYY-MM-DD format
 * @returns {boolean} - True if slot time has passed
 */
exports.isSlotPast = (startTime, selectedDate) => {
  const today = exports.getTodayDate();
  if (selectedDate !== today) return false;

  const now = new Date();
  const [hour, minute] = startTime.split(':').map(Number);
  const slotTime = new Date();
  slotTime.setHours(hour, minute, 0, 0);

  return slotTime <= now;
};

/**
 * Get time slot duration in minutes
 * @param {string} startTime - Start time in HH:mm format
 * @param {string} endTime - End time in HH:mm format
 * @returns {number} - Duration in minutes
 */
exports.getSlotDuration = (startTime, endTime) => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  return endMinutes - startMinutes;
};

/**
 * Add minutes to a time string
 * @param {string} timeString - Time in HH:mm format
 * @param {number} minutes - Minutes to add
 * @returns {string} - New time in HH:mm format
 */
exports.addMinutesToTime = (timeString, minutes) => {
  const [hour, minute] = timeString.split(':').map(Number);
  const totalMinutes = hour * 60 + minute + minutes;
  
  const newHour = Math.floor(totalMinutes / 60) % 24;
  const newMinute = totalMinutes % 60;
  
  return `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;
};

/**
 * Check if two time slots overlap
 * @param {string} start1 - First slot start time
 * @param {string} end1 - First slot end time
 * @param {string} start2 - Second slot start time
 * @param {string} end2 - Second slot end time
 * @returns {boolean} - True if slots overlap
 */
exports.doTimeSlotsOverlap = (start1, end1, start2, end2) => {
  const [s1Hour, s1Minute] = start1.split(':').map(Number);
  const [e1Hour, e1Minute] = end1.split(':').map(Number);
  const [s2Hour, s2Minute] = start2.split(':').map(Number);
  const [e2Hour, e2Minute] = end2.split(':').map(Number);
  
  const s1Minutes = s1Hour * 60 + s1Minute;
  const e1Minutes = e1Hour * 60 + e1Minute;
  const s2Minutes = s2Hour * 60 + s2Minute;
  const e2Minutes = e2Hour * 60 + e2Minute;
  
  return (s1Minutes < e2Minutes && s2Minutes < e1Minutes);
};

/**
 * Get current time in HH:mm format
 * @returns {string} - Current time
 */
exports.getCurrentTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Check if a time is within business hours
 * @param {string} timeString - Time in HH:mm format
 * @param {string} businessStart - Business start time (default: "09:00")
 * @param {string} businessEnd - Business end time (default: "21:00")
 * @returns {boolean} - True if time is within business hours
 */
exports.isWithinBusinessHours = (timeString, businessStart = "09:00", businessEnd = "21:00") => {
  const [hour, minute] = timeString.split(':').map(Number);
  const [startHour] = businessStart.split(':').map(Number);
  const [endHour] = businessEnd.split(':').map(Number);
  
  const totalMinutes = hour * 60 + minute;
  const startMinutes = startHour * 60;
  const endMinutes = endHour * 60;
  
  return totalMinutes >= startMinutes && totalMinutes <= endMinutes;
};
