#Backend 


1.**Создание окружения:**
python -m venv venv

2.**Активация окружения:**

2.1*macOS/Linux:*
source venv/bin/activate

2.2*Windows:*
.\venv\Scripts\activate

3.**Установка зависимостей**
Из папки backend введите команду:
```pip install -r requirements.txt```

4.**Запуск приложения**
Из папки backend/core введите команду:
```uvicorn app:app --host 0.0.0.0 --port 8001 --reload```
