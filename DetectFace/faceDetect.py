import cv2
from ultralytics import YOLO
import torch

# Configuração CUDA
device = 'cuda' if torch.cuda.is_available() else 'cpu'

# Carrega o modelo na GPU
# modelo = YOLO('yolo11s.pt').to(device)
modelo = YOLO('/home/gabriel/PI6DSM/DetectFace/best.pt').to(device)

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

        resultados = modelo.predict(
            source=frame,
            conf=confianca_minima,
            device=device,
            verbose=False,
            stream=True
        )

        for resultado in resultados:
            frame_processado = resultado.plot()
            # Adiciona numeração e contabiliza faces
            faces = resultado.boxes.xyxy.cpu().numpy() if hasattr(resultado.boxes, 'xyxy') else []
            num_faces = len(faces)
            for idx, box in enumerate(faces):
                x1, y1, x2, y2 = map(int, box[:4])
                # Desenha número na parte inferior da box, centralizado
                centro_x = int((x1 + x2) / 2)
                y_inferior = y2 + 30 if y2 + 30 < frame_processado.shape[0] else frame_processado.shape[0] - 10
                cv2.putText(frame_processado, f"#{idx+1}", (centro_x - 20, y_inferior), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)
            # Exibe contador na parte inferior da tela
            altura = frame_processado.shape[0]
            cv2.putText(frame_processado, f"Rostos na tela: {num_faces}", (20, altura - 20), cv2.FONT_HERSHEY_SIMPLEX, 1, (255,0,0), 2)
            cv2.imshow('YOLOv11s RTX 3050', frame_processado)

        if cv2.waitKey(1) & 0xFF in [ord('q'), 27]:
            break

finally:
    cap.release()
    cv2.destroyAllWindows()