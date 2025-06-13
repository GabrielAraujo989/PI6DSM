# server.py - API para detecção facial em múltiplas câmeras
from fastapi import FastAPI, Query, Request, HTTPException, Depends
from pydantic import BaseModel
import threading
import cv2
from ultralytics import YOLO
import torch
import time
import numpy as np
import jwt
from typing import List
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, Response
from fastapi.requests import Request as FastAPIRequest

app = FastAPI()

# CORS irrestrito: permite qualquer origem, sem credenciais
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Não pode ser True com allow_origins=['*']
    allow_methods=["*"],
    allow_headers=["*"],
)

# Carrega o modelo uma vez
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'best.pt')
device = 'cuda' if torch.cuda.is_available() else 'cpu'
modelo = YOLO(MODEL_PATH).to(device)

# Dicionário global para armazenar o último frame de cada câmera
frames_cameras = {}
frames_lock = threading.Lock()

# Thread para exibir todos os frames juntos

def mostrar_todas_cameras():
    while True:
        with frames_lock:
            if frames_cameras:
                # Redimensiona e empilha os frames horizontalmente
                frames = [cv2.resize(f, (400, 300)) for f in frames_cameras.values() if f is not None]
                if frames:
                    painel = np.hstack(frames) if len(frames) > 1 else frames[0]
                    cv2.imshow('Monitoramento', painel)
        if cv2.waitKey(1) & 0xFF in [ord('q'), 27]:
            cv2.destroyAllWindows()
            break
        time.sleep(0.05)

# Função para processar uma câmera

def process_camera(source_url, conf=0.5):
    cap = cv2.VideoCapture(source_url)
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        resultados = modelo.predict(source=frame, conf=conf, device=device, verbose=False, stream=True)
        for resultado in resultados:
            faces = resultado.boxes.xyxy.cpu().numpy() if hasattr(resultado.boxes, 'xyxy') else []
            num_faces = len(faces)
            frame_processado = resultado.plot()
            cv2.putText(frame_processado, f"Rostos detectados: {num_faces}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (255,0,0), 2)
            with frames_lock:
                frames_cameras[source_url] = frame_processado.copy()
            print(f"[{source_url}] Rostos detectados: {num_faces}")
        time.sleep(0.1)
    cap.release()
    with frames_lock:
        frames_cameras[source_url] = None

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "SUA_SECRET_KEY")

# Função para verificar JWT

def verify_jwt(request: Request):
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token ausente")
    token = auth.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")

# Rota para iniciar detecção em uma nova câmera
class CameraRequest(BaseModel):
    url: str
    conf: float = 0.5

@app.post("/start_camera/")
def start_camera(req: CameraRequest, payload=Depends(verify_jwt)):
    print(f"[DETECTFACE] Solicitação recebida para iniciar câmera: {req.url}")
    # Garante que a thread não será duplicada para o mesmo IP
    if req.url not in frames_cameras:
        t = threading.Thread(target=process_camera, args=(req.url, req.conf), daemon=True)
        t.start()
    # Gera um índice para a câmera recém-adicionada
    with frames_lock:
        keys = list(frames_cameras.keys())
        idx = keys.index(req.url) if req.url in keys else len(keys)
    resposta = {
        "status": "started",
        "camera": req.url,
        "stream_url": f"/stream/video/{idx}",
        "ip": req.url
    }
    print(f"[DETECTFACE] Resposta enviada ao frontend: {resposta}")
    return resposta

@app.get("/")
def root():
    return {"status": "ok", "msg": "API de detecção facial pronta para múltiplas câmeras!"}

@app.on_event("startup")
def start_monitoramento():
    t = threading.Thread(target=mostrar_todas_cameras, daemon=True)
    t.start()

class StartCamerasRequest(BaseModel):
    camera_ips: List[str]

@app.post("/start_cameras/")
def start_cameras(req: StartCamerasRequest, payload=Depends(verify_jwt)):
    streams = []
    for idx, ip in enumerate(req.camera_ips):
        t = threading.Thread(target=process_camera, args=(ip, 0.5), daemon=True)
        t.start()
        streams.append(f"/stream/video/{idx}")
    return {"streams": streams}

@app.get("/stream/video/{idx}")
def video_stream(idx: int, payload=Depends(verify_jwt)):
    # Aqui você pode mapear o idx para o IP real (exemplo simplificado)
    ips = list(frames_cameras.keys())
    if idx >= len(ips):
        raise HTTPException(status_code=404, detail="Câmera não encontrada")
    ip = ips[idx]
    def gen():
        while True:
            with frames_lock:
                frame = frames_cameras.get(ip)
            if frame is None:
                break
            _, buffer = cv2.imencode('.jpg', frame)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            time.sleep(0.1)
    return StreamingResponse(gen(), media_type="multipart/x-mixed-replace; boundary=frame")

# Novo endpoint para contagem de faces por IP

@app.get("/faces_count")
def faces_count(ip: str, payload=Depends(verify_jwt)):
    with frames_lock:
        frame = frames_cameras.get(ip)
    if frame is None:
        return {"count": 0}
    resultados = modelo.predict(source=frame, conf=0.5, device=device, verbose=False, stream=True)
    for resultado in resultados:
        faces = resultado.boxes.xyxy.cpu().numpy() if hasattr(resultado.boxes, 'xyxy') else []
        return {"count": len(faces)}
    return {"count": 0}

@app.get("/faces_count_all")
def faces_count_all(payload=Depends(verify_jwt)):
    resposta = []
    with frames_lock:
        for ip, frame in frames_cameras.items():
            if frame is None:
                resposta.append({"ip": ip, "count": 0})
                continue
            resultados = modelo.predict(source=frame, conf=0.5, device=device, verbose=False, stream=True)
            for resultado in resultados:
                faces = resultado.boxes.xyxy.cpu().numpy() if hasattr(resultado.boxes, 'xyxy') else []
                resposta.append({"ip": ip, "count": len(faces)})
                break
            else:
                resposta.append({"ip": ip, "count": 0})
    return resposta
