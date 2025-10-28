from dotenv import load_dotenv
import os


load_dotenv()

COORD_DELTA = float(os.getenv('COORD_DELTA'))
WEB_URL = os.getenv('WEB_URL')
