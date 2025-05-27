import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';

const api = axios.create({
  baseURL: Constants.expoConfig?.extra?.BASE_URL,
});

// Adiciona o token automaticamente se existir
interface AuthHeaders {
    Authorization?: string;
}

api.interceptors.request.use(async (config: AxiosRequestConfig & { headers?: AuthHeaders }) => {
    const token: string | null = await AsyncStorage.getItem(Constants.expoConfig?.extra?.JWT_SECRET || 'token');
    if (token) {
        if (!config.headers) {
            config.headers = {};
        }
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
