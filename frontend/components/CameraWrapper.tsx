import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';

type CameraStream = {
  deviceId: string;
  stream: MediaStream;
};

export default function CameraWrapper() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [activeCameras, setActiveCameras] = useState<CameraStream[]>([]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      (async () => {
        setHasPermission(true);

        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter((d) => d.kind === 'videoinput');
          console.log('Available cameras:', videoDevices);
          setCameras(videoDevices);
        } catch (error) {
          console.error('Erro ao listar dispositivos de vídeo:', error);
        }
      })();
    }
  }, []);

  const toggleCamera = async (deviceId: string, checked: boolean) => {
    if (checked) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId } });
        console.log(`Camera ${deviceId} activated`, stream);
        setActiveCameras((prev) => [...prev, { deviceId, stream }]);
      } catch (err) {
        alert('Erro ao acessar a câmera: ' + err);
      }
    } else {
      setActiveCameras((prev) => {
        const camToRemove = prev.find(c => c.deviceId === deviceId);
        if (camToRemove) {
          console.log(`Camera ${deviceId} deactivated`);
          camToRemove.stream.getTracks().forEach(track => track.stop());
        }
        return prev.filter(c => c.deviceId !== deviceId);
      });
    }
  };

  if (Platform.OS !== 'web') {
    return <Text>Essa versão é para web apenas</Text>;
  }

  if (hasPermission === false) {
    return <Text style={styles.permissionText}>Permissão da câmera foi negada.</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraSelectionContainer}>
        <Text style={styles.selectionTitle}>Selecione as câmeras para ativar:</Text>

        {cameras.map((cam) => {
          const isChecked = activeCameras.some((c) => c.deviceId === cam.deviceId);
          return (
            <View key={cam.deviceId} style={styles.checkboxContainer}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => toggleCamera(cam.deviceId, e.target.checked)}
              />
              <label style={{ marginLeft: 8 }}>{cam.label || `Câmera ${cam.deviceId}`}</label>
            </View>
          );
        })}
      </View>

      <View style={styles.videosContainer}>
        {activeCameras.map(({ deviceId, stream }) => (
          <video
            key={deviceId}
            autoPlay
            playsInline
            muted
            style={styles.video}
            ref={(video) => {
              if (video && video.srcObject !== stream) {
                video.srcObject = stream;
              }
            }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  videosContainer: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 20, 
  } as any,

  video: {
    width: 'auto',
    height: 240,
    borderRadius: 10,
    border: '2px solid #3498db',
    backgroundColor: '#000',
    objectFit: 'cover',
  } as any,
  permissionText: {
    color: '#f00',
    textAlign: 'center',
    fontSize: 16,
  },
  cameraSelectionContainer: {
    position: 'sticky', 
    top: 0,
    backgroundColor: '#fff',
    padding: 16,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    textAlign: 'center',
  },
  selectionTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
  },
});