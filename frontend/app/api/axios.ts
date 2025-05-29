import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

let token: string | null = null;

// Load token into memory during app initialization
AsyncStorage.getItem('token').then((storedToken) => {
  token = storedToken;
});

const api = axios.create({
  baseURL: Constants.expoConfig?.extra?.BASE_URL,
});

// Add the token to headers if it exists
api.interceptors.request.use(
  (config) => {
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
