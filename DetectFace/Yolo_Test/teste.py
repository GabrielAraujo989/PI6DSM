import cv2
from ultralytics import YOLO
import torch

# Configuração CUDA
device = 'cuda' if torch.cuda.is_available() else 'cpu'

# Carrega o modelo na GPU
# modelo = YOLO('yolo11s.pt').to(device)
modelo = YOLO('/home/gabriel/Área de trabalho/Teste/testeyolo/Model/treinar_yolov8-main/runs/detect/train9/weights/best.pt').to(device)

# Configurações
confianca_minima = 0.5
largura_webcam = 1280  # Ajuste conforme sua webcam
altura_webcam = 720

# Inicializa webcam
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, largura_webcam)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, altura_webcam)

try:
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Usa o gerador corretamente
        resultados = modelo.predict(
            source=frame,
            conf=confianca_minima,
            device=device,
            verbose=False,
            stream=True
        )

        # Itera sobre os resultados do gerador
        for resultado in resultados:
            frame_processado = resultado.plot()
            cv2.imshow('YOLOv11s RTX 3050', frame_processado)

        if cv2.waitKey(1) & 0xFF in [ord('q'), 27]:
            break

finally:
    cap.release()
    cv2.destroyAllWindows()