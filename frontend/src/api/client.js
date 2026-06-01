import axios from 'axios';

// Vite proxy forwards /api and /uploads to the Express backend in dev.
const client = axios.create({
  baseURL: '/api',
});

// Attach the JWT to every request if we have one.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors so components can read err.message and err.fieldErrors.
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data;
    const message = data?.message || err.message || 'Something went wrong';
    const normalized = new Error(message);
    normalized.fieldErrors = data?.errors || null;
    return Promise.reject(normalized);
  }
);

export default client;
