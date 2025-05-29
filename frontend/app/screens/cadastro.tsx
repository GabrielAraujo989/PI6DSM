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
import Header from '../../components/Header';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function Cadastro() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [emailValido, setEmailValido] = useState(true);
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [imagem, setImagem] = useState<string | null>(null);

  const [modoEdicao, setModoEdicao] = useState(false);
  const [id, setId] = useState<string | null>(null);

  const [perfil, setPerfil] = useState('padrao');

  useEffect(() => {
    if (params && params.pessoa) {
      const pessoa = JSON.parse(params.pessoa as string);
      setNome(pessoa.nome);
      setCpf(pessoa.cpf);
      setEmail(pessoa.email);
      setSenha(pessoa.password);
      setConfirmarSenha(pessoa.password);
      setDataNascimento(pessoa.dataNascimento);
      setImagem(pessoa.foto || null);
      setId(pessoa.id);
      setModoEdicao(true);
    }
  }, [params]);

  const aplicarMascaraCPF = (cpf: string): string => {
    cpf = cpf.replace(/\D/g, '').slice(0, 11);
    return cpf
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };
  const aplicarMascaraData = (data: string): string => {
  data = data.replace(/\D/g, '').slice(0, 8); // Só números, até 8 dígitos
  if (data.length >= 5) {
    return data.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
  } else if (data.length >= 3) {
    return data.replace(/(\d{2})(\d{1,2})/, '$1/$2');
  } else {
    return data;
  }
};
const validarEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

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
      cpf,
      email,
      password: senha,
      dataNascimento,
      foto: imagem,
      perfil,
    };

    if (params.salvarCadastro) {
      const callback = eval(params.salvarCadastro as string);
      callback(novoCadastro);
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      <Header title="Cadastro" />
      <View style={styles.textInput}>
        <TextInput placeholder="Nome completo" style={styles.input} value={nome} onChangeText={setNome} />
        <TextInput
          placeholder="CPF"
          style={styles.input}
          value={cpf}
          onChangeText={(text) => setCpf(aplicarMascaraCPF(text))}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Data de nascimento (dd/mm/aaaa)"
          style={styles.input}
          value={dataNascimento}
          onChangeText={(text) => setDataNascimento(aplicarMascaraData(text))}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Email"
          style={[styles.input, !emailValido && { borderColor: 'red' }]}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailValido(validarEmail(text));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {!emailValido && <Text style={{ color: 'red' }}>E-mail inválido</Text>}
        <TextInput placeholder="Senha" style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry />
        <TextInput placeholder="Confirmar senha" style={styles.input} value={confirmarSenha} onChangeText={setConfirmarSenha} secureTextEntry />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={perfil}
            onValueChange={(itemValue) => setPerfil(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Padrão" value="padrao" />
            <Picker.Item label="Administrador" value="admin" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.uploadBtn} onPress={escolherImagem}>
          <Text style={styles.uploadText}>Selecionar imagem</Text>
        </TouchableOpacity>
        {imagem && <Image source={{ uri: imagem }} style={styles.imagem} />}

        <TouchableOpacity style={styles.button} onPress={handleSalvar}>
          <Text style={styles.buttonText}>{modoEdicao ? 'Salvar Alterações' : 'Cadastrar'}</Text>
        </TouchableOpacity>

        {!modoEdicao && (
          <TouchableOpacity onPress={() => router.push('../../screens/cadastro')} style={styles.voltar}>
            <Text style={styles.voltarTexto}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  textInput: {
    marginTop: 20,
    justifyContent: 'center',
    alignSelf: 'center',
    width: '80%',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  input: {
    width: '80%',
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 6,
    marginBottom: 12,
  },
  uploadBtn: {
    backgroundColor: '#ddd',
    padding: 10,
    alignItems: 'center',
    borderRadius: 6,
    marginBottom: 12
  },
  uploadText: {
    color: '#333'
  },
  imagem: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 12
  },
  button: {
    backgroundColor: '#ADD8E6',
    padding: 12,
    alignItems: 'center',
    borderRadius: 6
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  voltar: {
    marginTop: 20,
    alignItems: 'center'
  },
  voltarTexto: {
    color: '#999'
  },
  pickerContainer: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 40,
  },
});
