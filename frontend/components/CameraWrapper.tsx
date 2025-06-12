import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Button, Platform } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import api, { detectfaceApi } from '../api/apis';

type CameraStream = {
  deviceId: string;
  stream: MediaStream;
};

type IPCamera = {
  ip: string;
  ports: number[];
  type: string;
};

const HTTP_USERNAME = 'admin';
const HTTP_PASSWORD = '1nf04mat!c@';
const DETECTFACE_API = 'http://localhost:8000'; // ajuste se rodar em outro host/porta

export default function CameraWrapper() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [activeCameras, setActiveCameras] = useState<CameraStream[]>([]);
  const [ipCameras, setIpCameras] = useState<IPCamera[]>([]);
  const [selectedIPStreams, setSelectedIPStreams] = useState<string[]>([]);
  const { user } = useContext(AuthContext);
  const [jwt, setJwt] = useState<string | null>(null);
  const [faceCounts, setFaceCounts] = useState<{[ip: string]: number}>({});

  const [usbOpen, setUsbOpen] = useState<boolean>(true);
  const [ipOpen, setIpOpen] = useState<boolean>(true);

  useEffect(() => {
    if (Platform.OS === 'web') {
      (async () => {
        setHasPermission(true);
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter((d) => d.kind === 'videoinput');
          setCameras(videoDevices);
        } catch (error) {
          console.error('Erro ao listar dispositivos de vídeo:', error);
        }
      })();

      fetch("http://localhost:5000/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          network: "10.0.1.142",
          port: 80
        })
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.ativos)) {
            const formatadas: IPCamera[] = data.ativos.map((ip: string) => ({
              ip,
              ports: [80],
              type: 'IP'
            }));
            setIpCameras(formatadas);
          } else {
            console.warn("Resposta inesperada do backend:", data);
          }
        })
        .catch(err => console.error("Erro ao buscar câmeras IP:", err));
    }
  }, []);

  useEffect(() => {
    // Supondo que o token JWT está salvo no localStorage/AsyncStorage
    (async () => {
      let token = null;
      if (typeof window !== 'undefined' && window.localStorage) {
        token = window.localStorage.getItem('token');
      } else {
        const mod = await import('@react-native-async-storage/async-storage');
        token = await mod.default.getItem('token');
      }
      setJwt(token);
    })();
  }, []);

  // Função para iniciar detecção no DetectFace
  const startDetectFace = async (ip: string) => {
    if (!jwt) return;
    await fetch(`${DETECTFACE_API}/start_camera/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify({ url: ip, conf: 0.5 })
    });
  };

  // Função para buscar contagem de faces (via polling simples)
  useEffect(() => {
    if (!jwt) return;
    const interval = setInterval(() => {
      ipCameras.forEach(cam => {
        fetch(`${DETECTFACE_API}/faces_count?ip=${cam.ip}`, {
          headers: { 'Authorization': `Bearer ${jwt}` }
        })
          .then(res => res.json())
          .then(data => {
            setFaceCounts(prev => ({ ...prev, [cam.ip]: data.count }));
          });
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [ipCameras, jwt]);

  // Função para buscar contagem de faces de todas as câmeras
  useEffect(() => {
    if (!jwt) return;
    const interval = setInterval(() => {
      fetch(`${process.env.DETECTFACE_BASE_URL || DETECTFACE_API}/faces_count_all`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      })
        .then(res => res.json())
        .then((data: {ip: string, count: number}[]) => {
          if (Array.isArray(data)) {
            const counts: {[ip: string]: number} = {};
            data.forEach(item => {
              counts[item.ip] = item.count;
            });
            setFaceCounts(counts);
          }
        });
    }, 2000);
    return () => clearInterval(interval);
  }, [ipCameras, jwt]);

  const toggleCamera = async (deviceId: string, checked: boolean) => {
    if (checked) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId } });
        setActiveCameras((prev) => [...prev, { deviceId, stream }]);
      } catch (err) {
        alert('Erro ao acessar a câmera: ' + err);
      }
    } else {
      setActiveCameras((prev) => {
        const camToRemove = prev.find(c => c.deviceId === deviceId);
        if (camToRemove) {
          camToRemove.stream.getTracks().forEach(track => track.stop());
        }
        return prev.filter(c => c.deviceId !== deviceId);
      });
    }
  };

  const toggleIPCamera = (ip: string, checked: boolean) => {
    if (checked) {
      setSelectedIPStreams((prev) => [...prev, ip]);
    } else {
      setSelectedIPStreams((prev) => prev.filter((item) => item !== ip));
    }
  };

  const selectAllUSB = () => {
    cameras.forEach(cam => {
      const isChecked = activeCameras.some(c => c.deviceId === cam.deviceId);
      if (!isChecked) toggleCamera(cam.deviceId, true);
    });
  };

  const deselectAllUSB = () => {
    activeCameras.forEach(cam => toggleCamera(cam.deviceId, false));
  };

  const selectAllIP = () => {
    const newIPs = ipCameras.map(cam => cam.ip);
    setSelectedIPStreams(newIPs);
  };

  const deselectAllIP = () => {
    setSelectedIPStreams([]);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Função para conectar à câmera via DetectFace
  async function conectarCameraDetectFace(ipCameraUrl: string) {
    console.log('[FRONTEND] Iniciando conexão com DetectFace:', ipCameraUrl);
    try {
      // 1. Solicita início da detecção
      const response = await detectfaceApi.post('/start_camera/', {
        url: ipCameraUrl,
        conf: 0.5,
      });
      console.log('[FRONTEND] Solicitação enviada para DetectFace:', response.config.url, response.data);
      // 2. Aguarda resposta e exibe stream_url
      if (response.data && typeof response.data === 'object' && 'stream_url' in response.data) {
        console.log('[FRONTEND] Stream disponível em:', response.data.stream_url);
      }
      return response.data;
    } catch (error) {
      console.error('[FRONTEND] Erro ao conectar com DetectFace:', error);
      throw error;
    }
  }

  if (Platform.OS !== 'web') {
    return <Text>Essa versão é para web apenas</Text>;
  }

  if (hasPermission === false) {
    return <Text style={styles.permissionText}>Permissão da câmera foi negada.</Text>;
  }

  return (
    <View style={styles.container}>
      {/* ✅ Vídeos no topo */}
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

        {selectedIPStreams.map((ip, idx) => (
          <View key={ip} style={{ margin: 10 }}>
            <img
              src={`${DETECTFACE_API}/stream/video/${idx}`}
              alt={`Câmera ${ip}`}
              style={{ width: 400, height: 300, borderRadius: 10, border: '2px solid #3498db', backgroundColor: '#000', objectFit: 'cover' }}
            />
            <Text style={{ color: '#fff', fontWeight: 'bold', marginTop: 4 }}>
              Rostos detectados: {faceCounts[ip] ?? '...'}
            </Text>
          </View>
        ))}
      </View>

      {/* 🔽 USB Cameras Dropdown */}
      <div style={styles.dropdown}>
        <div style={styles.dropdownHeader} onClick={() => setUsbOpen(!usbOpen)}>
          <strong>🎥 Câmeras Local</strong> {usbOpen ? '▲' : '▼'}
        </div>
        {usbOpen && (
          <div style={styles.dropdownContent}>
            <div style={styles.buttonRow}>
              <button onClick={selectAllUSB}>Selecionar Todas</button>
              <button onClick={deselectAllUSB}>Desmarcar Todas</button>
            </div>
            {cameras.length === 0 && <Text style={{ fontStyle: 'italic' }}>Nenhuma câmera USB encontrada</Text>}
            {cameras.map((cam) => {
              const isChecked = activeCameras.some((c) => c.deviceId === cam.deviceId);
              return (
                <div
                  key={cam.deviceId}
                  style={{
                    ...styles.card,
                    borderColor: isChecked ? '#3498db' : '#ccc',
                    backgroundColor: isChecked ? '#eaf6fd' : '#fff'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      toggleCamera(cam.deviceId, e.target.checked);
                      if (e.target.checked) {
                        setUsbOpen(false);
                        scrollToTop();
                      }
                    }}
                    style={{ marginRight: 8 }}
                  />
                  <span>{cam.label || `Câmera ${cam.deviceId}`}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🔽 IP Cameras Dropdown */}
      <div style={styles.dropdown}>
        <div style={styles.dropdownHeader} onClick={() => setIpOpen(!ipOpen)}>
          <strong>🌐 Câmeras IP</strong> {ipOpen ? '▲' : '▼'}
        </div>
        {ipOpen && (
          <div style={styles.dropdownContent}>
            <div style={styles.buttonRow}>
              <button onClick={selectAllIP}>Selecionar Todas</button>
              <button onClick={deselectAllIP}>Desmarcar Todas</button>
            </div>
            {ipCameras.length === 0 && <Text style={{ fontStyle: 'italic' }}>Nenhuma câmera IP encontrada</Text>}
            {ipCameras.map((cam) => {
              const isChecked = selectedIPStreams.includes(cam.ip);
              return (
                <div
                  key={cam.ip}
                  style={{
                    ...styles.card,
                    borderColor: isChecked ? '#3498db' : '#ccc',
                    backgroundColor: isChecked ? '#eaf6fd' : '#fff'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      toggleIPCamera(cam.ip, e.target.checked);
                      if (e.target.checked) {
                        setIpOpen(false);
                        scrollToTop();
                      }
                    }}
                    style={{ marginRight: 8 }}
                  />
                  <span>{cam.ip} ({cam.type})</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Botão para iniciar detecção no DetectFace */}
      {ipCameras.map(cam => (
        <Button
          key={cam.ip}
          title={`Iniciar detecção em ${cam.ip}`}
          onPress={() => startDetectFace(cam.ip)}
        />
      ))}

      {/* Renderização das câmeras IP com contagem de faces */}
      <View>
        {ipCameras.map((cam) => (
          <View key={cam.ip} style={{ marginBottom: 24 }}>
            <Text style={{ fontWeight: 'bold' }}>Câmera IP: {cam.ip}</Text>
            {/* Aqui você pode renderizar o vídeo/stream da câmera se desejar */}
            <Text style={{ color: '#007AFF', marginTop: 4 }}>
              Rostos detectados: {faceCounts[cam.ip] ?? 'Carregando...'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  dropdown: {
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  dropdownHeader: {
    padding: 12,
    backgroundColor: '#f2f2f2',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderStyle: 'solid',
    cursor: 'pointer',
    userSelect: 'none',
  },
  dropdownContent: {
    padding: 12,
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ccc',
    cursor: 'pointer',
    marginBottom: 8,
  } as any,
  buttonRow: {
    display: 'flex',
    gap: 10,
    marginBottom: 10,
  },
  videosContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 20,
    display: 'flex',
  } as any,
  video: {
    width: 'auto',
    height: 240,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3498db',
    backgroundColor: '#000',
  } as any,
  permissionText: {
    color: '#f00',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
});