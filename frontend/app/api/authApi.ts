import api from './axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  const access_token = (response.data as any).access_token;
  console.log('JWT capturado:', access_token); // Exibe o JWT no console do navegador
  await AsyncStorage.setItem('token', access_token);
  return access_token;
};

export const logout = async () => {
  await AsyncStorage.removeItem('token');
};
