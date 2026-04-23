import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    if (response.data.status === 'fail') {
      return Promise.reject(new Error(response.data.message));
    }
    return response.data;
  },
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || '请求失败';
      return Promise.reject(new Error(message));
    }
    return Promise.reject(error);
  }
);

export default api;