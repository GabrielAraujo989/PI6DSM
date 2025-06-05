import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import api from '../api/axios';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get('/user/profile')
      .then(response => {
        console.log('User profile data:', response.data);
        setUser(response.data);
      })
      .catch(err => console.error('Erro ao buscar perfil', err));
  }, []);

  if (!user) return <Text>Carregando...</Text>;

  return (
    <View>
      <Text>Nome: {user.username}</Text>
      <Text>Email: {user.email}</Text>
    </View>
  );
}
