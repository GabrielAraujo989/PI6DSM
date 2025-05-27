import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getProfile } from '../api/userApi';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getProfile()
      .then(setUser)
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
