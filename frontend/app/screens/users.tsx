import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Header from '../../components/Header';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../contexts/AuthContext';
import { getUsers, deleteUser } from '../../api/userApi';
import dayjs from 'dayjs';
import { Ionicons } from '@expo/vector-icons';

type User = {
  id: number;
  name: string;
  role: string;
  birthDate?: string;
  // add other fields if needed
};

export default function Users() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Proteção de rota: só ADMIN e SUPER_USER
  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_USER') {
      router.replace('/screens/dashboard');
      return;
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let data;
      if (user?.role === 'ADMIN') {
        data = await getUsers('CLIENT');
      } else {
        data = await getUsers(); // SUPER_USER vê todos
      }
      setUsers(data as User[]);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível carregar os usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

interface EditUserParams {
    pessoa: string;
}

const handleEdit = (user: User | null) => {
    if (user) {
        router.push(`/cadastro?pessoa=${encodeURIComponent(JSON.stringify(user))}`);
    } else {
        router.push('/cadastro');
    }
};

  const handleDelete = (userId: number) => {
    Alert.alert('Confirmação', 'Deseja realmente excluir este usuário?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            await deleteUser(userId.toString());
            fetchUsers();
          } catch {
            Alert.alert('Erro', 'Não foi possível excluir o usuário.');
          }
        }
      }
    ]);
  };

  // Remove filtragem duplicada, pois já é feita na API
  let filteredUsers = users;

  const calcularIdade = (birthDate: string) => {
    if (!birthDate) return '-';
    const data = dayjs(birthDate.length === 10 ? birthDate : birthDate.split('T')[0]);
    if (!data.isValid()) return '-';
    return dayjs().diff(data, 'year');
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity style={{ position: 'absolute', top: 40, left: 20, zIndex: 10 }} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>
      <Header title="Usuários" />
      <TouchableOpacity style={styles.addButton} onPress={() => handleEdit(null)}>
        <Text style={styles.addButtonText}>Cadastrar Novo Usuário</Text>
      </TouchableOpacity>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableCell, styles.headerCell, {flex:2}]}>Nome</Text>
        <Text style={[styles.tableCell, styles.headerCell]}>Idade</Text>
        <Text style={[styles.tableCell, styles.headerCell]}>Perfil</Text>
        <Text style={[styles.tableCell, styles.headerCell, {textAlign:'right'}]}>Ações</Text>
      </View>
      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id?.toString()}
        refreshing={loading}
        onRefresh={fetchUsers}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, {flex:2}]}>{item.name}</Text>
            <Text style={styles.tableCell}>{calcularIdade(item.birthDate || '')}</Text>
            <Text style={styles.tableCell}>{item.role}</Text>
            <View style={[styles.tableCell, {flexDirection:'row', justifyContent:'flex-end'}]}>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <Text style={styles.editText}>Editar</Text>
              </TouchableOpacity>
              {(user?.role === 'SUPER_USER' && (item.role === 'ADMIN' || item.role === 'CLIENT')) && (
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteText}>Excluir</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: '#38a69d',
    padding: 12,
    margin: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    marginHorizontal: 8,
    marginBottom: 4,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tableCell: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 4,
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#333',
  },
  userName: { fontWeight: 'bold', fontSize: 16 },
  actions: { flexDirection: 'row', marginTop: 8 },
  editText: { color: '#38a69d', marginRight: 16 },
  deleteText: { color: 'red' },
});
