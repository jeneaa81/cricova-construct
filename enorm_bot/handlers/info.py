from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import ContextTypes
from config import STORE_INFO
from database.db import get_user_lang

async def show_store_contacts(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    lang = await get_user_lang(user_id)

    msg_ru = (
        f"📍 <b>Магазин автозапчастей ENORM</b>\n"
        f"<i>Юридическое лицо: {STORE_INFO['legal_name']} (IDNO: {STORE_INFO['idno']})</i>\n\n"
        f"🏢 <b>Адрес магазина / пункта выдачи:</b>\n"
        f"<code>{STORE_INFO['address']}</code>\n\n"
        f"🕒 <b>График работы:</b>\n"
        f"{STORE_INFO['schedule']}\n\n"
        f"📞 <b>Контакты для связи:</b>\n"
        f"• Телефон / Viber / WhatsApp: <b>{STORE_INFO['phone']}</b>\n"
        f"• Telegram: <b>{STORE_INFO['telegram']}</b>\n"
        f"• Официальный сайт: <b>{STORE_INFO['site']}</b>\n\n"
        f"💳 <b>Способы оплаты:</b> наличными при получении, банковской картой (MAIB, Visa, Mastercard, Amex), безналичный расчет для юрлиц (с НДС)."
    )

    msg_ro = (
        f"📍 <b>Magazin de piese auto ENORM</b>\n"
        f"<i>Entitate juridică: {STORE_INFO['legal_name']} (IDNO: {STORE_INFO['idno']})</i>\n\n"
        f"🏢 <b>Adresa magazinului:</b>\n"
        f"<code>{STORE_INFO['address']}</code>\n\n"
        f"🕒 <b>Program de lucru:</b>\n"
        f"{STORE_INFO['schedule']}\n\n"
        f"📞 <b>Contacte:</b>\n"
        f"• Telefon / Viber / WhatsApp: <b>{STORE_INFO['phone']}</b>\n"
        f"• Telegram: <b>{STORE_INFO['telegram']}</b>\n"
        f"• Site oficial: <b>{STORE_INFO['site']}</b>"
    )

    inline_kb = InlineKeyboardMarkup([
        [InlineKeyboardButton("🗺️ Открыть на Google Maps", url="https://maps.google.com/?q=Cricova+Aron+Pumnul+1A")],
        [InlineKeyboardButton("💬 Написать в Telegram", url="https://t.me/enorm_info")]
    ])

    await update.message.reply_text(
        msg_ro if lang == 'ro' else msg_ru,
        parse_mode='HTML',
        reply_markup=inline_kb
    )

async def show_delivery_info(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    lang = await get_user_lang(user_id)

    msg_ru = (
        "📦 <b>Условия доставки и оплаты</b>\n\n"
        "🚗 <b>1. Самовывоз (бесплатно):</b>\n"
        "• Из нашего магазина в г. Криково, ул. Арон Пумнул, 1А.\n"
        "• Запчасти со склада в Кишинёве доступны для выдачи в день заказа.\n\n"
        "🚚 <b>2. Доставка курьером:</b>\n"
        "• По Кишинёву: курьерская экспресс-доставка в течение 2–4 часов.\n"
        "• По всей Молдове: экспресс-почтой (Nova Poshta / Muvi Express) за 24 часа.\n\n"
        "💳 <b>3. Оплата:</b>\n"
        "• При получении (наличными или картой курьеру).\n"
        "• Онлайн-оплата картой через MAIB.\n"
        "• По перечислению для автосервисов и корпоративных клиентов (выставляем фактуру с НДС)."
    )

    await update.message.reply_text(msg_ru, parse_mode='HTML')
