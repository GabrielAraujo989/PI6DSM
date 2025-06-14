from fastapi import FastAPI, Query, Request, HTTPException, Depends
from pydantic import BaseModel
import threading
import cv2
from ultralytics import YOLO
import torch
import time
import numpy as np
import jwt
from typing import List, Dict
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import urllib.parse

# --- Configuração Inicial ---
app = FastAPI(
    title="API de Detecção Facial",
    description="Uma API para processar streams de múltiplas câmeras e detectar faces em tempo real."
)

# --- Configuração de CORS (Cross-Origin Resource Sharing) ---
# É mais seguro e compatível especificar as origens que podem acessar sua API.
# Adicione a URL do seu frontend de produção e as URLs de desenvolvimento local.
origins = [
    "https://pi-6dsm-pi-6dsm-frontend.26nnqp.easypanel.host", # Sua URL de produção
    "https://pi-6dsm-pi-6dsm-service.26nnqp.easypanel.host",
    "http://localhost:3000", # Exemplo para React
    "http://localhost:8080", # Exemplo para Vue/Angular
    "http://127.0.0.1:5500", # Exemplo para Live Server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas as origens, mas é recomendado restringir a produção
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Carregamento do Modelo e Configuração do Dispositivo ---
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'best.pt')
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"Usando dispositivo: {device}")
try:
    modelo = YOLO(MODEL_PATH).to(device)
except Exception as e:
    print(f"Erro ao carregar o modelo YOLO: {e}")
    # Se o modelo não carregar, a aplicação não deve iniciar.
    # Em um ambiente real, você pode querer um mecanismo de fallback.
    raise

# --- Gerenciamento de Estado Global ---
# Armazena o frame, a contagem de faces e o status de cada câmera.
# Estrutura: { "url_camera": {"frame": frame, "face_count": int, "status": "running|error"} }
cameras_data: Dict[str, Dict] = {}
frames_lock = threading.Lock() # Lock para garantir a segurança das threads

# --- Processamento da Câmera ---
def process_camera(source_url: str, conf: float = 0.5):
    """
    Captura e processa o stream de uma única câmera em uma thread separada.
    """
    cap = cv2.VideoCapture(source_url)
    if not cap.isOpened():
        print(f"[ERRO] Não foi possível abrir a câmera: {source_url}")
        with frames_lock:
            cameras_data[source_url] = {"frame": None, "face_count": 0, "status": "error"}
        return

    while True:
        try:
            ret, frame = cap.read()
            if not ret:
                print(f"[INFO] Stream da câmera {source_url} terminou ou foi perdido.")
                break

            # A predição é feita aqui
            resultados = modelo.predict(source=frame, conf=conf, device=device, verbose=False)
            
            # Pega o primeiro resultado (geralmente só há um por imagem)
            resultado = resultados[0]
            
            # A contagem de faces já é obtida aqui
            num_faces = len(resultado.boxes)
            
            # Desenha as detecções no frame
            frame_processado = resultado.plot()
            cv2.putText(frame_processado, f"Rostos: {num_faces}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

            # Atualiza o dicionário global com o frame e a contagem de faces
            with frames_lock:
                cameras_data[source_url] = {
                    "frame": frame_processado.copy(),
                    "face_count": num_faces,
                    "status": "running"
                }

        except Exception as e:
            print(f"[ERRO] Erro no loop de processamento para {source_url}: {e}")
            break
        
        # Pequena pausa para não sobrecarregar a CPU
        time.sleep(0.05)

    cap.release()
    with frames_lock:
        # Marca a câmera como inativa ou com erro
        cameras_data.pop(source_url, None) # Remove a câmera da lista ativa
    print(f"[INFO] Thread da câmera {source_url} finalizada.")


# --- Autenticação JWT ---
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "SUA_SECRET_KEY_PADRAO_SE_NAO_DEFINIDA")

def verify_jwt(request: Request):
    """
    Verifica o token JWT no cabeçalho da requisição.
    """
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token de autorização ausente ou mal formatado")
    
    token = auth.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

# --- Modelos de Requisição Pydantic ---
class CameraRequest(BaseModel):
    url: str
    conf: float = 0.5

