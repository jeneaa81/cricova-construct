from telegram import Update, ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import ContextTypes
from config import STORE_INFO
from database.db import get_user_lang, set_user_lang

def get_main_keyboard(lang: str = 'ru') -> ReplyKeyboardMarkup:
    if lang == 'ro':
        keyboard = [
            [KeyboardButton("🔍 Selectare piese după VIN / Foto")],
            [KeyboardButton("🔎 Căutare după cod (articol)"), KeyboardButton("📍 Magazin & Contacte")],
            [KeyboardButton("📦 Livrare & Achitare"), KeyboardButton("🌐 Limba / Язык")]
        ]
    else:
        keyboard = [
            [KeyboardButton("🔍 Подбор запчастей по VIN / Фото")],
            [KeyboardButton("🔎 Поиск по коду (артикулу)"), KeyboardButton("📍 Магазин и контакты")],
            [KeyboardButton("📦 Доставка и оплата"), KeyboardButton("🌐 Язык / Limba")]
        ]
    return ReplyKeyboardMarkup(keyboard, resize_keyboard=True)

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    lang = await get_user_lang(user.id)
    await set_user_lang(user.id, user.username or '', user.first_name or '', lang)

    text_ru = (
        f"👋 <b>Добро пожаловать в ENORM!</b>\n"
        f"<i>Магазин автозапчастей в наличии и под заказ с доставкой по Молдове.</i>\n\n"
        f"📍 <b>Пункт выдачи:</b> г. Криково, ул. Арон Пумнул, 1А\n"
        f"📞 <b>Отдел продаж:</b> {STORE_INFO['phone']}\n\n"
        f"<b>Чем мы можем помочь?</b>\n"
        f"• <b>Подбор по VIN / Фото:</b> отправьте фото техпаспорта, и мы подберем оригиналы и проверенные аналоги.\n"
        f"• <b>Поиск по артикулу:</b> проверьте наличие и цену детали на нашем складе в реальном времени."
    )

    await update.message.reply_text(
        text_ru,
        parse_mode='HTML',
        reply_markup=get_main_keyboard(lang)
    )

async def switch_language_prompt(update: Update, context: ContextTypes.DEFAULT_TYPE):
    inline_kb = InlineKeyboardMarkup([
        [
            InlineKeyboardButton("🇷🇺 Русский", callback_data="set_lang_ru"),
            InlineKeyboardButton("🇲🇩 Română", callback_data="set_lang_ro")
        ]
    ])
    await update.message.reply_text(
        "Выберите язык интерфейса / Selectați limba:",
        reply_markup=inline_kb
    )

async def handle_lang_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    data = query.data
    user = update.effective_user
    new_lang = 'ro' if 'ro' in data else 'ru'

    await set_user_lang(user.id, user.username or '', user.first_name or '', new_lang)

    msg = "Limba a fost setată în Română! 🇲🇩" if new_lang == 'ro' else "Язык интерфейса изменен на Русский! 🇷🇺"
    await query.edit_message_text(msg)
    await query.message.reply_text(
        "Главное меню:" if new_lang == 'ru' else "Meniu principal:",
        reply_markup=get_main_keyboard(new_lang)
    )
