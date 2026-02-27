/**
 * Safe date formatting utilities
 * These functions handle invalid date values gracefully without throwing errors
 */

/**
 * Format a date value safely
 * @param {string|Date|number} date - The date value to format
 * @param {string} locale - The locale to use (default: 'en-US')
 * @param {object} options - Additional toLocaleDateString options
 * @returns {string} Formatted date string or 'N/A' if invalid
 */
export const formatDate = (date, locale = 'en-US', options = {}) => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString(locale, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

/**
 * Format a time value safely
 * @param {string|Date|number} date - The date/time value to format
 * @param {string} locale - The locale to use (default: 'en-US')
 * @param {object} options - Additional toLocaleTimeString options
 * @returns {string} Formatted time string or 'N/A' if invalid
 */
export const formatTime = (date, locale = 'en-US', options = {}) => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleTimeString(locale, options);
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'N/A';
  }
};

/**
 * Format a date and time value safely
 * @param {string|Date|number} date - The date/time value to format
 * @param {string} locale - The locale to use (default: 'en-US')
 * @param {object} dateOptions - Additional toLocaleDateString options
 * @param {object} timeOptions - Additional toLocaleTimeString options
 * @returns {string} Formatted date and time string or 'N/A' if invalid
 */
export const formatDateTime = (date, locale = 'en-US', dateOptions = {}, timeOptions = {}) => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return `${d.toLocaleDateString(locale, dateOptions)} at ${d.toLocaleTimeString(locale, timeOptions)}`;
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'N/A';
  }
};

/**
 * Check if a date value is valid
 * @param {string|Date|number} date - The date value to check
 * @returns {boolean} True if the date is valid, false otherwise
 */
export const isValidDate = (date) => {
  if (!date) return false;
  try {
    const d = new Date(date);
    return !isNaN(d.getTime());
  } catch {
    return false;
  }
};

export default {
  formatDate,
  formatTime,
  formatDateTime,
  isValidDate
};