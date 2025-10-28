import re
import joblib
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from gensim.models import Word2Vec

# Этот файл содержит всю логику для предсказания длительности отключений.
# Он загружает обученные модели и все необходимые для работы артефакты.

# Константы и маппинги, определенные при обучении
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Маппинги ваще автоматизировать все по хорошему, но мне чет лень, поэтому часть - хардкод

type_mapping = {
    "electricity": 1,
    "cold_water": 2,
    "hot_water": 3,
    "heat": 4,
}

weather_type_mapping = {
    "малооблачно без осадков": 1, "малооблачно гроза": 2, "малооблачно осадки": 3,
    "малооблачно сильный снег": 4, "малооблачно сильный туман": 5, "малооблачно слабый дождь": 6,
    "малооблачно слабый снег": 7, "малооблачно слабый туман": 8, "малооблачно снег": 9,
    "малооблачно туман": 10, "облачно без осадков": 11, "облачно гроза": 12,
    "облачно дождь": 13, "облачно сильный дождь": 14, "облачно сильный туман": 15,
    "облачно слабые осадки": 16, "облачно слабый дождь": 17, "облачно слабый снег": 18,
    "облачно слабый туман": 19, "облачно снег": 20, "пасмурно без осадков": 21,
    "пасмурно гроза": 22, "пасмурно дождь": 23, "пасмурно сильный дождь": 24,
    "пасмурно сильный снег": 25, "пасмурно сильный туман": 26, "пасмурно слабые осадки": 27,
    "пасмурно слабый дождь": 28, "пасмурно слабый снег": 29, "пасмурно слабый туман": 30,
    "пасмурно снег": 31, "ясно без осадков": 32
}

city_mapping = {"Владивосток": 1, "Артем": 2}

russian_alphabet = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя"
letter_mapping = {letter: i + 1 for i, letter in enumerate(russian_alphabet)}

TYPE_CONFIGS = {
    "electricity": {
        "model_path": "nn/improved_duration_predictor_electricity.pth",
        "scaler_path": "nn/duration_scaler_electricity.joblib",
    },
    "cold_water": {
        "model_path": "nn/improved_duration_predictor_cold_water.pth",
        "scaler_path": "nn/duration_scaler_cold_water.joblib",
    },
    "heat": {
        "model_path": "nn/improved_duration_predictor_heat.pth",
        "scaler_path": "nn/duration_scaler_heat.joblib",
    },
}

# Определение архитектуры модели (должно быть идентично тому, что при обучении)
class ResidualBlock(nn.Module):
    def __init__(self, layers):
        super(ResidualBlock, self).__init__()
        self.layers = layers

    def forward(self, x):
        return x + self.layers(x)

class ImprovedDurationPredictor(nn.Module):
    def __init__(self, input_dim, hidden_dims=[256, 256, 128, 128, 64, 32], dropout_rate=0.4):
        super(ImprovedDurationPredictor, self).__init__()
        layers = []
        prev_dim = input_dim
        for i, hidden_dim in enumerate(hidden_dims):
            block_layers = [
                nn.Linear(prev_dim, hidden_dim),
                nn.BatchNorm1d(hidden_dim),
                nn.LeakyReLU(0.1),
                nn.Dropout(dropout_rate),
            ]
            if i > 0 and prev_dim == hidden_dim:
                layers.append(ResidualBlock(nn.Sequential(*block_layers)))
            else:
                layers.extend(block_layers)
            prev_dim = hidden_dim
        self.feature_extractor = nn.Sequential(*layers)
        self.output_layer = nn.Sequential(
            nn.Linear(prev_dim, 1),
            nn.Softplus()
        )

    def forward(self, x):
        features = self.feature_extractor(x)
        return self.output_layer(features)

# Загрузка артефактов
# В реальном бэкенде это нужно делать один раз при старте приложения
try:
    street_mapping_loaded = joblib.load('nn/street_mapping.joblib')
    district_mapping_loaded = joblib.load('nn/district_mapping.joblib')
    w2v_model_loaded = Word2Vec.load("nn/word2vec.model")
    FEATURE_COLS = joblib.load('nn/feature_cols.joblib')

    inference_artifacts = {}
    for type_name, config in TYPE_CONFIGS.items():
        try:
            model = ImprovedDurationPredictor(input_dim=len(FEATURE_COLS))
            checkpoint = torch.load(config["model_path"], map_location=DEVICE)
            model.load_state_dict(checkpoint['model_state_dict'])
            model.to(DEVICE)
            model.eval()
            scaler = joblib.load(config["scaler_path"])
            inference_artifacts[type_name] = {"model": model, "scaler": scaler}
            print(f"Артефакты для '{type_name}' успешно загружены.")
        except FileNotFoundError:
            print(f"Предупреждение: Файлы для '{type_name}' не найдены. Предсказания для этого типа будут недоступны.")
