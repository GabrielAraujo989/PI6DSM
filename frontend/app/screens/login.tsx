import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Alert
} from "react-native";
import { useRouter } from 'expo-router';
import { login } from '../api/authApi';
import * as Animatable from 'react-native-animatable';

export default function Welcome() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      router.push('/screens/dashboard');
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError("E-mail ou senha incorretos.");
      } else if (err?.response?.status === 404) {
        setError("E-mail não cadastrado.");
      } else {
        setError("Erro ao conectar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/fundo.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.containerLogo}>
        <Animatable.Image
          animation="flipInY"
          source={require('../../assets/images/fundo2.png')}
          style={{ width: '100%' }}
          resizeMode="contain"
        />
      </View>
      <View style={styles.containerLogin}>
        <Animatable.View animation="fadeInLeft" delay={500} style={styles.containerHeader}>
          <Text style={styles.message}>Faça login</Text>
        </Animatable.View>
        <Animatable.View animation="fadeInUp" delay={600} style={styles.containerForm}>
          <Text style={styles.title}>E-mail</Text>
          <TextInput
            placeholder="Digite um email..."
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Text style={styles.title}>Senha</Text>
          <TextInput
            placeholder="Digite sua senha"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Acessar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonCadastro}
            onPress={() => router.push('/screens/cadastro')}
          >
            <Text style={styles.buttonCad}>Não tem uma conta? Cadastre-se</Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
    containerLogo: {
      flex:1,
      justifyContent: 'center',
      alignItems: 'center'
    },
  containerLogin: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20, 
  },
  
  containerHeader: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
    message:{
      fontSize: 28,
      fontWeight: 'bold',
      color: '#fff'
    },
  containerForm: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 12,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
    title: {
      fontSize: 20,
      marginTop: 28,
    },
    input: {
      borderBottomWidth: 1,
      height: 40,
      marginBottom: 12,
      fontSize: 16,
  },
  button: {
    backgroundColor: '#C0C0C0',
    width: '100%',
    paddingVertical: 5,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  buttonCadastro: {
    marginTop: 14,
    alignSelf: 'center'
  },
  buttonCad: {
    color: '#a1a1a1',
  },
  error: {
    color: 'red',
    marginBottom: 8,
    textAlign: 'center',
  },
});
