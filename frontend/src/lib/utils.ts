/**
 * Utility Functions for Event Scheduler
 * 
 * This module contains common helper functions used throughout the application
 * for formatting, validation, and data manipulation.
 */

/**
 * Formats a date string into a human-readable format
 * @param dateString - ISO date string or Date object
 * @param format - Format type: 'short', 'long', 'time'
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string | Date,
  format: 'short' | 'long' | 'time' = 'short'
): string => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  const options: Intl.DateTimeFormatOptions = {
    short: { 
      month: 'short' as const, 
      day: 'numeric' as const,
      year: 'numeric' as const
    },
    long: { 
      weekday: 'long' as const,
      year: 'numeric' as const,
      month: 'long' as const,
      day: 'numeric' as const
    },
    time: { 
      hour: '2-digit' as const,
      minute: '2-digit' as const,
      hour12: true
    }
  }[format];
  
  return date.toLocaleDateString('en-US', options);
};

/**
 * Formats a date and time together
 * @param dateString - ISO date string
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string | Date): string => {
  return `${formatDate(dateString, 'long')} at ${formatDate(dateString, 'time')}`;
};

/**
 * Checks if an event is in the future
 * @param eventDate - Event date string or Date object
 * @returns True if event is in the future
 */
export const isUpcomingEvent = (eventDate: string | Date): boolean => {
  const date = new Date(eventDate);
  return date.getTime() > Date.now();
};

/**
 * Calculates available spots for an event
 * @param maxAttendees - Maximum number of attendees
 * @param currentAttendees - Current number of attendees
 * @returns Number of available spots, or null if unlimited
 */
export const getAvailableSpots = (
  maxAttendees: number | null,
  currentAttendees: number
): number | null => {
  if (maxAttendees === null) return null;
  return Math.max(0, maxAttendees - currentAttendees);
};

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns True if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Truncates text to a specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

/**
 * Combines CSS class names, filtering out falsy values
 * @param classes - Array of class names or conditional classes
 * @returns Combined class string
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Debounce function to limit the rate of function calls
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Generates a random ID for temporary use
 * @returns Random string ID
 */
export const generateTempId = (): string => {
  return Math.random().toString(36).substr(2, 9);
}; 