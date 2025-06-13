import React, { useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';

type Camera = {
  nome: string;
  ip: string;
  xaddrs: string[];
  tipos: string;
};

export default function CameraScanner() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const detectarCameras = async () => {
    setLoading(true);
    setErro('');
    try {
      const resposta = await fetch('http://localhost:5000/scan');
      if (!resposta.ok) throw new Error('Agente local não respondeu');
      const data = await resposta.json();
      setCameras(data);
    } catch (e: any) {
      console.error(e);
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button title={loading ? 'Procurando...' : 'Detectar Câmeras IP'} onPress={detectarCameras} />

      {erro ? <Text style={styles.erro}>Erro: {erro}</Text> : null}

      <FlatList
        data={cameras}
        keyExtractor={(item, index) => item.ip + index}
        renderItem={({ item }) => (
          <View style={styles.cameraItem}>
            <Text style={styles.cameraNome}>{item.nome}</Text>
            <Text>{item.ip}</Text>
          </View>
        )}
        ListEmptyComponent={!loading && <Text style={styles.vazio}>Nenhuma câmera IP detectada.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  cameraItem: {
    padding: 10,
    backgroundColor: '#E8E8E8',
    marginBottom: 5,
    borderRadius: 5,
  },
  cameraNome: {
    fontWeight: 'bold',
  },
  erro: {
    color: 'red',
    marginTop: 10,
  },
  vazio: {
    marginTop: 10,
    fontStyle: 'italic',
  },
});
