import asyncio
import logging
import sys
from telegram import Update
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    filters
)

from config import TELEGRAM_BOT_TOKEN, DEBUG, STORE_INFO
from database.db import init_db
from handlers.start import start_command, switch_language_prompt, handle_lang_callback
from handlers.catalog_search import catalog_conv_handler
from handlers.vin_request import vin_conv_handler
from handlers.info import show_store_contacts, show_delivery_info

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO if not DEBUG else logging.DEBUG
)
logger = logging.getLogger("EnormBot")

async def main():
    if not TELEGRAM_BOT_TOKEN or TELEGRAM_BOT_TOKEN == 'YOUR_BOT_TOKEN_HERE':
        print("\n" + "="*60)
        print("❌ ОШИБКА: Не указан TELEGRAM_BOT_TOKEN!")
        print("Пожалуйста, откройте файл .env в папке enorm_bot и укажите токен:")
        print("TELEGRAM_BOT_TOKEN=123456789:ABCDefgh...")
        print("Получить бесплатный токен можно у @BotFather в Telegram за 30 секунд.")
        print("="*60 + "\n")
        sys.exit(1)

    # 1. Инициализация базы данных
    logger.info("Инициализация локальной базы данных SQLite...")
    await init_db()

    # 2. Создание приложения бота
    application = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()

    # 3. Регистрация хэндлеров
    # Команда /start
    application.add_handler(CommandHandler("start", start_command))

    # Диалоговые цепочки
    application.add_handler(vin_conv_handler)
    application.add_handler(catalog_conv_handler)

    # Информационные кнопки
    application.add_handler(MessageHandler(
        filters.Regex(r"^(📍 Магазин и контакты|📍 Magazin & Contacte)"),
        show_store_contacts
    ))
    application.add_handler(MessageHandler(
        filters.Regex(r"^(📦 Доставка и оплата|📦 Livrare & Achitare)"),
        show_delivery_info
    ))
    application.add_handler(MessageHandler(
        filters.Regex(r"^(🌐 Язык / Limba|🌐 Limba / Язык)"),
        switch_language_prompt
    ))

    # Выбор языка (инлайн)
    application.add_handler(CallbackQueryHandler(handle_lang_callback, pattern=r"^set_lang_"))

    print("\n" + "="*60)
    print(f"🚀 Бот для {STORE_INFO['name']} ({STORE_INFO['legal_name']}) успешно запущен!")
    print(f"📍 Пункт выдачи: {STORE_INFO['address']}")
    print(f"📞 Телефон: {STORE_INFO['phone']}")
    print("Ожидание сообщений от пользователей...")
    print("="*60 + "\n")

    # 4. Запуск polling
    await application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    try:
        # Для Windows asyncio loop
        if sys.platform == 'win32':
            asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        print("\nБот остановлен пользователем.")
