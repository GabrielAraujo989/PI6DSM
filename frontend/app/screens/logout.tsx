import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {      
      await AsyncStorage.clear();
    router.replace('/');
    };

    logout();
  }, []);
  return null; 
}
