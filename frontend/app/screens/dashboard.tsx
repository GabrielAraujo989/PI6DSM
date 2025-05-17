import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function Welcome() {
  const navigation = useNavigation();

  const toggleDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  return (
    <View style={{ flex: 1 }}>
      {Platform.OS === 'web' && (
        <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#000" />
        </TouchableOpacity>
      )}
      
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Sejam Bem Vindos</Text>
        </View>
        
        <View style={styles.summaryContainer}>
          <View style={[styles.card, styles.blueCard]}>
            <Text style={styles.cardText}>28 / 31 Funcionários Identificadas</Text>
          </View>
          <View style={[styles.card, styles.blueCard]}>
            <Text style={styles.cardText}>1 / 20 Visitantes Identificados</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  menuButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  title: {
    marginTop: 60,
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  card: {
    width: '45%',
    margin: 8,
    padding: 16,
    borderRadius: 8,
  },
  cardText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  blueCard: {
    backgroundColor: '#3498db',
  },
});