except FileNotFoundError as e:
    print(f"Критическая ошибка: Не удалось загрузить основной артефакт модели: {e}. Функция предсказания будет неработоспособна.")
    inference_artifacts = None


# Основная функция предсказания
def predict_duration(input_data: dict):
    """
    Предсказывает длительность отключения на основе входных данных.
    """
    if inference_artifacts is None:
        print("Ошибка: Сервис предсказаний не инициализирован из-за отсутствия файлов модели.")
        return None

    blackout_type = input_data.get("type")
    if not blackout_type or blackout_type not in inference_artifacts:
        print(f"Ошибка: Неверный или неподдерживаемый тип отключения: {blackout_type}")
        return None

    artifacts = inference_artifacts[blackout_type]
    model = artifacts["model"]
    scaler = artifacts["scaler"]

    df = pd.DataFrame([input_data])
    df["start_date"] = pd.to_datetime(df["start_date"])
    df['start_month'] = df['start_date'].dt.month
    df['start_dayofweek'] = df['start_date'].dt.dayofweek
    df['start_hour'] = df['start_date'].dt.hour

    tokenized_description = re.findall(r'\b\w+\b', df['description'].iloc[0].lower())
    
    def description_to_vector(description_tokens, model):
        vectors = [model.wv[word] for word in description_tokens if word in model.wv]
        if not vectors:
            return np.zeros(model.vector_size)
        return np.mean(vectors, axis=0)

    description_vector = description_to_vector(tokenized_description, w2v_model_loaded)
    desc_vec_df = pd.DataFrame([description_vector], columns=[f"desc_vec_{i}" for i in range(w2v_model_loaded.vector_size)])
    
    df = pd.concat([df.reset_index(drop=True), desc_vec_df], axis=1)
    df = df.drop(columns=["description"])

    df["house_number_letter"] = df["house_number"].str.extract(r"(\D+)", expand=False).str.lower().fillna("").apply(lambda x: letter_mapping.get(x, -1))
    df["house_number"] = df["house_number"].str.extract(r"(\d+)").astype(float)

    df["type"] = df["type"].map(type_mapping)
    df["weather_description"] = df["weather_description"].map(weather_type_mapping)
    df["city"] = df["city"].map(city_mapping)
    df["street"] = df["street"].map(street_mapping_loaded)
    df["district"] = df["district"].map(district_mapping_loaded)

    X = df[FEATURE_COLS]
    X.fillna(-1, inplace=True)

    X_scaled = scaler.transform(X)
    X_tensor = torch.FloatTensor(X_scaled).to(DEVICE)

    with torch.no_grad():
        prediction = model(X_tensor)

    return prediction.cpu().item()

# Пример использования (выполняется, если запустить файл напрямую)
if __name__ == "__main__":
    if inference_artifacts:
        sample_input = {
            "start_date": "2025-10-28 14:30:00",
            "description": "аварийные работы на линии",
            "type": "electricity",
            "city": "Владивосток",
            "street": "Алеутская",
            "house_number": "25",
            "district": "Фрунзенский",
            "temp_max": 12.0,
            "temp_min": 8.0,
            "weather_description": "пасмурно слабый дождь"
        }

        predicted_hours = predict_duration(sample_input)

        if predicted_hours is not None:
            print(f"\nПример предсказания для типа '{sample_input['type']}':")
            print(f"Предсказанная длительность отключения: {predicted_hours:.2f} часов")

        sample_input_water = {
            "start_date": "2025-11-10 09:00:00",
            "description": "замена участка трубы",
            "type": "cold_water",
            "city": "Владивосток",
            "street": "Океанский проспект",
            "house_number": "101",
            "district": "Первореченский",
            "temp_max": 5.0,
            "temp_min": -1.0,
            "weather_description": "ясно без осадков"
        }
        predicted_hours_water = predict_duration(sample_input_water)
        if predicted_hours_water is not None:
            print(f"\nПример предсказания для типа '{sample_input_water['type']}':")
            print(f"Предсказанная длительность отключения: {predicted_hours_water:.2f} часов")
    else:
        print("\nПредсказания не могут быть выполнены, так как модели не были загружены.")
