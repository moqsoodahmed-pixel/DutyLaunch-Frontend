import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

const TOKEN_KEY = 'dl.token';

export const tokenStore = {
  get: () => {
    try {
      return window.sessionStorage.getItem(TOKEN_KEY) || window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token) => {
    try {
      if (token) {
        window.sessionStorage.setItem(TOKEN_KEY, token);
        // Clear from localStorage to remove persistent XSS exfiltration target (BUG-13)
        window.localStorage.removeItem(TOKEN_KEY);
      } else {
        window.sessionStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      /* storage unavailable — the httpOnly cookie still carries the session */
    }
  },
};
// Migrate and clean legacy localStorage token on module load
try {
  const legacyToken = window.localStorage.getItem(TOKEN_KEY);
  if (legacyToken) {
    window.sessionStorage.setItem(TOKEN_KEY, legacyToken);
    window.localStorage.removeItem(TOKEN_KEY);
  }
} catch {
  /* ignore */
}

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // For multipart/form-data, delete Content-Type so the browser automatically sets the multipart boundary
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (config.headers?.delete) {
      config.headers.delete('Content-Type');
      config.headers.delete('content-type');
    } else if (config.headers) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
  }
  return config;
});

let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(normalise({ message: 'That took too long. Check your connection and try again.' }));
    }
    if (!error.response) {
      return Promise.reject(normalise({ message: 'Cannot reach the server. Check your connection and try again.' }));
    }

    const { status, data } = error.response;
    if (status === 401 && onUnauthorized) onUnauthorized();

    return Promise.reject(normalise({ ...data, status }));
  }
);

function normalise({ message, errors = [], status = 0 }) {
  const err = new Error(message || 'Something went wrong');
  err.fieldErrors = errors;
  err.status = status;
  return err;
}

/** Multipart helper — allows browser to automatically generate multipart boundary */
export function postForm(url, formData, onProgress) {
  return api.post(url, formData, {
    onUploadProgress: onProgress
      ? (evt) => onProgress(evt.total ? Math.round((evt.loaded / evt.total) * 100) : 0)
      : undefined,
  });
}
