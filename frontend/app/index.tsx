import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar
} from "react-native";
import { Button } from '../components/Button';
import { useRouter } from 'expo-router';

import * as Animatable from 'react-native-animatable'

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#38A69D" barStyle="light-content" />

      <View style={styles.containerLogo}>
        <Animatable.Image
          animation="flipInY"
          source={require('../assets/images/logo.png')}
          style={{ width: '100%' }}
          resizeMode="contain"
        />
      </View>
         
      <Animatable.View delay={600} animation='fadeInUp' style={styles.containerForm}>
        <Text style={styles.title}>Seja Bem vindo</Text>
        <Button title="Login" onPress={() => router.push('/login')} />
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#38a69d'
  },
  containerLogo: {
    flex:2,
    backgroundColor: '#38a69d',
    justifyContent: 'center',
    alignItems: 'center'
  },
  containerForm:{
    flex:1,
    backgroundColor: '#fff',
    paddingStart: '5%',
    paddingEnd: '5%',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 28
  }
});
