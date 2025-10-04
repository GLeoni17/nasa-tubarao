from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
from typing import Optional

app = FastAPI()

# Configuração para permitir que o frontend acesse o backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint que fornece dados para o GRÁFICO e TEXTO
@app.get("/api/data")
async def get_data(dataType: Optional[str] = "fitoplankton"):
    if dataType == "temperatura":
        chart_labels = ["Manhã", "Meio-dia", "Tarde", "Noite"]
        # --- DADOS DE TEMPERATURA AGORA SÃO FIXOS ---
        chart_values = [27.5, 29.1, 28.4, 26.8]
        chart_dataset_label = "Temperatura (°C)"
        text_content = f"Análise de temperatura na área: A média registrada foi de {round(sum(chart_values) / len(chart_values), 1)}°C."
        return {
            "chart_data": { "labels": chart_labels, "values": chart_values, "label": chart_dataset_label },
            "text_data": { "title": "Monitoramento Costeiro", "content": text_content }
        }
    else: # Padrão é fitoplâncton
        chart_labels = ["Ponto A", "Ponto B", "Ponto C", "Ponto D", "Ponto E"]
        # --- DADOS DE FITOPLÂNCTON AGORA SÃO FIXOS ---
        chart_values = [45, 62, 51, 75, 38]
        chart_dataset_label = "Concentração de Fitoplâncton (µg/L)"
        text_content = f"Análise de biomassa marinha: O ponto de maior concentração foi o Ponto {chr(65 + chart_values.index(max(chart_values)))}."
        
        # --- COORDENADAS DAS ÁREAS AGORA SÃO FIXAS ---
        area_points = [
            {"label": "Área A", "lat": -3.831, "lng": -32.412},
            {"label": "Área B", "lat": -3.840, "lng": -32.429},
            {"label": "Área C", "lat": -3.860, "lng": -32.454},
            {"label": "Área D", "lat": -3.875, "lng": -32.441},
            {"label": "Área E", "lat": -3.880, "lng": -32.415}
        ]

        return {
            "chart_data": { "labels": chart_labels, "values": chart_values, "label": chart_dataset_label },
            "text_data": { "title": "Monitoramento de Fitoplâncton", "content": text_content },
            "area_points": area_points
        }

# Endpoint que fornece os MARCADORES para o MAPA
@app.get("/api/map-points")
async def get_map_points():
    shark_sightings = [
        {"name": "Avistamento de Tubarão-Tigre", "lat": -3.875, "lng": -32.441, "description": "Adulto, avistado na Baía do Sueste."},
        {"name": "Avistamento de Tubarão-Lixa", "lat": -3.880, "lng": -32.445, "description": "Vários indivíduos em repouso, observados em mergulho."},
        {"name": "Avistamento de Tubarão-Martelo", "lat": -3.859, "lng": -32.460, "description": "Grupo pequeno avistado em mar aberto a oeste da ilha."},
        {"name": "Avistamento de Tubarão-de-Recife", "lat": -3.831, "lng": -32.412, "description": "Patrulhando a área dos recifes na Baía dos Golfinhos."},
        {"name": "Avistamento de Tubarão-Baleia", "lat": -3.790, "lng": -32.380, "description": "Raro avistamento sazonal a nordeste da ilha principal."},
        {"name": "Avistamento de Tubarão-Limão", "lat": -3.840, "lng": -32.429, "description": "Dois adultos avistados próximos à Cacimba do Padre."},
        {"name": "Avistamento de Tubarão-de-pontas-brancas-de-recife", "lat": -3.835, "lng": -32.405, "description": "Indivíduo solitário observado no Morro de Fora."},
        {"name": "Avistamento de Tubarão-Tigre", "lat": -3.838, "lng": -32.448, "description": "Fêmea, detectada por tag de satélite perto do Morro Dois Irmãos."},
        {"name": "Avistamento de Tubarão-Martelo", "lat": -3.901, "lng": -32.455, "description": "Sinal de sonar de um grande indivíduo em águas profundas ao sul."}
    ]
    return shark_sightings