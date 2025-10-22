import sqlite3
import json

def create_weather_type_mapping():
    """
    Подключается к базе данных погоды, извлекает все уникальные значения weather_type
    и создает список для сопоставления.
    """
    weather_db_path = "d:/code/ps_farpost_2025/databases/weather.db"
    
    try:
        # Подключение к базе данных SQLite
        conn = sqlite3.connect(weather_db_path)
        cursor = conn.cursor()
        
        # Выполнение запроса для получения уникальных типов погоды
        cursor.execute("SELECT DISTINCT weather_type FROM weather")
        
        # Извлечение всех результатов
        rows = cursor.fetchall()
        
        # Извлечение типов погоды из строк
        # Результат представляет собой список кортежей, например, [('солнечно',), ('дождливо',)]
        weather_types = sorted([row[0] for row in rows if row[0] is not None])
        
        # Создание словаря для сопоставления
        weather_mapping = {weather: index for index, weather in enumerate(weather_types)}

        print("Найденные уникальные типы погоды:")
        print(weather_types)
        
        print("\nСгенерированное сопоставление:")
        print(json.dumps(weather_mapping, indent=4, ensure_ascii=False))

        # опционально: сохранить маппинг в файл
        # with open('weather_mapping.json', 'w', encoding='utf-8') as f:
        #     json.dump(weather_mapping, f, ensure_ascii=False, indent=4)

        return weather_mapping

    except sqlite3.Error as e:
        print(f"Ошибка базы данных: {e}")
        return None
    finally:
        # Закрытие соединения
        if 'conn' in locals() and conn:
            conn.close()
            print("\nСоединение с базой данных закрыто.")

if __name__ == "__main__":
    create_weather_type_mapping()
