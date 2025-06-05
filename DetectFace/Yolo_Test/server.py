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

app = FastAPI()

# Carrega o modelo uma vez
MODEL_PATH = '/home/gabriel/PI6DSM/DetectFace/Yolo_Test/best.pt'
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

# Rota para iniciar detecção em uma nova câmera
class CameraRequest(BaseModel):
    url: str
    conf: float = 0.5

@app.post("/start_camera/")
def start_camera(req: CameraRequest, request: Request = Depends(verify_jwt)):
    t = threading.Thread(target=process_camera, args=(req.url, req.conf), daemon=True)
    t.start()
    # Gera um índice para a câmera recém-adicionada
    with frames_lock:
        keys = list(frames_cameras.keys())
        idx = keys.index(req.url) if req.url in keys else len(keys)
    return {
        "status": "started",
        "camera": req.url,
        "stream_url": f"/stream/video/{idx}"
    }

@app.get("/")
def root():
    return {"status": "ok", "msg": "API de detecção facial pronta para múltiplas câmeras!"}

@app.on_event("startup")
def start_monitoramento():
    t = threading.Thread(target=mostrar_todas_cameras, daemon=True)
    t.start()

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

class StartCamerasRequest(BaseModel):
    camera_ips: List[str]

@app.post("/start_cameras/")
def start_cameras(req: StartCamerasRequest, request: Request = Depends(verify_jwt)):
    streams = []
    for idx, ip in enumerate(req.camera_ips):
        t = threading.Thread(target=process_camera, args=(ip, 0.5), daemon=True)
        t.start()
        streams.append(f"/stream/video/{idx}")
    return {"streams": streams}

from fastapi.responses import StreamingResponse

@app.get("/stream/video/{idx}")
def video_stream(idx: int, request: Request = Depends(verify_jwt)):
    # Aqui você pode mapear o idx para o IP real (exemplo simplificado)
    # Para produção, use um dicionário global para mapear idx -> IP
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
