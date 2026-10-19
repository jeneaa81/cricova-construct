import os
from pathlib import Path
from dotenv import load_dotenv

# Пути
BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / '.env'

if ENV_FILE.exists():
    load_dotenv(ENV_FILE)
else:
    # Попытка подгрузить глобальный или локальный env
    load_dotenv()

# Настройки Telegram
TELEGRAM_BOT_TOKEN = os.getenv('ENORM_BOT_TOKEN', os.getenv('TELEGRAM_BOT_TOKEN', ''))
MANAGER_CHAT_ID = os.getenv('MANAGER_CHAT_ID', os.getenv('TELEGRAM_CHAT_ID', ''))

# AI / OCR
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

# Режим отладки
DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 'yes')

# Данные магазина
STORE_INFO = {
    'name': 'ENORM.md',
    'legal_name': 'S.R.L. "RA UNITED TRADE"',
    'idno': '1023600032980',
    'address': 'Молдова, мун. Кишинёв, г. Криково, ул. Арон Пумнул, 1А',
    'phone': '+373 (60) 80-22-33',
    'site': 'https://www.enorm.md',
    'telegram': '@enorm_info',
    'schedule': 'Пн–Пт: 09:00 – 18:00 | Сб: 09:00 – 15:00 | Вс: выходной'
}
