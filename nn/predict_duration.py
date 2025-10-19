
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib.pyplot as plt
import os
import sqlite3
import joblib

# ============================================================================
# 1. ЗАГРУЗКА ДАННЫХ (аналогично clustering.py)
# ============================================================================

def load_data_from_db(db_path='d:/code/vlru/nn/dataset.db'):
    """Загрузка данных об отключениях из базы данных SQLite"""
    
    print(f"Подключение к базе данных: {db_path}")
    conn = sqlite3.connect(db_path)
    
    query = """
    SELECT
        b.start_date,
        b.end_date,
        b.description,
        b.type,
        (c.name || ', ' || s.name || ', ' || bu.number) as address
    FROM blackouts b
    JOIN blackouts_buildings bb ON b.id = bb.blackout_id
    JOIN buildings bu ON bb.building_id = bu.id
    JOIN streets s ON bu.street_id = s.id
    JOIN cities c ON bu.city_id = c.id
    """
    
    print("Выполнение SQL-запроса для извлечения данных...")
    df = pd.read_sql_query(query, conn)
    conn.close()
    
    print(f"Загружено {len(df)} записей из базы данных.")
    
    df['start_date'] = pd.to_datetime(df['start_date'])
    df['end_date'] = pd.to_datetime(df['end_date'])
    
    type_mapping = {
        'electricity': 'электричество',
        'cold_water': 'холодная вода',
        'hot_water': 'горячая вода',
        'central_heating': 'центральное отопление'
    }
    df['type'] = df['type'].replace(type_mapping)
    
    return df


def load_weather_data(db_path='d:/code/vlru/nn/weather.db'):
    """Загрузка данных о погоде из базы данных SQLite."""
    if not os.path.exists(db_path):
        print(f"Файл базы данных погоды не найден: {db_path}")
        return None
        
    print(f"Загрузка данных о погоде из: {db_path}")
    conn = sqlite3.connect(db_path)
    try:
        df = pd.read_sql_query("SELECT * FROM weather", conn)
        df['date'] = pd.to_datetime(df['date'])
        print(f"Загружено {len(df)} записей о погоде.")
        return df
    except pd.io.sql.DatabaseError:
        print("Таблица 'weather' не найдена в базе данных.")
        return None
    finally:
        conn.close()

# ============================================================================
# 2. ПРЕПРОЦЕССИНГ ДАННЫХ (адаптирован для регрессии)
# ============================================================================

