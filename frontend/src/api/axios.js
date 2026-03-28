import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/v1',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('playvix_token');
  if (token) {
    config.headers.authorization = token;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login on 401 if it's not a login attempt
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      localStorage.removeItem('playvix_token');
      localStorage.removeItem('playvix_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
