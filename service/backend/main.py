from fastapi import FastAPI, Response, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cv2

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"status": "Servidor de câmeras rodando 🚀"}


@app.get("/video_feed")
def video_feed(ip: str = Query(..., description="IP da câmera no formato ip:porta ou apenas ip")):
    def generate_frames(ip_address):
        # 🔐 Substitua aqui pelo usuário e senha corretos da sua câmera
        url = f"http://admin:senha@{ip_address}"

        cap = cv2.VideoCapture(url)

        if not cap.isOpened():
            print(f"❌ Não foi possível abrir a câmera {ip_address}")
            raise HTTPException(status_code=404, detail=f"Não foi possível acessar a câmera {ip_address}")

        while True:
            success, frame = cap.read()
            if not success:
                print("❌ Falha ao capturar frame")
                break

            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                print("❌ Falha ao codificar frame")
                continue

            frame_bytes = buffer.tobytes()

            yield (
                b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n'
            )

        cap.release()

    return Response(
        generate_frames(ip),
        media_type='multipart/x-mixed-replace; boundary=frame'
    )