class OutagePreprocessor:
    """Класс для обработки данных об отключениях для задачи регрессии."""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_names = []
        self.is_fitted = False

    def extract_features(self, df, weather_df=None):
        """Извлечение признаков и целевой переменной."""
        
        # Временные признаки
        df['start_date'] = pd.to_datetime(df['start_date'])
        df['end_date'] = pd.to_datetime(df['end_date'])
        
        # Целевая переменная
        labels = (df['end_date'] - df['start_date']).dt.total_seconds() / 3600
        
        features = pd.DataFrame()
        
        # Временные признаки
        features['month'] = df['start_date'].dt.month
        features['day_of_week'] = df['start_date'].dt.dayofweek
        features['hour'] = df['start_date'].dt.hour
        features['is_weekend'] = (df['start_date'].dt.dayofweek >= 5).astype(int)
        features['season'] = (df['start_date'].dt.month % 12 + 3) // 3
        
        # Интеграция погоды
        if weather_df is not None:
            df['date_only'] = df['start_date'].dt.date.astype(str)
            weather_df['date_only'] = pd.to_datetime(weather_df['date']).dt.date.astype(str)
            merged_df = pd.merge(df, weather_df, how='left', on='date_only')
            
            features['temp_max'] = merged_df['temp_max'].fillna(merged_df['temp_max'].mean())
            features['temp_min'] = merged_df['temp_min'].fillna(merged_df['temp_min'].mean())

            if 'weather_type' in merged_df.columns:
                merged_df['weather_type'] = merged_df['weather_type'].fillna('unknown')
                if 'weather_type' not in self.label_encoders:
                    self.label_encoders['weather_type'] = LabelEncoder()
                    features['weather_type_encoded'] = self.label_encoders['weather_type'].fit_transform(merged_df['weather_type'])
                else:
                    new_types = set(merged_df['weather_type']) - set(self.label_encoders['weather_type'].classes_)
                    if new_types:
                        self.label_encoders['weather_type'].classes_ = np.concatenate([self.label_encoders['weather_type'].classes_, list(new_types)])
                    features['weather_type_encoded'] = self.label_encoders['weather_type'].transform(merged_df['weather_type'])

        # Кодирование типа отключения
        if 'type' not in self.label_encoders:
            self.label_encoders['type'] = LabelEncoder()
            features['type_encoded'] = self.label_encoders['type'].fit_transform(df['type'])
        else:
            features['type_encoded'] = self.label_encoders['type'].transform(df['type'])
        
        type_dummies = pd.get_dummies(df['type'], prefix='type')
        features = pd.concat([features, type_dummies], axis=1)
        
        # Признаки адреса
        if 'address' in df.columns:
            df['street'] = df['address'].apply(lambda x: x.split(',')[1].strip() if ',' in str(x) and len(str(x).split(',')) > 1 else 'unknown')
            if 'street' not in self.label_encoders:
                self.label_encoders['street'] = LabelEncoder()
                features['street_encoded'] = self.label_encoders['street'].fit_transform(df['street'])
            else:
                new_streets = set(df['street']) - set(self.label_encoders['street'].classes_)
                if new_streets:
                    self.label_encoders['street'].classes_ = np.concatenate([self.label_encoders['street'].classes_, list(new_streets)])
                features['street_encoded'] = self.label_encoders['street'].transform(df['street'])

        # Признаки из описания
        if 'description' in df.columns:
            features['desc_length'] = df['description'].str.len().fillna(0)
            features['has_emergency_words'] = df['description'].str.contains('авария|срочн|экстренн', case=False, na=False).astype(int)
            features['has_planned_words'] = df['description'].str.contains('планов|ремонт|профилакт', case=False, na=False).astype(int)
        
        return features, labels

    def fit_transform(self, df, weather_df=None):
        """Обработка и нормализация данных."""
        features, labels = self.extract_features(df, weather_df)
        
        # Убедимся, что все колонки есть
        if not self.is_fitted:
            self.feature_names = features.columns.tolist()
        
        scaled_features = self.scaler.fit_transform(features[self.feature_names])
        self.is_fitted = True
        return scaled_features, labels.values

    def transform(self, df, weather_df=None):
        """Применение уже обученного препроцессора."""
        if not self.is_fitted:
            raise RuntimeError("Preprocessor is not fitted yet. Call fit_transform first.")
            
        features, labels = self.extract_features(df, weather_df)
        
        # Добавляем недостающие dummy-колонки, если их нет в новых данных
        for col in self.feature_names:
            if col not in features.columns:
                features[col] = 0
        features = features[self.feature_names] # Гарантируем порядок колонок
        
        scaled_features = self.scaler.transform(features)
        return scaled_features, labels.values

    def save(self, filepath='preprocessor.joblib'):
        """Сохранение препроцессора."""
        joblib.dump(self, filepath)
        print(f"Препроцессор сохранен в {filepath}")

    @staticmethod
    def load(filepath='preprocessor.joblib'):
        """Загрузка препроцессора."""
        preprocessor = joblib.load(filepath)
        print(f"Препроцессор загружен из {filepath}")
        return preprocessor

# ============================================================================
# 3. ДАТАСЕТ И МОДЕЛЬ
# ============================================================================

class OutageDurationDataset(Dataset):
    """Датасет для предсказания длительности отключений."""
    def __init__(self, features, labels):
        self.features = torch.FloatTensor(features)
        self.labels = torch.FloatTensor(labels).view(-1, 1)
    
    def __len__(self):
        return len(self.features)
    
    def __getitem__(self, idx):
        return self.features[idx], self.labels[idx]

class DurationPredictor(nn.Module):
    """Нейросеть для предсказания длительности (регрессия)."""
    def __init__(self, input_dim, hidden_dims=[128, 64, 32]):
        super(DurationPredictor, self).__init__()
        
        layers = []
        prev_dim = input_dim
        for hidden_dim in hidden_dims:
            layers.extend([
                nn.Linear(prev_dim, hidden_dim),
                nn.ReLU(),
                nn.BatchNorm1d(hidden_dim),
                nn.Dropout(0.3)
            ])
            prev_dim = hidden_dim
        
        layers.append(nn.Linear(prev_dim, 1))
        # Используем ReLU, чтобы предсказания были неотрицательными
        layers.append(nn.ReLU())

        self.network = nn.Sequential(*layers)
    
    def forward(self, x):
        return self.network(x)

# ============================================================================
# 4. ОБУЧЕНИЕ И ОЦЕНКА
# ============================================================================

