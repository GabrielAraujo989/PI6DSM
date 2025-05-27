import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Componente principal de cadastro e edição de usuário
export default function Cadastro() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Estados para armazenar os dados do formulário
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [imagem, setImagem] = useState<string | null>(null);

  // Estados para modo de edição e id do usuário
  const [modoEdicao, setModoEdicao] = useState(false);
  const [id, setId] = useState<string | null>(null);

  // Ao abrir a tela, verifica se está em modo de edição e preenche os campos
  useEffect(() => {
    if (params && params.pessoa) {
      const pessoa = JSON.parse(params.pessoa as string);
      setNome(pessoa.nome);
      setUsuario(pessoa.username);
      setEmail(pessoa.email);
      setSenha(pessoa.password);
      setConfirmarSenha(pessoa.password);
      setImagem(pessoa.foto || null);
      setId(pessoa.id);
      setModoEdicao(true);
    }
  }, [params]);

  // Função para escolher imagem da galeria
  const escolherImagem = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!resultado.canceled) {
      setImagem(resultado.assets[0].uri);
    }
  };

  // Função para salvar cadastro ou edição de forma segura via backend
  const handleSalvar = async () => {
    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    // Monta o payload conforme o DTO do backend
    const payload: any = {
      name: nome,
      email: email,
      password: senha,
      photoUrl: imagem, // O backend espera uma URL, ajuste se for upload
      role: 'CLIENT', // ou outro papel, se aplicável
      // birthDate, cpf: adicionar campos se desejar
    };

    try {
      let response;
      if (modoEdicao && id) {
        // Edição: PATCH /users/:id (requer token)
        const token = await AsyncStorage.getItem('token');
        response = await fetch(`http://localhost:8081/users/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Cadastro: POST /users/register
        response = await fetch('http://localhost:8081/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Erro', errorData.message || 'Erro ao salvar usuário');
        return;
      }

      Alert.alert('Sucesso', modoEdicao ? 'Usuário atualizado!' : 'Cadastro realizado com sucesso!');
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão com o servidor.');
    }
  };

  // Renderização do formulário
  return (
    <View style={[styles.container, Platform.OS === 'web' && styles.webContainer]}>
      <Text style={styles.titulo}>{modoEdicao ? 'Editar Cadastro' : 'Cadastro'}</Text>

      <TextInput placeholder="Nome completo" style={styles.input} value={nome} onChangeText={setNome} />
      <TextInput placeholder="Usuário" style={styles.input} value={usuario} onChangeText={setUsuario} />
      <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput placeholder="Senha" style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry />
      <TextInput placeholder="Confirmar senha" style={styles.input} value={confirmarSenha} onChangeText={setConfirmarSenha} secureTextEntry />

      <TouchableOpacity style={styles.uploadBtn} onPress={escolherImagem}>
        <Text style={styles.uploadText}>Selecionar imagem</Text>
      </TouchableOpacity>
      {imagem && <Image source={{ uri: imagem }} style={styles.imagem} />}

      <TouchableOpacity style={styles.button} onPress={handleSalvar}>
        <Text style={styles.buttonText}>{modoEdicao ? 'Salvar Alterações' : 'Cadastrar'}</Text>
      </TouchableOpacity>

      {!modoEdicao && (
        <TouchableOpacity onPress={() => router.push('/screens/login')} style={styles.voltar}>
          <Text style={styles.voltarTexto}>Voltar para login</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Estilos do componente
const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff' },
  titulo: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  uploadBtn: {
    backgroundColor: '#ddd',
    padding: 10,
    alignItems: 'center',
    borderRadius: 6,
    marginBottom: 12
  },
  uploadText: { color: '#333' },
  imagem: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 12 },
  button: {
    backgroundColor: '#38a69d',
    padding: 12,
    alignItems: 'center',
    borderRadius: 6
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  voltar: { marginTop: 20, alignItems: 'center' },
  voltarTexto: { color: '#999' },
  webContainer: {
    maxWidth: '33%',
    marginHorizontal: 'auto',
    width: '100%',
  },
});
