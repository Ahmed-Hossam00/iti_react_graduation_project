/**
 * Centralized API client for Central City Clinic
 * Handles base URL, auth headers, token management, and structured error extraction.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export class ApiError extends Error {
  constructor(message, status, code = 'API_ERROR', details = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function getStoredToken() {
  return localStorage.getItem('clinic_access_token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('clinic_access_token', token);
  } else {
    localStorage.removeItem('clinic_access_token');
  }
}

export function getStoredRefreshToken() {
  return localStorage.getItem('clinic_refresh_token');
}

export function setStoredRefreshToken(token) {
  if (token) {
    localStorage.setItem('clinic_refresh_token', token);
  } else {
    localStorage.removeItem('clinic_refresh_token');
  }
}

export function getStoredRememberMe() {
  const val = localStorage.getItem('clinic_remember_me');
  return val === 'true';
}

export function setStoredRememberMe(remember) {
  if (remember) {
    localStorage.setItem('clinic_remember_me', 'true');
  } else {
    localStorage.setItem('clinic_remember_me', 'false');
  }
}

export function clearTokens() {
  localStorage.removeItem('clinic_access_token');
  localStorage.removeItem('clinic_refresh_token');
  localStorage.removeItem('clinic_remember_me');
}

let refreshPromise = null;

export async function requestTokenRefresh() {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    throw new ApiError('No refresh token available.', 401, 'UNAUTHENTICATED');
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new ApiError('Failed to refresh authentication token.', response.status, 'REFRESH_FAILED');
      }

      const resJson = await response.json();
      const tokens = resJson?.data?.tokens || resJson?.data || resJson;

      if (!tokens?.accessToken) {
        throw new ApiError('Malformed token response from server.', 500, 'MALFORMED_TOKEN');
      }

      setStoredToken(tokens.accessToken);
      if (tokens.refreshToken) {
        setStoredRefreshToken(tokens.refreshToken);
      }

      return tokens.accessToken;
    } catch (err) {
      clearTokens();
      window.dispatchEvent(new CustomEvent('clinic:unauthorized'));
      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Base fetch client
 */
export async function apiClient(endpoint, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    params,
    requiresAuth = true,
    _isRetry = false,
    ...customConfig
  } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const defaultHeaders = {
    'Accept': 'application/json',
  };

  if (!(body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const token = getStoredToken();
  if (token && requiresAuth) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...customConfig,
  };

  if (body) {
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    let responseData = null;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = text;
      }
    }

    if (!response.ok) {
      const errorPayload = responseData?.error || {};
      const errorMessage =
        errorPayload.message ||
        responseData?.message ||
        `Request failed with status ${response.status}`;
      const errorCode = errorPayload.code || `HTTP_${response.status}`;
      const errorDetails = errorPayload.details || [];

      // If token expired / unauthorized
      if (
        response.status === 401 &&
        requiresAuth &&
        !_isRetry &&
        !endpoint.includes('/auth/login') &&
        !endpoint.includes('/auth/refresh')
      ) {
        const isRemembered = getStoredRememberMe();
        const storedRefreshToken = getStoredRefreshToken();

        if (isRemembered && storedRefreshToken) {
          try {
            const newAccessToken = await requestTokenRefresh();
            // Retry the original request with new token
            return await apiClient(endpoint, {
              ...options,
              _isRetry: true,
              headers: {
                ...headers,
                Authorization: `Bearer ${newAccessToken}`,
              },
            });
          } catch {
            throw new ApiError('Session has expired. Please sign in again.', 401, 'TOKEN_EXPIRED');
          }
        } else {
          // If remember me is NOT marked or no refresh token, log out
          clearTokens();
          window.dispatchEvent(new CustomEvent('clinic:unauthorized'));
        }
      }

      throw new ApiError(errorMessage, response.status, errorCode, errorDetails);
    }

    // Backend returns { data: ..., meta: ... } envelope
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      return {
        data: responseData.data,
        meta: responseData.meta || null,
      };
    }

    return { data: responseData, meta: null };
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err.message || 'Unable to connect to the server. Please check your internet connection.',
      0,
      'NETWORK_ERROR'
    );
  }
}

export default apiClient;
