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

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <CameraWrapper />

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