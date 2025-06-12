import React from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';

const { width, height } = Dimensions.get('window');

export default function Imagens() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <Header title="Upload de Imagens"/> 
      <TouchableOpacity style={{ position: 'absolute', top: 40, left: 20, zIndex: 10 }} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>
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