const _ = require('lodash');
const moment = require('moment');
const { logger } = require('../config/logger');

/**
 * Check if a value is valid (not empty/null/undefined)
 * @param {*} value - Value to check
 * @returns {boolean} - True if value is valid
 */
exports.isValidValue = (value) => {
  if (value) {
    if ((_.isArray(value) || _.isObject(value)) && _.size(value) <= 0) {
      // set value as invalid if it is empty array or object
      return false;
    }
    return true;
  }
  return false;
};

/**
 * Get the last path segment from a URL
 * @param {string} url - Full URL
 * @returns {string} - Last path segment
 */
exports.getLastPathFromURL = url => url.substring(url.lastIndexOf('/') + 1);

/**
 * Generate a random filename
 * @param {string} fileExtension - File extension (e.g., '.png')
 * @returns {string} - Generated filename
 */
exports.createFileName = (fileExtension) => {
  const randomString = Math.random().toString(36).replace('0.', '').substr(0, 10);
  const extension = fileExtension || '.png';
  const filename = randomString + Date.now() + extension;
  return filename;
};

/**
 * Format date using moment
 * @param {Date|string} dateTime - Date to format
 * @param {string} format - Moment format string
 * @returns {string} - Formatted date string
 */
exports.getFormattedDate = (dateTime, format) => moment(dateTime).format(format);

/**
 * Format date to simple string (YYYY-MM-DD)
 * @param {string} dateString - Date string
 * @returns {string|null} - Formatted date or null
 */
exports.formatDateToSimpleString = (dateString) => {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};

/**
 * Split array into chunks
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} - Array of chunks
 */
exports.getChunk = (array, size) => {
  if (!array.length) {
    return [];
  }
  return _.chunk(array, size);
};

/**
 * Find maximum value in array by key
 * @param {Array} array - Array of objects
 * @param {string} key - Key to compare
 * @returns {number} - Maximum value
 */
exports.findMaxValueFromArray = (array, key) => Math.max(...array.map(obj => obj[key]));

/**
 * Join array values into a string
 * @param {Array} fields - Array of values
 * @returns {string} - Joined string
 */
exports.getOriginalName = fields => _.filter(fields).join(', ');

/**
 * Convert bytes to MB
 * @param {number} bytes - Bytes to convert
 * @returns {string} - Size in MB
 */
exports.sizeInMB = bytes => (bytes / (1024 * 1024)).toFixed(2);

/**
 * Split text into chunks of specified size
 * @param {string} inputString - Text to split
 * @param {number} chunkSize - Size of each chunk (default: 250)
 * @returns {Array} - Array of text chunks
 */
exports.splitTextIntoChunks = (inputString, chunkSize = 250) => {
  const words = inputString.split(' ');
  const numChunks = Math.ceil(words.length / chunkSize);
  const chunks = [];

  for (let i = 0; i < numChunks; i++) {
    const start = i * chunkSize;
    const end = start + chunkSize;
    const chunk = words.slice(start, end).join(' ');
    chunks.push(chunk);
  }

  return chunks;
};

/**
 * Format a string template by replacing each '%s' with provided args in order
 * @param {string} template - String containing '%s' placeholders
 * @param  {...any} args - Values to replace into the template
 * @returns {string} - Formatted string
 */
exports.formatMessage = (template, ...args) => {
  if (!template) return '';
  let formatted = template;
  args.forEach((arg) => {
    formatted = formatted.replace('%s', arg);
  });
  return formatted;
};

/**
 * Escape special characters in string for regex
 * @param {string} string - String to escape
 * @returns {string} - Escaped string
 */
exports.escapeRegExp = string => string.replace(/[.*+-=~:;',`"/!@#%&_?^${}() |[\]\\]/g, '\\$&');

/**
 * Check if a time string is in the past for today
 * @param {string} timeString - Time in HH:mm format
 * @returns {boolean} - True if time is in the past
 */
exports.isTimeInPast = (timeString) => {
  const today = new Date().toISOString().split('T')[0];
  return exports.isTimeInPastForDate(timeString, today);
};

/**
 * Check if a time string is in the past for a specific date
 * @param {string} timeString - Time in HH:mm format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {boolean} - True if time is in the past
 */
exports.isTimeInPastForDate = (timeString, dateString) => {
  const today = new Date().toISOString().split('T')[0];
  if (dateString !== today) return false;

  const now = new Date();
  const [hour, minute] = timeString.split(':').map(Number);
  const slotTime = new Date();
  slotTime.setHours(hour, minute, 0, 0);

  return slotTime <= now;
};

/**
 * Generate a random string
 * @param {number} length - Length of string (default: 10)
 * @returns {string} - Random string
 */
exports.generateRandomString = (length = 10) => {
  return Math.random().toString(36).replace('0.', '').substr(0, length);
};

/**
 * Check if a date is today
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {boolean} - True if date is today
 */
exports.isToday = (dateString) => {
  const today = new Date().toISOString().split('T')[0];
  return dateString === today;
};

/**
 * Check if a date is in the future
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {boolean} - True if date is in the future
 */
exports.isFutureDate = (dateString) => {
  const today = new Date().toISOString().split('T')[0];
  return dateString > today;
};

/**
 * Check if a date is in the past
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {boolean} - True if date is in the past
 */
exports.isPastDate = (dateString) => {
  const today = new Date().toISOString().split('T')[0];
  return dateString < today;
};

/**
 * Add days to a date
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {number} days - Number of days to add
 * @returns {string} - New date in YYYY-MM-DD format
 */
exports.addDaysToDate = (dateString, days) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

/**
 * Get the difference in days between two dates
 * @param {string} date1 - First date in YYYY-MM-DD format
 * @param {string} date2 - Second date in YYYY-MM-DD format
 * @returns {number} - Difference in days
 */
exports.getDaysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const timeDiff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (basic)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if phone is valid
 */
exports.isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Sanitize string by removing special characters
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
exports.sanitizeString = (text) => {
  return text.replace(/[^a-zA-Z0-9\s]/g, '').trim();
};

/**
 * Convert string to title case
 * @param {string} text - Text to convert
 * @returns {string} - Title case text
 */
exports.toTitleCase = (text) => {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Generate a slug from a string
 * @param {string} text - Text to convert to slug
 * @returns {string} - Slug string
 */
exports.generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Check if a string is empty or contains only whitespace
 * @param {string} text - Text to check
 * @returns {boolean} - True if string is empty or whitespace
 */
exports.isEmptyOrWhitespace = (text) => {
  return !text || text.trim().length === 0;
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} - Truncated text
 */
exports.truncateText = (text, length, suffix = '...') => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length - suffix.length) + suffix;
};

/**
 * Deep clone an object
 * @param {*} obj - Object to clone
 * @returns {*} - Cloned object
 */
exports.deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Remove duplicates from array of objects by key
 * @param {Array} array - Array of objects
 * @param {string} key - Key to check for duplicates
 * @returns {Array} - Array without duplicates
 */
exports.removeDuplicatesByKey = (array, key) => {
  return _.uniqBy(array, key);
};

/**
 * Sort array of objects by key
 * @param {Array} array - Array of objects
 * @param {string} key - Key to sort by
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} - Sorted array
 */
exports.sortByKey = (array, key, order = 'asc') => {
  return _.orderBy(array, [key], [order]);
};
