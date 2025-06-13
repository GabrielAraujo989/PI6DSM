import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Header from '../../components/Header';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import CameraWrapper from '../../components/CameraWrapper';
import CameraScanner from '../../components/CameraScanner';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Monitoramento() { 
  const navigation = useNavigation();
  const router = useRouter();

  const toggleDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  return (
    <View style={{ flex: 1 }}>
      <Header title="Monitoramento" />

      <TouchableOpacity style={{ position: 'absolute', top: 40, left: 20, zIndex: 10 }} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <CameraWrapper />
        <CameraScanner />

        <View style={styles.summaryContainer}>
          <View style={[styles.card, styles.blueCard]}>
            <Text style={styles.cardText}>28 Quantidade de Pessoa Identificadas</Text>
          </View>          
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    backgroundColor: '#ffffff',
  },
  card: {
    alignItems: 'center',
    width: '45%',
    margin: 'auto',
    padding: 15,
    borderRadius: 8,
  },
  cardText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  blueCard: {
    backgroundColor: '#C0C0C0',
  },
});
