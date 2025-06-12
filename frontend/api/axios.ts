import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: Constants.expoConfig?.extra?.BASE_URL,
});

// Função auxiliar para buscar token de forma assíncrona
async function getTokenUniversal() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('token');
  } else {
    return await AsyncStorage.getItem('token');
  }
}

// Interceptor síncrono, mas injeta o token se já estiver no localStorage (web)
api.interceptors.request.use((config) => {
  let token = null;
  if (typeof window !== 'undefined' && window.localStorage) {
    token = window.localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  // Para mobile, o token deve ser adicionado manualmente nas chamadas (ou use contexto)
  return config;
});

// Função utilitária para chamadas autenticadas no mobile
export async function apiWithAuth(config: any) {
  const token = await getTokenUniversal();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return api(config);
}

export default api;
