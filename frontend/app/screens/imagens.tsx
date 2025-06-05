import React from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import Header from '../../components/Header';

const { width, height } = Dimensions.get('window');

export default function Imagens() {
  return (
    <View style={{ flex: 1 }}>

      <Header title="Upload de Imagens"/> 

      <ScrollView style={styles.container}>
        <Image
          source={require('../../assets/images/construcao.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logo: {
    width: width,
    height: height * 0.9,
  },
});