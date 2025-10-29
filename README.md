# Редизайн vlru-off + фича
## Запуск проекта
### Frontend
из корня проекта:
1. ```npm run dev``` - в режиме разрботчика
2. ```npm run build``` - для билда
3. ```npm run preview``` - предпросмотр билда

### Backend
0. из папки apps/backend

1. **Создание окружения:**
python -m venv venv

2. **Активация окружения:**

2.1 *macOS/Linux:*
source venv/bin/activate

2.2 *Windows:*
.\venv\Scripts\activate

3. **Установка зависимостей**
Из папки backend введите команду:
```pip install -r requirements.txt```

4. **Заполнение окружения**
Создайте файл с расширением .env в корне проекта
Заполните по примеру из .env.example файла 

5. **Запуск приложения**
Из папки backend/core введите команду:
```uvicorn app:app --host 0.0.0.0 --port 8001 --reload```
