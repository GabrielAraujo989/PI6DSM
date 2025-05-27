import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert
} from "react-native";
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login } from "../api/authApi";

import * as Animatable from 'react-native-animatable'

export default function Welcome() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const token = await login(email, password);
      await AsyncStorage.setItem('token', token);
      router.push(`/screens/dashboard?token=${token}`);
    } catch (error) {
      console.error("Erro ao logar:", error);
      Alert.alert('Erro', 'Falha ao realizar login. Verifique suas credenciais.');
    }
  };

  return (
    <View style={[styles.container, Platform.OS === 'web' && styles.webContainer]}>
      <StatusBar backgroundColor="#38A69D" barStyle="light-content" />
      
      <Animatable.View animation="fadeInLeft" delay={500} style={styles.containerHeader}>
        <Text style={styles.message}>Faça login</Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={500} style={styles.containerform}>
        
      <Text style={styles.title}>E-mail</Text>
        <TextInput
          placeholder="Digite um email..."
          style={styles.input}
          onChangeText={setEmail}
          value={email}
        />

        <Text style={styles.title}>Senha</Text>
        <TextInput
          placeholder="Digite sua senha"
          style={styles.input}
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
        >  
        <Text style={styles.buttonText}>Acessar</Text>              
        </TouchableOpacity> 

        <TouchableOpacity
          style={styles.buttonCadastro}
          onPress={() => router.push('/screens/cadastro')}
        >
          <Text style={styles.buttonCad}>Não tem uma conta? Cadastre-se</Text>
        </TouchableOpacity>

      </Animatable.View>     

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#38a69d',
  },
  containerHeader:{
    marginTop: '14%',
    marginBottom: '8%',
    paddingStart: '5%',
  },
  message:{
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff'
  },
  containerform:{
    backgroundColor: '#fff',
    flex:1,
    paddingStart: '5%',
    paddingEnd: '5%',
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
  backgroundColor: '#022601',
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
webContainer: {
  maxWidth: '33%',
  marginHorizontal: 'auto',
  width: '100%',
},
});
