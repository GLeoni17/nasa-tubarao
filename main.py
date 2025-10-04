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
        chart_values = [27.5, 29.1, 28.4, 26.8]
        chart_dataset_label = "Temperatura (°C)"
        
        # --- LÓGICA DE TEXTO APRIMORADA PARA TEMPERATURA ---
        avg_temp = round(sum(chart_values) / len(chart_values), 1)
        min_temp = min(chart_values)
        max_temp = max(chart_values)
        
        insight = ""
        if avg_temp > 28:
            insight = "Condições de águas quentes, ideais para a atividade de espécies tropicais."
        elif max_temp - min_temp > 2:
            insight = "Variação térmica significativa ao longo do dia, o que pode influenciar o comportamento dos predadores."
        else:
            insight = "Temperatura da água estável, condições consistentes para a vida marinha."

        text_content = (
            f"🌡️ <strong>Resumo Térmico do Dia:</strong><br>"
            f"Média: <strong>{avg_temp}°C</strong> | Mín: <strong>{min_temp}°C</strong> | Máx: <strong>{max_temp}°C</strong><br><br>"
            f"<em>{insight}</em>"
        )
        
        return {
            "chart_data": { "labels": chart_labels, "values": chart_values, "label": chart_dataset_label },
            "text_data": { "title": "Monitoramento de Temperatura", "content": text_content }
        }
    else: # Padrão é fitoplâncton
        chart_labels = ["Ponto A", "Ponto B", "Ponto C", "Ponto D", "Ponto E"]
        chart_values = [45, 62, 51, 75, 38]
        chart_dataset_label = "Concentração de Fitoplâncton (µg/L)"
        
        # --- LÓGICA DE TEXTO APRIMORADA PARA FITOPLÂNCTON ---
        max_value = max(chart_values)
        max_point_index = chart_values.index(max_value)
        max_point_label = f"Ponto {chr(65 + max_point_index)}"
        
        insight = ""
        if max_value > 70:
            insight = "Forte indicativo de uma rica cadeia alimentar, atraindo cardumes e, consequentemente, seus predadores. 🐠"
        else:
            insight = "Níveis de biomassa moderados, sugerindo atividade normal para a região."

        text_content = (
            f"🌿 <strong>Análise de Biomassa:</strong><br>"
            f"Pico de concentração detectado no <strong>{max_point_label}</strong> com um valor de <strong>{max_value} µg/L</strong>.<br><br>"
            f"<em>{insight}</em>"
        )

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
        {
            "id": "FN-001",
            "name": "Tubarão 1",
            "species": "Tubarão-Tigre",
            "size": "3.8m",
            "life_stage": "Adulto",
            "tag_date": "2024-02-15",
            "tag_location": "Baía do Sueste, Fernando de Noronha",
            "lat": -3.875,
            "lng": -32.441,
            "description": "Avistamento recorrente na Baía do Sueste, padrão de caça noturno observado."
        },
        {
            "id": "FN-002",
            "name": "Tubarão 2",
            "species": "Tubarão-Lixa",
            "size": "2.5m",
            "life_stage": "Adulto",
            "tag_date": "2023-11-20",
            "tag_location": "Laje Dois Irmãos, Fernando de Noronha",
            "lat": -3.880,
            "lng": -32.445,
            "description": "Observado em grupo durante mergulho. Comportamento dócil."
        },
        {
            "id": "FN-003",
            "name": "Tubarão 3",
            "species": "Tubarão-Martelo",
            "size": "3.1m",
            "life_stage": "Subadulto",
            "tag_date": "2024-05-10",
            "tag_location": "Mar de Fora, Fernando de Noronha",
            "lat": -3.859,
            "lng": -32.460,
            "description": "Grupo pequeno avistado em mar aberto a oeste da ilha."
        },
        {
            "id": "FN-004",
            "name": "Tubarão 4",
            "species": "Tubarão-de-Recife",
            "size": "1.6m",
            "life_stage": "Adulto",
            "tag_date": "2024-01-05",
            "tag_location": "Baía dos Golfinhos, Fernando de Noronha",
            "lat": -3.831,
            "lng": -32.412,
            "description": "Patrulhando a área dos recifes, comportamento territorial."
        },
        {
            "id": "FN-005",
            "name": "Tubarão 5",
            "species": "Tubarão-Baleia",
            "size": "8.0m",
            "life_stage": "Jovem",
            "tag_date": "2024-08-22",
            "tag_location": "Costa Nordeste de Fernando de Noronha",
            "lat": -3.790,
            "lng": -32.380,
            "description": "Avistamento sazonal raro. Rota migratória monitorada."
        },
        {
            "id": "FN-006",
            "name": "Tubarão 6",
            "species": "Tubarão-Limão",
            "size": "2.8m",
            "life_stage": "Adulto",
            "tag_date": "2023-09-14",
            "tag_location": "Cacimba do Padre, Fernando de Noronha",
            "lat": -3.840,
            "lng": -32.429,
            "description": "Dois adultos avistados próximos à Cacimba do Padre."
        },
        {
            "id": "FN-007",
            "name": "Tubarão 7",
            "species": "Tubarão-de-pontas-brancas-de-recife",
            "size": "1.5m",
            "life_stage": "Adulto",
            "tag_date": "2024-04-18",
            "tag_location": "Morro de Fora, Fernando de Noronha",
            "lat": -3.835,
            "lng": -32.405,
            "description": "Indivíduo solitário observado durante a noite."
        },
        {
            "id": "FN-008",
            "name": "Tubarão 8",
            "species": "Tubarão-Tigre",
            "size": "4.2m",
            "life_stage": "Fêmea Adulta",
            "tag_date": "2022-12-01",
            "tag_location": "Proximidades do Morro Dois Irmãos",
            "lat": -3.838,
            "lng": -32.448,
            "description": "Tag de satélite de longa duração. Vasta área de deslocamento."
        },
        {
            "id": "FN-009",
            "name": "Tubarão 9",
            "species": "Tubarão-Martelo",
            "size": "4.5m",
            "life_stage": "Adulto",
            "tag_date": "2024-07-30",
            "tag_location": "Águas profundas ao Sul da ilha",
            "lat": -3.901,
            "lng": -32.455,
            "description": "Sinal de sonar de um grande indivíduo. Não houve contato visual."
        }
    ]
    return shark_sightings