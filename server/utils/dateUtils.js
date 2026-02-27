/**
 * Safe Date Utility Functions for Backend
 * Prevents "Invalid time value" errors by handling edge cases
 */

/**
 * Check if a date value is valid
 * @param {any} date - The date value to check
 * @returns {boolean} True if valid, false otherwise
 */
const isValidDate = (date) => {
  if (!date) return false;
  try {
    const d = new Date(date);
    return !isNaN(d.getTime());
  } catch {
    return false;
  }
};

/**
 * Safely format a date to ISO string
 * @param {any} date - The date value to format
 * @param {string} fallback - Fallback value if invalid (default: null)
 * @returns {string|null} ISO date string or fallback
 */
const toISOString = (date, fallback = null) => {
  if (!date) return fallback;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return fallback;
    return d.toISOString();
  } catch {
    return fallback;
  }
};

/**
 * Safely format a date to locale date string
 * @param {any} date - The date value to format
 * @param {string} locale - Locale (default: 'en-IN')
 * @param {object} options - toLocaleDateString options
 * @param {string} fallback - Fallback value if invalid (default: 'N/A')
 * @returns {string} Formatted date string or fallback
 */
const formatDate = (date, locale = 'en-IN', options = {}, fallback = 'N/A') => {
  if (!date) return fallback;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString(locale, options);
  } catch {
    return fallback;
  }
};

/**
 * Safely format a date to locale time string
 * @param {any} date - The date value to format
 * @param {string} locale - Locale (default: 'en-IN')
 * @param {object} options - toLocaleTimeString options
 * @param {string} fallback - Fallback value if invalid (default: 'N/A')
 * @returns {string} Formatted time string or fallback
 */
const formatTime = (date, locale = 'en-IN', options = {}, fallback = 'N/A') => {
  if (!date) return fallback;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleTimeString(locale, options);
  } catch {
    return fallback;
  }
};

/**
 * Safely format a date to a specific format (YYYY-MM-DD)
 * @param {any} date - The date value to format
 * @param {string} fallback - Fallback value if invalid (default: '')
 * @returns {string} Formatted date string (YYYY-MM-DD) or fallback
 */
const formatDateString = (date, fallback = '') => {
  if (!date) return fallback;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return fallback;
    return d.toISOString().split('T')[0];
  } catch {
    return fallback;
  }
};

/**
 * Safely format a date with time
 * @param {any} date - The date value to format
 * @param {string} locale - Locale (default: 'en-IN')
 * @param {string} fallback - Fallback value if invalid (default: 'N/A')
 * @returns {string} Formatted datetime string or fallback
 */
const formatDateTime = (date, locale = 'en-IN', fallback = 'N/A') => {
  if (!date) return fallback;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return fallback;
    return `${d.toLocaleDateString(locale)} ${d.toLocaleTimeString(locale)}`;
  } catch {
    return fallback;
  }
};

/**
 * Create a safe Date object or return null
 * @param {any} date - The date value to convert
 * @returns {Date|null} Date object or null if invalid
 */
const safeDate = (date) => {
  if (!date) return null;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
};

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {any} date - The date value
 * @param {string} fallback - Fallback value if invalid (default: 'N/A')
 * @returns {string} Relative time string or fallback
 */
const getRelativeTime = (date, fallback = 'N/A') => {
  if (!date) return fallback;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return fallback;
    
    const now = new Date();
    const diff = now - d;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  } catch {
    return fallback;
  }
};

module.exports = {
  isValidDate,
  toISOString,
  formatDate,
  formatTime,
  formatDateString,
  formatDateTime,
  safeDate,
  getRelativeTime
};