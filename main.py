from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
from typing import Optional

app = FastAPI()

# Configuration to allow the frontend to access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint that provides data for the CHART and TEXT
@app.get("/api/data")
async def get_data(dataType: Optional[str] = "phytoplankton"):
    if dataType == "temperature":
        chart_labels = ["Morning", "Noon", "Afternoon", "Night"]
        chart_values = [27.5, 29.1, 28.4, 26.8]
        chart_dataset_label = "Temperature (°C)"
        
        # --- ENHANCED TEXT LOGIC FOR TEMPERATURE ---
        avg_temp = round(sum(chart_values) / len(chart_values), 1)
        min_temp = min(chart_values)
        max_temp = max(chart_values)
        
        insight = ""
        if avg_temp > 28:
            insight = "Warm water conditions, ideal for the activity of tropical species."
        elif max_temp - min_temp > 2:
            insight = "Significant thermal variation throughout the day, which may influence predator behavior."
        else:
            insight = "Stable water temperature, consistent conditions for marine life."

        text_content = (
            f"🌡️ <strong>Daily Thermal Summary:</strong><br>"
            f"Average: <strong>{avg_temp}°C</strong> | Min: <strong>{min_temp}°C</strong> | Max: <strong>{max_temp}°C</strong><br><br>"
            f"<em>{insight}</em>"
        )
        
        return {
            "chart_data": { "labels": chart_labels, "values": chart_values, "label": chart_dataset_label },
            "text_data": { "title": "Temperature Monitoring", "content": text_content }
        }
    else: # Default is phytoplankton
        chart_labels = ["Point A", "Point B", "Point C", "Point D", "Point E"]
        chart_values = [45, 62, 51, 75, 38]
        chart_dataset_label = "Phytoplankton Concentration (µg/L)"
        
        # --- ENHANCED TEXT LOGIC FOR PHYTOPLANKTON ---
        max_value = max(chart_values)
        max_point_index = chart_values.index(max_value)
        max_point_label = f"Point {chr(65 + max_point_index)}"
        
        insight = ""
        if max_value > 70:
            insight = "Strong indication of a rich food chain, attracting schools of fish and, consequently, their predators. 🐠"
        else:
            insight = "Moderate biomass levels, suggesting normal activity for the region."

        text_content = (
            f"🌿 <strong>Biomass Analysis:</strong><br>"
            f"Peak concentration detected at <strong>{max_point_label}</strong> with a value of <strong>{max_value} µg/L</strong>.<br><br>"
            f"<em>{insight}</em>"
        )

        area_points = [
            {"label": "Area A", "lat": -3.831, "lng": -32.412},
            {"label": "Area B", "lat": -3.840, "lng": -32.429},
            {"label": "Area C", "lat": -3.860, "lng": -32.454},
            {"label": "Area D", "lat": -3.875, "lng": -32.441},
            {"label": "Area E", "lat": -3.880, "lng": -32.415}
        ]

        return {
            "chart_data": { "labels": chart_labels, "values": chart_values, "label": chart_dataset_label },
            "text_data": { "title": "Phytoplankton Monitoring", "content": text_content },
            "area_points": area_points
        }

# Endpoint that provides the MARKERS for the MAP
@app.get("/api/map-points")
async def get_map_points():
    shark_sightings = [
        {
            "id": "FN-001",
            "name": "Shark 1",
            "species": "Tiger Shark",
            "size": "3.8m",
            "life_stage": "Adult",
            "tag_date": "2024-02-15",
            "tag_location": "Baía do Sueste, Fernando de Noronha",
            "food": "Recent analysis indicated remains of bony fish and a sea turtle.",
            "lat": -3.875,
            "lng": -32.441,
            "description": "Recurring sighting in Baía do Sueste, nocturnal hunting pattern observed."
        },
        {
            "id": "FN-002",
            "name": "Shark 2",
            "species": "Nurse Shark",
            "size": "2.5m",
            "life_stage": "Adult",
            "tag_date": "2023-11-20",
            "tag_location": "Laje Dois Irmãos, Fernando de Noronha",
            "food": "Observed feeding on small crustaceans and mollusks on the seafloor.",
            "lat": -3.880,
            "lng": -32.445,
            "description": "Observed in a group during a dive. Gentle behavior."
        },
        {
            "id": "FN-003",
            "name": "Shark 3",
            "species": "Hammerhead Shark",
            "size": "3.1m",
            "life_stage": "Subadult",
            "tag_date": "2024-05-10",
            "tag_location": "Mar de Fora, Fernando de Noronha",
            "food": "Diet mainly composed of squids and small schooling fish.",
            "lat": -3.859,
            "lng": -32.460,
            "description": "Small group sighted in open sea west of the island."
        },
        {
            "id": "FN-004",
            "name": "Shark 4",
            "species": "Reef Shark",
            "size": "1.6m",
            "life_stage": "Adult",
            "tag_date": "2024-01-05",
            "tag_location": "Baía dos Golfinhos, Fernando de Noronha",
            "food": "Hunts reef fish such as wrasses and parrotfish.",
            "lat": -3.831,
            "lng": -32.412,
            "description": "Patrolling the reef area, territorial behavior."
        },
        {
            "id": "FN-005",
            "name": "Shark 5",
            "species": "Whale Shark",
            "size": "8.0m",
            "life_stage": "Young",
            "tag_date": "2024-08-22",
            "tag_location": "Northeast Coast of Fernando de Noronha",
            "food": "Filter feeding, consuming plankton and small schools of fish.",
            "lat": -3.790,
            "lng": -32.380,
            "description": "Rare seasonal sighting. Monitored migration route."
        },
        {
            "id": "FN-006",
            "name": "Shark 6",
            "species": "Lemon Shark",
            "size": "2.8m",
            "life_stage": "Adult",
            "tag_date": "2023-09-14",
            "tag_location": "Cacimba do Padre, Fernando de Noronha",
            "food": "Predation of bony fish and stingrays was recorded in the area.",
            "lat": -3.840,
            "lng": -32.429,
            "description": "Two adults sighted near Cacimba do Padre."
        },
        {
            "id": "FN-007",
            "name": "Shark 7",
            "species": "Reef White-tip Shark",
            "size": "1.5m",
            "life_stage": "Adult",
            "tag_date": "2024-04-18",
            "tag_location": "Morro de Fora, Fernando de Noronha",
            "food": "Nocturnal hunting of octopuses and fish hidden in reef cracks.",
            "lat": -3.835,
            "lng": -32.405,
            "description": "Lone individual observed at night."
        },
        {
            "id": "FN-008",
            "name": "Shark 8",
            "species": "Tiger Shark",
            "size": "4.2m",
            "life_stage": "Adult Female",
            "tag_date": "2022-12-01",
            "tag_location": "Near Morro Dois Irmãos",
            "food": "Signs of predation of a monk seal have been associated with this individual.",
            "lat": -3.838,
            "lng": -32.448,
            "description": "Long-duration satellite tag. Large movement area."
        },
        {
            "id": "FN-009",
            "name": "Shark 9",
            "species": "Hammerhead Shark",
            "size": "4.5m",
            "life_stage": "Adult",
            "tag_date": "2024-07-30",
            "tag_location": "Deep waters south of the island",
            "food": "Detected hunting sardine schools in deeper waters.",
            "lat": -3.901,
            "lng": -32.455,
            "description": "Sonar signal from a large individual. No visual contact."
        }
    ]
    return shark_sightings
