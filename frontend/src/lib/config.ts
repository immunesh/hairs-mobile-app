const RAW_API_URL =
  process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '') || '';

export const API_URL = RAW_API_URL || 'http://localhost:4000/api';

// The same host without the trailing /api, for files the backend serves
// directly rather than through the API – currently /uploads/<image>.
export const API_ORIGIN = API_URL.replace(/\/api$/, '');
