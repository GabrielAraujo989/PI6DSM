from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from concurrent.futures import ThreadPoolExecutor
import ipaddress
import socket

app = FastAPI()

# ✅ CORS: liberar todas as origens (inclusive 8081, 19006, etc)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, troque por lista segura
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    network: str  # Ex: "10.0.1.0/24"
    port: int = 80  # Porta padrão

def verificar_host(ip, port):
    try:
        with socket.create_connection((str(ip), port), timeout=1):
            return str(ip)
    except:
        return None

@app.post("/scan")
def scan_rede(request: ScanRequest):
    try:
        rede = ipaddress.ip_network(request.network, strict=False)
    except ValueError:
        raise HTTPException(status_code=400, detail="Faixa de IP inválida.")

    ips = list(rede.hosts())
    ativos = []

    with ThreadPoolExecutor(max_workers=100) as executor:
        resultados = executor.map(lambda ip: verificar_host(ip, request.port), ips)
        ativos = [ip for ip in resultados if ip]

    return {"ativos": ativos, "total": len(ativos)}
