import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Camera } from 'expo-camera';
import type { Camera as CameraTypeRef } from 'expo-camera';

import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';

export default function Monitoramento() {
  const navigation = useNavigation();
  const cameraRef = useRef<CameraTypeRef>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');

  useEffect(() => {
    if (Platform.OS === 'web') {
      setHasPermission(true); 
    } else {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    }
  }, []);

  useEffect(() => {
    if (hasPermission === false) {
      console.log('Permissão da câmera foi negada.');
    }
  }, [hasPermission]);

  useEffect(() => {
    if (Platform.OS === 'web' && hasPermission && !streamRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((mediaStream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.muted = true;
            videoRef.current.play();
          }
          streamRef.current = mediaStream;
        })
        .catch((err) => {
          console.warn('Erro ao ativar câmera (web):', err);
          alert(
            'Erro ao acessar a câmera. Verifique as permissões no navegador.'
          );
        });

      return () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };
    }
  }, [hasPermission]);

  const toggleDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
        <Ionicons name="menu" size={28} color="#000" />
      </TouchableOpacity>

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Monitoramento</Text>
        </View>

        {hasPermission === false && (
          <Text style={styles.permissionText}>
            Permissão da câmera foi negada.
          </Text>
        )}

        {Platform.OS === 'web' && hasPermission && (
          <View style={styles.videoContainer}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={styles.video}
            />
          </View>
        )}

        {Platform.OS !== 'web' && hasPermission && (
          <View style={styles.videoContainer}>
            <Camera
              ref={cameraRef}
              style={styles.camera}
              type={'back'}
              onCameraReady={() => setIsCameraReady(true)}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.summaryContainer}>
        <View style={[styles.card, styles.blueCard]}>
          <Text style={styles.cardText}>28 / 31 Funcionários Identificados</Text>
        </View>
        <View style={[styles.card, styles.blueCard]}>
          <Text style={styles.cardText}>1 / 20 Visitantes Identificados</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 16,
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
  menuButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  videoContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  video: {
    width: '100%',
    maxWidth: 800,
    height: 480,
    borderRadius: 10,
    border: '2px solid #3498db',
    backgroundColor: '#000',
    objectFit: 'cover',
  } as any,
  camera: {
    width: '100%',
    height: 480,
    borderRadius: 10,
    overflow: 'hidden',
  },
  permissionText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
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
    backgroundColor: '#3498db',
  },
});