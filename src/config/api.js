import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  try {
    if (window.clerk?.session) {
      const token = await window.clerk.session.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.error(
      'Error in API request interceptor getting clerk token:',
      error
    );
  }
  return config;
});

export default api;
