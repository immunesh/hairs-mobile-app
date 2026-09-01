// Single source for the backend URL.
//
// NEXT_PUBLIC_* values are inlined at build time, not read at runtime, so a
// deployment must have NEXT_PUBLIC_API_URL set *before* the build runs —
// changing it afterwards requires a rebuild.
//
// The value is trimmed because dashboard env editors (Vercel's included)
// happily store a pasted trailing newline, and it is inlined verbatim. That
// produced "https://host/api\n", so every request went to "/api\n/products"
// and 404'd — the storefront rendered "0 products" with no visible error,
// because the fetch failures were being swallowed. Trailing slashes go too,
// so "https://host/api/" cannot produce a double slash.
const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, '') || '';

export const API_URL = RAW_API_URL || 'http://localhost:4000/api';

// The same host without the trailing /api, for files the backend serves
// directly rather than through the API — currently /uploads/<image>.
export const API_ORIGIN = API_URL.replace(/\/api$/, '');