def train_model(model, train_loader, val_loader, epochs, lr, device):
    """Функция для обучения модели."""
    criterion = nn.MSELoss() # Среднеквадратичная ошибка для регрессии
    optimizer = optim.Adam(model.parameters(), lr=lr)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, 'min', patience=10, factor=0.5)
    
    model.to(device)
    
    for epoch in range(epochs):
        model.train()
        epoch_loss = 0
        for features, labels in train_loader:
            features, labels = features.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(features)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
        
        avg_train_loss = epoch_loss / len(train_loader)
        
        # Валидация
        model.eval()
        val_loss = 0
        with torch.no_grad():
            for features, labels in val_loader:
                features, labels = features.to(device), labels.to(device)
                outputs = model(features)
                loss = criterion(outputs, labels)
                val_loss += loss.item()
        
        avg_val_loss = val_loss / len(val_loader)
        scheduler.step(avg_val_loss)
        
        if (epoch + 1) % 10 == 0:
            print(f'Эпоха [{epoch+1}/{epochs}], Train Loss: {avg_train_loss:.4f}, Val Loss: {avg_val_loss:.4f}')

def evaluate_model(model, data_loader, device):
    """Оценка модели на тестовых данных."""
    model.eval()
    all_preds = []
    all_labels = []
    with torch.no_grad():
        for features, labels in data_loader:
            features = features.to(device)
            outputs = model(features)
            all_preds.extend(outputs.cpu().numpy())
            all_labels.extend(labels.numpy())
    
    all_preds = np.array(all_preds).flatten()
    all_labels = np.array(all_labels).flatten()
    
    rmse = np.sqrt(mean_squared_error(all_labels, all_preds))
    r2 = r2_score(all_labels, all_preds)
    
    print(f"RMSE: {rmse:.4f}")
    print(f"R^2 Score: {r2:.4f}")
    
    return all_labels, all_preds

# ============================================================================
# 5. ОСНОВНАЯ ФУНКЦИЯ
# ============================================================================

def main():
    """Основная функция для запуска."""
    
    print("=" * 70)
    print("ПРЕДСКАЗАНИЕ ДЛИТЕЛЬНОСТИ ОТКЛЮЧЕНИЙ")
    print("=" * 70)
    
    # Параметры
    BATCH_SIZE = 128
    EPOCHS = 300
    LEARNING_RATE = 0.001
    DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
    MODEL_PATH = 'duration_predictor.pth'
    PREPROCESSOR_PATH = 'duration_preprocessor.joblib'
    
    print(f"\nИспользуется устройство: {DEVICE}")
    
    # 1. Загрузка данных
    print("\n1. Загрузка данных...")
    df = load_data_from_db()
    weather_df = load_weather_data()
    
    # 2. Препроцессинг
    print("\n2. Препроцессинг данных...")
    preprocessor = OutagePreprocessor()
    scaled_features, labels = preprocessor.fit_transform(df, weather_df=weather_df)
    print(f"Извлечено признаков: {scaled_features.shape[1]}")
    
    # 3. Разделение данных
    X_train, X_test, y_train, y_test = train_test_split(scaled_features, labels, test_size=0.2, random_state=42)
    X_train, X_val, y_train, y_val = train_test_split(X_train, y_train, test_size=0.15, random_state=42)
    
    print(f"\nTrain: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")
    
    # 4. Создание DataLoader'ов
    train_dataset = OutageDurationDataset(X_train, y_train)
    val_dataset = OutageDurationDataset(X_val, y_val)
    test_dataset = OutageDurationDataset(X_test, y_test)
    
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE)
    
    # 5. Обучение модели
    print("\n3. Обучение модели...")
    model = DurationPredictor(input_dim=scaled_features.shape[1])
    train_model(model, train_loader, val_loader, EPOCHS, LEARNING_RATE, DEVICE)
    
    # 6. Оценка модели
    print("\n4. Оценка на тестовой выборке...")
    true_labels, predictions = evaluate_model(model, test_loader, DEVICE)
    
    # 7. Сохранение модели и препроцессора
    print("\n5. Сохранение артефактов...")
    torch.save(model.state_dict(), MODEL_PATH)
    preprocessor.save(PREPROCESSOR_PATH)
    print(f"Модель сохранена в {MODEL_PATH}")
    
    # 8. Визуализация результатов
    plt.figure(figsize=(10, 6))
    plt.scatter(true_labels, predictions, alpha=0.3)
    plt.plot([min(true_labels), max(true_labels)], [min(true_labels), max(true_labels)], 'r--')
    plt.xlabel("Реальная длительность (часы)")
    plt.ylabel("Предсказанная длительность (часы)")
    plt.title("Сравнение реальных и предсказанных значений")
    plt.grid(True)
    plt.savefig("prediction_results.png")
    print("График с результатами сохранен в 'prediction_results.png'")

if __name__ == "__main__":
    main()
