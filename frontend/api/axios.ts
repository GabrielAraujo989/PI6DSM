import axios from 'axios';
import Constants from 'expo-constants';

const api = axios.create({
  baseURL: Constants.expoConfig?.extra?.BASE_URL,
});

// Adiciona o token apenas em runtime, compatível com web e mobile
api.interceptors.request.use(
  // Não usar async aqui! Use um interceptor síncrono para axios
  (config) => {
    let token = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      token = window.localStorage.getItem('token');
    }
    // Para mobile, o token deve ser adicionado manualmente nas chamadas (ou use contexto)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
