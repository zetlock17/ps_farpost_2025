import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from datetime import datetime
import matplotlib.pyplot as plt
import os

# ============================================================================
# 1. ДАТАСЕТ
# ============================================================================

class OutageDataset(Dataset):
    """Датасет для отключений"""
    
    def __init__(self, features):
        self.features = torch.FloatTensor(features)
    
    def __len__(self):
        return len(self.features)
    
    def __getitem__(self, idx):
        return self.features[idx]


# ============================================================================
# 2. ПРОСТОЙ АВТОЭНКОДЕР
# ============================================================================

class SimpleAutoencoder(nn.Module):
    """Базовый автоэнкодер для детекции аномалий"""
    
    def __init__(self, input_dim, hidden_dims=[64, 32, 16]):
        super(SimpleAutoencoder, self).__init__()
        
        # Энкодер
        encoder_layers = []
        prev_dim = input_dim
        for hidden_dim in hidden_dims:
            encoder_layers.extend([
                nn.Linear(prev_dim, hidden_dim),
                nn.ReLU(),
                nn.BatchNorm1d(hidden_dim),
                nn.Dropout(0.2)
            ])
            prev_dim = hidden_dim
        
        self.encoder = nn.Sequential(*encoder_layers)
        
        # Декодер (зеркальная структура)
        decoder_layers = []
        hidden_dims_reversed = list(reversed(hidden_dims[:-1])) + [input_dim]
        for hidden_dim in hidden_dims_reversed:
            decoder_layers.extend([
                nn.Linear(prev_dim, hidden_dim),
                nn.ReLU() if hidden_dim != input_dim else nn.Identity(),
                nn.BatchNorm1d(hidden_dim) if hidden_dim != input_dim else nn.Identity(),
            ])
            prev_dim = hidden_dim
        
        self.decoder = nn.Sequential(*decoder_layers)
    
    def forward(self, x):
        encoded = self.encoder(x)
        decoded = self.decoder(encoded)
        return decoded
    
    def get_latent(self, x):
        """Получить латентное представление"""
        return self.encoder(x)


# ============================================================================
# 3. ПРОДВИНУТЫЙ АВТОЭНКОДЕР С ATTENTION
# ============================================================================

class AttentionAutoencoder(nn.Module):
    """Автоэнкодер с механизмом внимания для выявления важных признаков"""
    
    def __init__(self, input_dim, hidden_dims=[64, 32, 16]):
        super(AttentionAutoencoder, self).__init__()
        
        self.input_dim = input_dim
        
        # Механизм внимания для входных признаков
        self.attention = nn.Sequential(
            nn.Linear(input_dim, input_dim),
            nn.Tanh(),
            nn.Linear(input_dim, input_dim),
            nn.Softmax(dim=1)
        )
        
        # Энкодер
        encoder_layers = []
        prev_dim = input_dim
        for hidden_dim in hidden_dims:
            encoder_layers.extend([
                nn.Linear(prev_dim, hidden_dim),
                nn.ReLU(),
                nn.BatchNorm1d(hidden_dim),
                nn.Dropout(0.2)
            ])
            prev_dim = hidden_dim
        
        self.encoder = nn.Sequential(*encoder_layers)
        
        # Декодер
        decoder_layers = []
        hidden_dims_reversed = list(reversed(hidden_dims[:-1])) + [input_dim]
        for hidden_dim in hidden_dims_reversed:
            decoder_layers.extend([
                nn.Linear(prev_dim, hidden_dim),
                nn.ReLU() if hidden_dim != input_dim else nn.Identity(),
                nn.BatchNorm1d(hidden_dim) if hidden_dim != input_dim else nn.Identity(),
            ])
            prev_dim = hidden_dim
        
        self.decoder = nn.Sequential(*decoder_layers)
    
    def forward(self, x):
        # Применяем attention к входным признакам
        attention_weights = self.attention(x)
        x_attended = x * attention_weights
        
        # Энкодер-декодер
        encoded = self.encoder(x_attended)
        decoded = self.decoder(encoded)
        
        return decoded, attention_weights
    
    def get_latent(self, x):
        attention_weights = self.attention(x)
        x_attended = x * attention_weights
        return self.encoder(x_attended)


