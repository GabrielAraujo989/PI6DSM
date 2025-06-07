import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { saveToken, getToken, removeToken } from '../../service/storage';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {      
      await removeToken();
      router.replace('/');
    };

    logout();
  }, []);
  return null; 
}
