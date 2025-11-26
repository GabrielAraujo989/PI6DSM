import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API principal (autenticação, usuários, etc)
const api = axios.create({
  baseURL: Constants.expoConfig?.extra?.API_BASE_URL,
});

// DetectFace API (câmeras)
export const detectfaceApi = axios.create({
  baseURL: Constants.expoConfig?.extra?.DETECTFACE_BASE_URL,
});

// Função auxiliar para buscar token de forma assíncrona
async function getTokenUniversal() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('token');
  } else {
    return await AsyncStorage.getItem('token');
  }
}

// Interceptor para API principal
api.interceptors.request.use((config) => {
  let token = null;
  if (typeof window !== 'undefined' && window.localStorage) {
    token = window.localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config; 
});

// Interceptor para DetectFace API
// (opcional, se quiser autenticação JWT também nas rotas de câmera)
detectfaceApi.interceptors.request.use((config) => {
  let token = null;
  if (typeof window !== 'undefined' && window.localStorage) {
    token = window.localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
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
