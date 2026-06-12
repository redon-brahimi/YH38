import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

/**
 * This interceptor adds the JWT token to the Authorization header for each request.
 * It assumes the token is stored in localStorage. If you store it differently
 * (e.g., in httpOnly cookies, or in-memory in a context), you'll need to adjust
 * how the token is retrieved.
 */
api.interceptors.request.use(
  (config) => {
    // This is a common way to store JWT tokens on the client-side.
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;