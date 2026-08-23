import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

// Surface a consistent, human-readable message regardless of where the
// error originated (network failure vs. a structured API error body).
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error?.response?.data?.message ||
      (error?.code === 'ERR_NETWORK'
        ? 'Cannot reach the server. Check your connection and try again.'
        : 'Something went wrong. Please try again.');
    return Promise.reject(new Error(message));
  }
);