class StartCamerasRequest(BaseModel):
    camera_ips: List[str]

# --- Endpoints da API ---

@app.get("/", summary="Verifica o Status da API")
def root():
    return {"status": "ok", "message": "API de detecção facial pronta!"}

@app.post("/start_camera/", summary="Inicia a detecção em uma nova câmera", dependencies=[Depends(verify_jwt)])
def start_camera(req: CameraRequest):
    """
    Inicia uma nova thread para processar uma câmera se ela ainda não estiver ativa.
    """
    print(f"[API] Recebida solicitação para iniciar câmera: {req.url}")
    with frames_lock:
        if req.url in cameras_data and cameras_data[req.url].get("status") == "running":
            raise HTTPException(status_code=400, detail="A detecção para esta câmera já está em execução.")

    t = threading.Thread(target=process_camera, args=(req.url, req.conf), daemon=True)
    t.start()
    
    # Codifica a URL da câmera para ser usada na URL do stream
    encoded_url = urllib.parse.quote_plus(req.url)
    
    resposta = {
        "status": "started",
        "camera_url": req.url,
        "stream_url": f"/video/stream?camera_url={encoded_url}"
    }
    print(f"[API] Resposta enviada ao frontend: {resposta}")
    return resposta

@app.post("/start_cameras/", summary="Inicia a detecção em múltiplas câmeras", dependencies=[Depends(verify_jwt)])
def start_cameras(req: StartCamerasRequest):
    """
    Inicia threads para processar múltiplas câmeras enviadas pelo frontend.
    """
    started = []
    already_running = []
    for ip in req.camera_ips:
        with frames_lock:
            if ip in cameras_data and cameras_data[ip].get("status") == "running":
                already_running.append(ip)
                continue
        t = threading.Thread(target=process_camera, args=(ip, 0.5), daemon=True)
        t.start()
        started.append(ip)
    return {
        "started": started,
        "already_running": already_running,
        "message": f"{len(started)} câmeras iniciadas, {len(already_running)} já estavam em execução."
    }

@app.get("/video/stream", summary="Fornece o stream de vídeo de uma câmera")
def video_stream(camera_url: str = Query(...)):
    """
    Gera um stream de vídeo multipart para a câmera especificada.
    Usa a URL da câmera como identificador único.
    """
    decoded_url = urllib.parse.unquote_plus(camera_url)

    def gen():
        while True:
            with frames_lock:
                cam_data = cameras_data.get(decoded_url)

            if not cam_data or cam_data["frame"] is None:
                # Se a câmera não for encontrada ou o frame for nulo, encerra o stream.
                break

            # Codifica o frame para JPEG
            (flag, encodedImage) = cv2.imencode(".jpg", cam_data["frame"])
            if not flag:
                continue

            # Produz o frame para o stream
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + bytearray(encodedImage) + b'\r\n')
            time.sleep(0.1) # Limita a taxa de frames

    return StreamingResponse(gen(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/faces_count", summary="Contagem de faces por câmera", dependencies=[Depends(verify_jwt)])
def faces_count(ip: str = Query(..., alias="camera_url")):
    """
    Retorna a contagem de faces para uma câmera específica de forma eficiente.
    Não reprocessa a imagem, apenas lê o valor salvo.
    """
    with frames_lock:
        cam_data = cameras_data.get(ip)
    
    if not cam_data:
        return {"ip": ip, "count": 0, "status": "not_found"}
    
    return {"ip": ip, "count": cam_data["face_count"], "status": cam_data["status"]}

@app.get("/faces_count_all", summary="Contagem de faces em todas as câmeras", dependencies=[Depends(verify_jwt)])
def faces_count_all():
    """
    Retorna uma lista com a contagem de faces de todas as câmeras ativas.
    """
    resposta = []
    with frames_lock:
        if not cameras_data:
            return []
        # Cria uma cópia para iterar com segurança
        active_cameras = list(cameras_data.items())
    
    for ip, data in active_cameras:
        resposta.append({"ip": ip, "count": data.get("face_count", 0)})
        
    return resposta