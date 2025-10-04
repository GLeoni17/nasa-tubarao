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
        chart_values = [round(random.uniform(22.0, 29.5), 1) for _ in range(len(chart_labels))]
        chart_dataset_label = "Temperatura (°C)"
        text_content = f"Análise de temperatura na orla: A média registrada foi de {round(sum(chart_values) / len(chart_values), 1)}°C."
    else: # Padrão é fitoplâncton
        chart_labels = ["Ponto A", "Ponto B", "Ponto C", "Ponto D", "Ponto E"]
        chart_values = [random.randint(10, 80) for _ in range(len(chart_labels))]
        chart_dataset_label = "Concentração de Fitoplâncton (µg/L)"
        text_content = f"Análise de biomassa marinha: O ponto de maior concentração foi o Ponto {chr(65 + chart_values.index(max(chart_values)))}."
    
    return {
        "chart_data": { "labels": chart_labels, "values": chart_values, "label": chart_dataset_label },
        "text_data": { "title": "Monitoramento Costeiro", "content": text_content }
    }

# Endpoint que fornece os MARCADORES para o MAPA
@app.get("/api/map-points")
async def get_map_points():
    # Usando os pontos de interesse de Santos, SP
    points_of_interest = [
        {
            "name": "Aquário Municipal de Santos",
            "lat": -23.9803,
            "lng": -46.3039,
            "description": "Um dos pontos turísticos mais famosos da cidade."
        },
        {
            "name": "Orquidário Municipal",
            "lat": -23.9681,
            "lng": -46.3468,
            "description": "Parque zoobotânico com belos jardins e diversas espécies."
        },
        {
            "name": "Museu do Café",
            "lat": -23.9320,
            "lng": -46.3081,
            "description": "Localizado no centro histórico, conta a história do café no Brasil."
        }
    ]
    return points_of_interest