/**
 * Application-wide constants
 */

// Pagination
export const MEDICINES_PER_PAGE = 10;
export const DEFAULT_PAGE = 1;

// Forecast
export const DEFAULT_FORECAST_PERIODS = 4;
export const MIN_FORECAST_PERIODS = 1;
export const MAX_FORECAST_PERIODS = 52;

// Roles
export const ROLES = {
  ADMIN: 'admin',
  ANALYST: 'analyst',
  DATA_OPERATOR: 'data_operator',
};

// Role display names
export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.ANALYST]: 'Analyst',
  [ROLES.DATA_OPERATOR]: 'Data Operator',
};

// API Response messages
export const MESSAGES = {
  LOGIN_EXPIRED: 'Your session has expired. Please login again.',
  NETWORK_ERROR: 'Unable to connect to server. Please make sure the backend is running.',
  GENERIC_ERROR: 'An error occurred. Please try again.',
};

// Feature flags
export const FEATURES = {
  USE_DUMMY_DATA: import.meta.env.VITE_USE_DUMMY_DATA === 'true',
  ENABLE_FORECAST: true,
};
