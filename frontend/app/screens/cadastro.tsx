import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function CadastroHome() {
  const navigation = useNavigation();
  const router = useRouter();

  const toggleDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  const [cadastros, setCadastros] = useState([
    { id: '1', foto: null, nome: 'Maria Silva', username: 'maria123', email: 'maria@email.com' },
    { id: '2', foto: null, nome: 'João Souza', username: 'joaosz', email: 'joao@email.com' },
  ]);

  const irParaCadastro = () => {
    router.push('/cadastro');
  };

  const editarCadastro = (id: string) => {
    router.push(`/cadastro`); 
  };

  const excluirCadastro = (id: string) => {
    setCadastros(prev => prev.filter(item => item.id !== id));
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.dataRow}>
      <View style={[styles.dataCell, styles.fotoCell]}>
        {item.foto ? (
          <Image source={{ uri: item.foto }} style={styles.avatar} />
        ) : (
          <Ionicons name="person-circle-outline" size={40} color="#888" />
        )}
      </View>
      
      <View style={[styles.dataCell, styles.idCell]}>
        <Text style={styles.dataText}>{item.id}</Text>
      </View>
      
      <View style={[styles.dataCell, styles.nomeCell]}>
        <Text style={styles.dataText}>{item.nome}</Text>
      </View>
      
      <View style={[styles.dataCell, styles.usernameCell]}>
        <Text style={styles.dataText}>{item.username}</Text>
      </View>
      
      <View style={[styles.dataCell, styles.emailCell]}>
        <Text style={styles.dataText}>{item.email}</Text>
      </View>
      
      <View style={[styles.dataCell, styles.acoesCell]}>
        <TouchableOpacity onPress={() => editarCadastro(item.id)} style={styles.actionButton}>
          <Ionicons name="create-outline" size={20} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => excluirCadastro(item.id)} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={20} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {Platform.OS === 'web' && (
        <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#000" />
        </TouchableOpacity>
      )}

      <ScrollView horizontal={true} style={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Cadastros de Pessoas</Text>
          </View>

          {/* Cabeçalho da tabela */}
          <View style={styles.headerRow}>
            <View style={[styles.headerCell, styles.fotoCell]}>
              <Text style={styles.headerText}>Foto</Text>
            </View>
            <View style={[styles.headerCell, styles.idCell]}>
              <Text style={styles.headerText}>ID</Text>
            </View>
            <View style={[styles.headerCell, styles.nomeCell]}>
              <Text style={styles.headerText}>Nome</Text>
            </View>
            <View style={[styles.headerCell, styles.usernameCell]}>
              <Text style={styles.headerText}>Username</Text>
            </View>
            <View style={[styles.headerCell, styles.emailCell]}>
              <Text style={styles.headerText}>Email</Text>
            </View>
            <View style={[styles.headerCell, styles.acoesCell]}>
              <Text style={styles.headerText}>Ações</Text>
            </View>
          </View>

          <FlatList
            data={cadastros}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.flatList}
          />
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={irParaCadastro}>
        <Ionicons name="add-circle" size={60} color="#4CAF50" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    minWidth: Dimensions.get('window').width,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  menuButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  headerCell: {
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  dataCell: {
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  dataText: {
    fontSize: 14,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  actionButton: {
    paddingHorizontal: 5,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  flatList: {
    marginBottom: 20,
  },
 
  fotoCell: { width: 80 },
  idCell: { width: 60 },
  nomeCell: { width: 150 },
  usernameCell: { width: 120 },
  emailCell: { width: 200 },
  acoesCell: { width: 100, flexDirection: 'row', justifyContent: 'space-around' },
});