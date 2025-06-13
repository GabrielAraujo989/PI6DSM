import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Header from '../../components/Header';
import { AuthContext } from '../../contexts/AuthContext';

export default function Welcome() {
  const { user } = useContext(AuthContext);

  // Função para extrair o primeiro nome
  const getFirstName = (fullName?: string) => {
    if (!fullName) return '';
    return fullName.split(' ')[0];
  };

  return (
    <View style={{ flex: 1 }}>
      <Header title={`Olá${user?.name ? ", " + getFirstName(user.name) : ''}`}/>
      <ScrollView style={styles.container}>            
        <View style={styles.summaryContainer}>
          <View style={[styles.card, styles.blueCard]}>
            <Text style={styles.cardText}>28 Pessoas já identificadas</Text>
          </View>
          <View style={[styles.card, styles.blueCard]}>
            <Text style={styles.cardText}>1 Total de pessoas ao vivo na tela</Text>
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
  title: {
    marginTop: 60,
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: 'center',
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
    backgroundColor: '#C0C0C0',
  },
});
