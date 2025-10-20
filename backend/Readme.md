#Backend 


**Создание окружения:**
python -m venv venv

**Активация окружения:**
*macOS/Linux:*
source venv/bin/activate
*Windows:*
.\venv\Scripts\activate

**Установка зависимостей**
Из папки backend введите команду:
```pip install -r requirements.txt```

**Запуск приложения**
Из папки backend/core введите команду:
```uvicorn app:app --host 0.0.0.0 --port 8001 --reload```
