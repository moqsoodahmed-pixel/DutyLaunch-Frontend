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
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token) => {
    try {
      if (token) window.localStorage.setItem(TOKEN_KEY, token);
      else window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable — the httpOnly cookie still carries the session */
    }
  },
};

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
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

/** Multipart helper — axios sets the boundary itself. */
export function postForm(url, formData, onProgress) {
  return api.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (evt) => onProgress(evt.total ? Math.round((evt.loaded / evt.total) * 100) : 0)
      : undefined,
  });
}
