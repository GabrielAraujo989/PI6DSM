import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ImageBackground
} from "react-native";
import "expo-router/entry";
import { Button } from '../components/Button';
import { useRouter } from 'expo-router';
import { AuthContext } from '../contexts/AuthContext';
import * as Animatable from 'react-native-animatable';

export default function Welcome() {
  const router = useRouter();


  return (
    <ImageBackground
      source={require('../assets/images/fundo.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar backgroundColor="#00000000" barStyle="light-content" translucent />
      <View style={styles.containerLogo}>
        <Animatable.Image
          animation="flipInY"
          source={require('../assets/images/fundo2.png')}
          style={{ width: '100%' }}
          resizeMode="contain"
        />
      </View>
      <Animatable.View delay={600} animation='fadeInUp' style={styles.containerForm}>
        <Text style={styles.title}>Seja Bem vindo</Text>
        <Button title="Login" onPress={() => router.push('/login')} />
      </Animatable.View>
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
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  containerForm: {
    flex: 1,
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