# ============================================================================
# 4. ПРЕПРОЦЕССИНГ ДАННЫХ
# ============================================================================

class OutagePreprocessor:
    """Класс для обработки данных об отключениях"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_names = []
    
    def extract_features(self, df, weather_df=None):
        """
        Извлечение признаков из данных
        
        Ожидаемые колонки в df:
        - start_date: дата начала отключения
        - end_date: дата конца отключения
        - type: тип (вода, свет, отопление и т.д.)
        - address: полный адрес
        - description: описание (опционально)
        """
        
        features = pd.DataFrame()
        
        # Временные признаки
        df['start_date'] = pd.to_datetime(df['start_date'])
        df['end_date'] = pd.to_datetime(df['end_date'])
        
        # Длительность в часах
        features['duration_hours'] = (df['end_date'] - df['start_date']).dt.total_seconds() / 3600
        
        # Временные признаки
        features['month'] = df['start_date'].dt.month
        features['day_of_week'] = df['start_date'].dt.dayofweek
        features['hour'] = df['start_date'].dt.hour
        features['is_weekend'] = (df['start_date'].dt.dayofweek >= 5).astype(int)
        
        # Сезон
        features['season'] = (df['start_date'].dt.month % 12 + 3) // 3
        
        # Интеграция данных о погоде
        if weather_df is not None:
            df['date_only'] = df['start_date'].dt.date.astype(str)
            weather_df['date_only'] = pd.to_datetime(weather_df['date']).dt.date.astype(str)
            
            # Объединяем данные
            merged_df = pd.merge(df, weather_df, how='left', on='date_only')
            
            # Заполняем пропуски в погоде средними значениями
            features['temp_max'] = merged_df['temp_max'].fillna(merged_df['temp_max'].mean())
            features['temp_min'] = merged_df['temp_min'].fillna(merged_df['temp_min'].mean())

            # Кодирование типа погоды
            if 'weather_type' in merged_df.columns:
                merged_df['weather_type'] = merged_df['weather_type'].fillna('unknown')
                if 'weather_type' not in self.label_encoders:
                    self.label_encoders['weather_type'] = LabelEncoder()
                    features['weather_type_encoded'] = self.label_encoders['weather_type'].fit_transform(merged_df['weather_type'])
                else:
                    # Обработка новых, невиданных ранее типов погоды
                    new_weather_types = merged_df[~merged_df['weather_type'].isin(self.label_encoders['weather_type'].classes_)]['weather_type']
                    if not new_weather_types.empty:
                        self.label_encoders['weather_type'].classes_ = np.concatenate([self.label_encoders['weather_type'].classes_, new_weather_types.unique()])
                    features['weather_type_encoded'] = self.label_encoders['weather_type'].transform(merged_df['weather_type'])

        # Кодирование типа отключения
        if 'type' not in self.label_encoders:
            self.label_encoders['type'] = LabelEncoder()
            features['type_encoded'] = self.label_encoders['type'].fit_transform(df['type'])
        else:
            features['type_encoded'] = self.label_encoders['type'].transform(df['type'])
        
        # One-hot encoding для типа (чтобы модель лучше понимала)
        type_dummies = pd.get_dummies(df['type'], prefix='type')
        features = pd.concat([features, type_dummies], axis=1)
        
        # Признаки адреса (извлекаем улицу/район если возможно)
        # Предполагаем формат адреса: "город, улица, дом"
        if 'address' in df.columns:
            # Простое хеширование улицы для уникальности
            df['street'] = df['address'].apply(lambda x: x.split(',')[1].strip() if ',' in str(x) and len(str(x).split(',')) > 1 else 'unknown')
            
            if 'street' not in self.label_encoders:
                self.label_encoders['street'] = LabelEncoder()
                features['street_encoded'] = self.label_encoders['street'].fit_transform(df['street'])
            else:
                # Handle unseen labels in transform
                new_streets = df[~df['street'].isin(self.label_encoders['street'].classes_)]['street']
                if not new_streets.empty:
                    self.label_encoders['street'].classes_ = np.concatenate([self.label_encoders['street'].classes_, new_streets.unique()])
                
                features['street_encoded'] = self.label_encoders['street'].transform(df['street'])

        # Признаки из описания (если есть)
        if 'description' in df.columns:
            features['desc_length'] = df['description'].str.len().fillna(0)
            features['has_emergency_words'] = df['description'].str.contains('авария|срочн|экстренн', case=False, na=False).astype(int)
            features['has_planned_words'] = df['description'].str.contains('планов|ремонт|профилакт', case=False, na=False).astype(int)
        
        self.feature_names = features.columns.tolist()
        return features
    
    def fit_transform(self, df, weather_df=None):
        """Обработка и нормализация данных"""
        features = self.extract_features(df, weather_df)
        scaled_features = self.scaler.fit_transform(features)
        return scaled_features, features
    
    def transform(self, df, weather_df=None):
        """Применение уже обученного препроцессора"""
        features = self.extract_features(df, weather_df)
        scaled_features = self.scaler.transform(features)
        return scaled_features, features


# ============================================================================
# 5. ДЕТЕКТОР АНОМАЛИЙ
# ============================================================================

class AnomalyDetector:
    """Основной класс для обнаружения аномалий"""
    
    def __init__(self, model_type='simple', input_dim=None, device='cpu'):
        self.device = device
        self.model_type = model_type
        
        if input_dim is not None:
            if model_type == 'simple':
                self.model = SimpleAutoencoder(input_dim).to(device)
            elif model_type == 'attention':
                self.model = AttentionAutoencoder(input_dim).to(device)
        
        self.threshold = None
        self.reconstruction_errors = None
    
    def train(self, train_loader, val_loader=None, epochs=200, lr=0.001):
        """Обучение модели"""
        
        criterion = nn.MSELoss()
        optimizer = optim.Adam(self.model.parameters(), lr=lr)
        scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=10, factor=0.5)
        
        train_losses = []
        val_losses = []
        
        self.model.train()
        
        for epoch in range(epochs):
            epoch_loss = 0
            for batch in train_loader:
                batch = batch.to(self.device)
                
                optimizer.zero_grad()
                
                if self.model_type == 'attention':
                    output, _ = self.model(batch)
                else:
                    output = self.model(batch)
                
                loss = criterion(output, batch)
                loss.backward()
                optimizer.step()
                
                epoch_loss += loss.item()
            
            avg_train_loss = epoch_loss / len(train_loader)
            train_losses.append(avg_train_loss)
            
            # Валидация
            if val_loader is not None:
                val_loss = self.evaluate(val_loader, criterion)
                val_losses.append(val_loss)
                scheduler.step(val_loss)
                
                if (epoch + 1) % 10 == 0:
                    print(f'Epoch [{epoch+1}/{epochs}], Train Loss: {avg_train_loss:.6f}, Val Loss: {val_loss:.6f}')
            else:
                if (epoch + 1) % 10 == 0:
                    print(f'Epoch [{epoch+1}/{epochs}], Train Loss: {avg_train_loss:.6f}')
        
        return train_losses, val_losses
    
    def evaluate(self, data_loader, criterion):
        """Оценка модели"""
        self.model.eval()
        total_loss = 0
        
        with torch.no_grad():
            for batch in data_loader:
                batch = batch.to(self.device)
                
                if self.model_type == 'attention':
                    output, _ = self.model(batch)
                else:
                    output = self.model(batch)
                
                loss = criterion(output, batch)
                total_loss += loss.item()
        
        self.model.train()
        return total_loss / len(data_loader)
    
    def calculate_reconstruction_error(self, data_loader):
        """Вычисление ошибок реконструкции"""
        self.model.eval()
        errors = []
        
        with torch.no_grad():
            for batch in data_loader:
                batch = batch.to(self.device)
                
                if self.model_type == 'attention':
                    output, _ = self.model(batch)
                else:
                    output = self.model(batch)
                
                # MSE для каждого примера
                batch_errors = torch.mean((batch - output) ** 2, dim=1)
                errors.extend(batch_errors.cpu().numpy())
        
        return np.array(errors)
    
    def set_threshold(self, train_loader, percentile=95):
        """Установка порога для определения аномалий"""
        errors = self.calculate_reconstruction_error(train_loader)
        self.threshold = np.percentile(errors, percentile)
        self.reconstruction_errors = errors
        print(f'Threshold set at {percentile}th percentile: {self.threshold:.6f}')
        return self.threshold
    
    def detect_anomalies(self, data_loader, return_scores=False):
        """Обнаружение аномалий"""
        errors = self.calculate_reconstruction_error(data_loader)
        anomalies = errors > self.threshold
        
        if return_scores:
            return anomalies, errors
        return anomalies
    
    def get_feature_importance(self, sample):
        """Получение важности признаков для attention модели"""
        if self.model_type != 'attention':
            raise ValueError("Feature importance available only for attention model")
        
        self.model.eval()
        with torch.no_grad():
            sample_tensor = torch.FloatTensor(sample).unsqueeze(0).to(self.device)
            _, attention_weights = self.model(sample_tensor)
            return attention_weights.cpu().numpy()[0]


import sqlite3

# ============================================================================
# 6. ЗАГРУЗКА ДАННЫХ ИЗ БД
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
    
    # Преобразование типов, если необходимо
    df['start_date'] = pd.to_datetime(df['start_date'])
    df['end_date'] = pd.to_datetime(df['end_date'])
    
    # Замена 'electricity', 'cold_water', 'hot_water' на русские аналоги для консистентности
    type_mapping = {
        'electricity': 'электричество',
        'cold_water': 'холодная вода',
        'hot_water': 'горячая вода'
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


def main():
    """Основная функция для запуска детектора"""
    
    print("=" * 70)
    print("ДЕТЕКТОР АНОМАЛЬНЫХ ОТКЛЮЧЕНИЙ")
    print("=" * 70)
    
    # Параметры
    BATCH_SIZE = 128
    EPOCHS = 70
    LEARNING_RATE = 0.001
    MODEL_TYPE = 'attention'  # 'simple' или 'attention'
    DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
    
    print(f"\nИспользуется устройство: {DEVICE}")
    print(f"Тип модели: {MODEL_TYPE}")
    
    # 1. Загрузка данных
    print("\n1. Загрузка данных...")
    df = load_data_from_db()
    weather_df = load_weather_data()
    print(f"Загружено {len(df)} записей отключений.")
    
    # 2. Препроцессинг
    print("\n2. Препроцессинг данных...")
    preprocessor = OutagePreprocessor()
    features, features_df = preprocessor.fit_transform(df, weather_df=weather_df)
    print(f"Извлечено признаков: {features.shape[1]}")
    print(f"Признаки: {preprocessor.feature_names}")
    
    # 3. Разделение на train/val/test
    train_features, test_features = train_test_split(features, test_size=0.2, random_state=42)
    train_features, val_features = train_test_split(train_features, test_size=0.15, random_state=42)
    
    print(f"\nTrain: {len(train_features)}, Val: {len(val_features)}, Test: {len(test_features)}")
    
    # 4. Создание DataLoader'ов
    train_dataset = OutageDataset(train_features)
    val_dataset = OutageDataset(val_features)
    test_dataset = OutageDataset(test_features)
    
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False)
    
    # 5. Создание и обучение модели
    print("\n3. Обучение модели...")
    detector = AnomalyDetector(
        model_type=MODEL_TYPE,
        input_dim=features.shape[1],
        device=DEVICE
    )
    
    train_losses, val_losses = detector.train(
        train_loader,
        val_loader,
        epochs=EPOCHS,
        lr=LEARNING_RATE
    )
    
    # 6. Установка порога
    print("\n4. Установка порога аномальности...")
    threshold = detector.set_threshold(train_loader, percentile=95)
    
    # 7. Детекция аномалий на тестовых данных
    print("\n5. Детекция аномалий на тестовой выборке...")
    anomalies, scores = detector.detect_anomalies(test_loader, return_scores=True)
    
    n_anomalies = np.sum(anomalies)
    print(f"Обнаружено аномалий: {n_anomalies} из {len(anomalies)} ({n_anomalies/len(anomalies)*100:.2f}%)")
    
    # 8. Анализ топ аномалий
    print("\n6. Топ-10 самых аномальных отключений:")
    test_indices = np.arange(len(train_features), len(train_features) + len(test_features))
    test_df = df.iloc[test_indices].reset_index(drop=True)
    test_features_df = features_df.iloc[test_indices].reset_index(drop=True)
    
    anomaly_scores_df = pd.DataFrame({
        'score': scores,
        'is_anomaly': anomalies
    })
    
    top_anomalies = anomaly_scores_df.nlargest(10, 'score')
    
    for idx, row in top_anomalies.iterrows():
        record = test_df.iloc[idx]
        print(f"\nАномалия #{idx} (score: {row['score']:.4f}):")
        print(f"  Дата: {record['start_date']} - {record['end_date']}")
        print(f"  Длительность: {(record['end_date'] - record['start_date']).total_seconds() / 3600:.1f} часов")
        print(f"  Тип: {record['type']}")
        print(f"  Адрес: {record['address']}")
        print(f"  Описание: {record['description']}")
    
    # 9. Визуализация (если есть matplotlib)
    print("\n7. Создание визуализаций...")
    try:
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # График обучения
        axes[0, 0].plot(train_losses, label='Train Loss')
        if val_losses:
            axes[0, 0].plot(val_losses, label='Val Loss')
        axes[0, 0].set_xlabel('Epoch')
        axes[0, 0].set_ylabel('Loss')
        axes[0, 0].set_title('Training Progress')
        axes[0, 0].legend()
        axes[0, 0].grid(True)
        
        # Распределение ошибок реконструкции
        axes[0, 1].hist(scores, bins=50, alpha=0.7, edgecolor='black')
        axes[0, 1].axvline(threshold, color='r', linestyle='--', label=f'Threshold: {threshold:.4f}')
        axes[0, 1].set_xlabel('Reconstruction Error')
        axes[0, 1].set_ylabel('Frequency')
        axes[0, 1].set_title('Distribution of Reconstruction Errors')
        axes[0, 1].legend()
        axes[0, 1].grid(True)
        
        # Scatter: длительность vs anomaly score
        axes[1, 0].scatter(test_features_df['duration_hours'], scores, 
                          c=anomalies, cmap='coolwarm', alpha=0.6)
        axes[1, 0].set_xlabel('Duration (hours)')
        axes[1, 0].set_ylabel('Anomaly Score')
        axes[1, 0].set_title('Duration vs Anomaly Score')
        axes[1, 0].grid(True)
        
        # Box plot по типам отключений
        if 'type' in test_df.columns:
            anomaly_df = pd.DataFrame({
                'type': test_df['type'],
                'score': scores,
                'is_anomaly': anomalies
            })
            anomaly_df.boxplot(column='score', by='type', ax=axes[1, 1])
            axes[1, 1].set_title('Anomaly Scores by Outage Type')
            axes[1, 1].set_xlabel('Type')
            axes[1, 1].set_ylabel('Anomaly Score')
        
        plt.tight_layout()
        plt.savefig('anomaly_detection_results.png', dpi=150, bbox_inches='tight')
        print("Графики сохранены в 'anomaly_detection_results.png'")
        
    except Exception as e:
        print(f"Ошибка при создании визуализаций: {e}")
    
    print("\n" + "=" * 70)
    print("ДЕТЕКЦИЯ ЗАВЕРШЕНА")
    print("=" * 70)
    
    return detector, preprocessor, anomaly_scores_df


if __name__ == "__main__":
    detector, preprocessor, results = main()