// lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://doculinka-doculinka-api.inn2fb.easypanel.host/api',
});

// Interceptor de Requisição
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Resposta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // --- LÓGICA DE LIMITE DE PLANO (DISPARO DE EVENTO) ---
    if (error.response && error.response.status === 403) {
      const message = error.response.data?.message || '';
      
      // Verifica palavras-chave
      if (
        message.includes('Limite') || 
        message.includes('upgrade') || 
        message.includes('assinatura') || 
        message.includes('Regularize')
      ) {
        // Dispara um evento global que o React vai ouvir
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('TRIGGER_UPGRADE_MODAL', { 
            detail: { message } 
          });
          window.dispatchEvent(event);
        }
      }
    }
    // -----------------------------------------------------

    // --- LÓGICA DE REFRESH TOKEN ---
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            if (typeof window !== 'undefined') window.location.href = '/login';
            return Promise.reject(error);
        }
        const { data } = await api.post('/auth/refresh', { refreshToken });
        localStorage.setItem('authToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;