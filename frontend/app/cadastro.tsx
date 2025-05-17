import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function Cadastro() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [imagem, setImagem] = useState<string | null>(null);

  const [modoEdicao, setModoEdicao] = useState(false);
  const [id, setId] = useState<string | null>(null);

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

  const handleSalvar = () => {
    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    const novoCadastro = {
      id: id || Date.now().toString(),
      nome,
      username: usuario,
      email,
      password: senha,
      foto: imagem,
    };

    if (params.salvarCadastro) {
      const callback = eval(params.salvarCadastro as string); // CUIDADO: só use isso localmente!
      callback(novoCadastro);
    }

    router.back();
  };

  return (
    <View style={styles.container}>
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
        <TouchableOpacity onPress={() => router.push('/login')} style={styles.voltar}>
          <Text style={styles.voltarTexto}>Voltar para login</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

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
  voltarTexto: { color: '#999' }
});
