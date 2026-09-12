/**
 * JharInnovate Centralized API Client
 * Wraps Fetch with automatic JWT Bearer authorization and error normalization.
 */

// Base API URL from environment variable or relative fallback
const rawBaseUrl = (import.meta.env.VITE_API_URL || '').trim();
// Strip trailing slash if present
const API_BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('jansetu_jwt_token') || localStorage.getItem('jhar_jwt_token');

  // Ensure relative endpoints start with /
  let targetPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Safety fallback: Ensure /api prefix if endpoint doesn't already start with /api
  if (!targetPath.startsWith('http') && !targetPath.startsWith('/api/') && targetPath !== '/api') {
    targetPath = `/api${targetPath}`;
  }

  // Construct full target URL
  let url = targetPath.startsWith('http') 
    ? targetPath 
    : `${API_BASE_URL}${targetPath}`;

  // Process query params object if passed in options
  if (options.params && typeof options.params === 'object' && Object.keys(options.params).length > 0) {
    const queryString = new URLSearchParams(options.params).toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const { params, ...fetchOptions } = options;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...fetchOptions.headers
  };

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (err) {
    console.warn(`[API Client] ${fetchOptions.method || 'GET'} ${url} error:`, err.message);
    throw err;
  }
}

export default {
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

