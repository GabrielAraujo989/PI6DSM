import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Header from '../../components/Header';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import CameraWrapper from '../../components/CameraWrapper';

export default function Monitoramento() {
  const navigation = useNavigation();

  const toggleDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  return (
    <View style={{ flex: 1 }}>
      <Header title="Monitoramento" />

      {/* Área fixa da seleção de câmeras */}
      <View style={styles.selectionFixedContainer}>
        <CameraWrapper />
      </View>      

      {/* Resumo embaixo (ou coloque onde desejar) */}
      <View style={styles.summaryContainer}>
        <View style={[styles.card, styles.blueCard]}>
          <Text style={styles.cardText}>28 Quantidade de Pessoa Identificadas</Text>
        </View>
        <View style={[styles.card, styles.blueCard]}>
          <Text style={styles.cardText}>1 Total de pessoas ao vivo na tela</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  selectionFixedContainer: {
    position: 'sticky',  // para web
    top: 0,
    zIndex: 100,
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
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
