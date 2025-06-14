import React, {useEffect, useState, useContext, useRef} from 'react';
import { View, Text, StyleSheet, Button, Platform } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import api, { detectfaceApi } from '../api/apis';
import Constants from 'expo-constants';

type CameraStream = {
  deviceId: string;
  stream: MediaStream;
  frameProcessor?: any
};

type IPCamera = {
  ip: string;
  ports: number[];
  type: string;
};


const DETECTFACE_API = 'https://pi-6dsm-detect-face.26nnqp.easypanel.host:8000'; // ajuste se rodar em outro host/porta

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

  const videoRefs = useRef<{[key: string]: HTMLVideoElement | null}>([]);

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

    const startFrameProcessor = (deviceId: string, stream: MediaStream) => {
        console.log(`Iniciando processador para câmera: ${deviceId}`);

        // Aguardamos a referência ao elemento de vídeo estar disponível
        const checkVideoRef = () => {
            const videoElement = videoRefs.current[deviceId];
            if (!videoElement) {
                console.log(`Video ref ainda não disponível para ${deviceId}, tentando novamente em 200ms`);
                setTimeout(checkVideoRef, 200);
                return;
            }

            console.log(`Video ref obtido para ${deviceId}, dimensões: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
            initializeProcessing(videoElement);
        };

        const initializeProcessing = (videoElement: HTMLVideoElement) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) {
                console.error(`Não foi possível obter contexto 2D do canvas para ${deviceId}`);
                return;
            }

            const startCapture = () => {
                console.log(`Iniciando captura para ${deviceId}`);
                const interval = setInterval(async () => {
                    if (!videoElement || videoElement.paused || videoElement.ended) {
                        console.log(`Vídeo pausado ou finalizado para ${deviceId}, parando processador`);
                        clearInterval(interval);
                        return;
                    }

                    try {
                        // Desenha o frame atual no canvas
                        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

                        // Converte para blob
                        const blob = await new Promise<Blob>((resolve, reject) => {
                            canvas.toBlob((b) => {
                                if (b) resolve(b);
                                else reject(new Error("Falha ao converter canvas para blob"));
                            }, 'image/jpeg', 0.8);
                        });

                        // Envia para o backend
                        const formData = new FormData();
                        formData.append('frame', blob, 'frame.jpg');

                        const response = await fetch(`${DETECTFACE_API}/process_usb_frame/`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${jwt}`
                            },
                            body: formData
                        });

                        if (!response.ok) {
                            throw new Error(`Erro HTTP: ${response.status}`);
                        }

                        const result = await response.json();
                        console.log(`Faces detectadas para ${deviceId}: ${result.face_count}`);

                        // Atualiza a contagem de faces para esta câmera
                        setFaceCounts(prev => ({
                            ...prev,
                            [deviceId]: result.face_count
                        }));

                    } catch (error) {
                        console.error(`Erro ao processar frame da câmera USB ${deviceId}:`, error);
                    }
                }, 500); // Reduzido para 2 frames por segundo para diminuir a carga

                // Armazena a referência do intervalo na câmera
                setActiveCameras(prev =>
                    prev.map(cam =>
                        cam.deviceId === deviceId
                            ? {...cam, frameProcessor: interval}
                            : cam
                    )
                );
            };

            // Aguardamos o vídeo estar pronto para configurar as dimensões
            if (!videoElement.videoWidth) {
                console.log(`Aguardando dimensões do vídeo para ${deviceId}`);
                videoElement.addEventListener('loadedmetadata', () => {
                    canvas.width = videoElement.videoWidth;
                    canvas.height = videoElement.videoHeight;
                    console.log(`Dimensões definidas: ${canvas.width}x${canvas.height}`);
                    startCapture();
                });
            } else {
                canvas.width = videoElement.videoWidth;
                canvas.height = videoElement.videoHeight;
                startCapture();
            }
        };

        // Iniciamos a verificação
        checkVideoRef();
    };

  // Função para iniciar detecção em múltiplas câmeras selecionadas (nova rota DetectFace)
  const startDetectFaceMultiple = async () => {
    if (!jwt || selectedIPStreams.length === 0) return;
    await fetch(`${DETECTFACE_API}/start_cameras/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify({ camera_ips: selectedIPStreams })
    });
  };

  // Função para buscar contagem de faces (via polling simples)
  useEffect(() => {
    if (!jwt) return;
    let isMounted = true;
    const interval = setInterval(() => {
      if (!isMounted) return;
      ipCameras.forEach(cam => {
        fetch(`${DETECTFACE_API}/faces_count?ip=${cam.ip}`, {
          headers: { 'Authorization': `Bearer ${jwt}` }
        })
          .then(res => res.json())
          .then(data => {
            if (isMounted) setFaceCounts(prev => ({ ...prev, [cam.ip]: data.count }));
          });
      });
    }, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [ipCameras, jwt]);

    const toggleCamera = async (deviceId: string, checked: boolean) => {
        if (checked) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({video: {deviceId}});

                // Adicionamos a câmera e depois iniciamos a detecção
                console.log(`Ativando câmera: ${deviceId}`);

                // Adicionamos e obtemos a referência imediatamente
                setActiveCameras((prev) => {
                    const newCameras = [...prev, {deviceId, stream}];
                    console.log(`Câmeras ativas atualizadas:`, newCameras.map(c => c.deviceId));

                    // Precisamos esperar o DOM atualizar antes de iniciar a detecção
                    // para que videoRefs.current[deviceId] esteja disponível
                    setTimeout(() => {
                        console.log(`Iniciando detecção para: ${deviceId}`);
                        startFrameProcessor(deviceId, stream);
                    }, 500);

                    return newCameras;
                });

            } catch (err) {
                alert('Erro ao acessar a câmera: ' + err);
            }
        } else {
            setActiveCameras((prev) => {
                const camToRemove = prev.find(c => c.deviceId === deviceId);
                if (camToRemove) {
                    // Para o processador de frames se existir
                    if (camToRemove.frameProcessor) {
                        clearInterval(camToRemove.frameProcessor);
                    }

                    // Para os tracks da stream
                    camToRemove.stream.getTracks().forEach(track => track.stop());
                }
                return prev.filter(c => c.deviceId !== deviceId);
            });

            // Remove a contagem de faces para esta câmera
            setFaceCounts(prev => {
                const newCounts = {...prev};
                delete newCounts[deviceId];
                return newCounts;
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
        // Para cada câmera disponível
        cameras.forEach(async (cam) => {
            const isChecked = activeCameras.some((c) => c.deviceId === cam.deviceId);
            if (!isChecked) {
                console.log(`Selecionando câmera ${cam.deviceId}`);
                await toggleCamera(cam.deviceId, true);
                // Adicionamos um pequeno delay entre cada ativação para evitar sobrecarga
                await new Promise(resolve => setTimeout(resolve, 500));
            }
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
          {activeCameras.map(({deviceId, stream}) => (
              <div key={deviceId} style={{position: 'relative', margin: 10}}>
                  <video
                      key={deviceId}
                      autoPlay
                      playsInline
                      muted
                      style={styles.video}
                      ref={(video) => {
                          if (video) {
                              // Sempre atualizamos a referência
                              videoRefs.current[deviceId] = video;

                              // Só configuramos o srcObject se for diferente
                              if (video.srcObject !== stream) {
                                  console.log(`Definindo srcObject para vídeo ${deviceId}`);
                                  video.srcObject = stream;
                              }
                          }
                      }}
                      onLoadedMetadata={() => {
                          console.log(`Vídeo ${deviceId} carregado, dimensões: ${videoRefs.current[deviceId]?.videoWidth}x${videoRefs.current[deviceId]?.videoHeight}`);
                      }}
                  />
                  <Text style={{
                      color: '#fff',
                      fontWeight: 'bold',
                      position: 'absolute',
                      bottom: 10,
                      left: 10,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      padding: 5,
                      borderRadius: 5
                  }}>
                      Rostos detectados: {faceCounts[deviceId] ?? 0}
                  </Text>
                  <button
                      style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          padding: '4px 12px',
                          borderRadius: 6,
                          background: '#3498db',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer'
                      }}
                      onClick={() => {
                          console.log(`Reiniciando detecção para ${deviceId}`);
                          // Busca a câmera atual
                          const activeCamera = activeCameras.find(c => c.deviceId === deviceId);
                          if (activeCamera) {
                              // Para o processador atual se existir
                              if (activeCamera.frameProcessor) {
                                  clearInterval(activeCamera.frameProcessor);
                              }
                              // Inicia novo processador
                              startFrameProcessor(deviceId, activeCamera.stream);
                          } else {
                              console.error(`Câmera ${deviceId} não encontrada para reiniciar detecção`);
                          }
                      }}
                  >
                      Reiniciar Detecção
                  </button>
              </div>
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
                  <button
                    style={{ marginLeft: 16, padding: '4px 12px', borderRadius: 6, background: '#3498db', color: '#fff', border: 'none', cursor: 'pointer' }}
                    onClick={() => startDetectFace(cam.ip)}
                  >Iniciar Monitoramento</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Botão para iniciar detecção em todas as selecionadas */}
      {ipCameras.length > 0 && (
        <button
          style={{ margin: '12px 0', padding: '8px 18px', borderRadius: 6, background: '#27ae60', color: '#fff', border: 'none', cursor: 'pointer' }}
          onClick={startDetectFaceMultiple}
          disabled={selectedIPStreams.length === 0}
        >
          Iniciar Monitoramento das Selecionadas
        </button>
      )}

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