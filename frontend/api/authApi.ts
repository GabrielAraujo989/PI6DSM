import api from './axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  const { access_token, name, role } = response.data as any;
  console.log('JWT capturado:', access_token); // Exibe o JWT no console do navegador
  console.log('Usuário logado:', name);
  console.log('Role:', role);
  await AsyncStorage.setItem('token', access_token);
  // Retorna também nome e role para uso no frontend
  return { access_token, name, role };
};

export const logout = async () => {
  await AsyncStorage.removeItem('token');
};
