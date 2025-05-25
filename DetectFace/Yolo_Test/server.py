# server.py - API para detecção facial em múltiplas câmeras
from fastapi import FastAPI, Query
from pydantic import BaseModel
import threading
import cv2
from ultralytics import YOLO
import torch
import time
import numpy as np

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
def start_camera(req: CameraRequest):
    t = threading.Thread(target=process_camera, args=(req.url, req.conf), daemon=True)
    t.start()
    return {"status": "started", "camera": req.url}

@app.get("/")
def root():
    return {"status": "ok", "msg": "API de detecção facial pronta para múltiplas câmeras!"}

@app.on_event("startup")
def start_monitoramento():
    t = threading.Thread(target=mostrar_todas_cameras, daemon=True)
    t.start()
