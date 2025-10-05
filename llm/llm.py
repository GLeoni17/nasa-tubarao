from huggingface_hub import InferenceClient
import pandas as pd

# dados fictícios de 1 tubarão
# sensor + satélites NASA + forecasting
data = pd.DataFrame([{
    'shark_id': 1,
    'lat': -15.2,
    'lon': 120.5,
    'depth': 10,
    'speed': 2.5,
    'sea_surface_temp': 26.5,
    'chlorophyll': 1.8,
    'feeding_prob': 0.78
}])

client = InferenceClient()

MODEL_NAME = "deepseek-ai/DeepSeek-V3-0324"

# gerar texto educativo resumido
def generate_educational_text(row):
    completion = client.chat.completions.create(
    model="deepseek-ai/DeepSeek-V3-0324",
    messages=[
        {
            "role": "user",
            "content": f"Você é um educador de biologia marinha. Resuma em 3-4 frases para o público geral os hábitos de caça de um tubarão "
            f"com os seguintes dados: profundidade {row['depth']} m, velocidade {row['speed']} m/s, "
            f"temperatura da água {row['sea_surface_temp']}°C, clorofila {row['chlorophyll']} mg/m³, "
            f"probabilidade de alimentação {row['feeding_prob']:.2f}."
        }
    ],
)
    return completion.choices[0].message

sample_text = generate_educational_text(data.iloc[0])
print(sample_text)