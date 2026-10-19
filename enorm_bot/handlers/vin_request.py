import os
from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove
from telegram.ext import ContextTypes, ConversationHandler, CommandHandler, MessageHandler, CallbackQueryHandler, filters
from services.vin_ocr import VinOcrService
from services.order_export_1c import Order1CExportService
from database.db import get_user_lang, create_order
from config import STORE_INFO, MANAGER_CHAT_ID, GEMINI_API_KEY
from handlers.start import get_main_keyboard

STEP_PHOTO_OR_VIN = 1
STEP_CATEGORY = 2
STEP_COMMENT = 3
STEP_DELIVERY = 4
STEP_PHONE = 5

async def start_vin_request(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    lang = await get_user_lang(user_id)
    context.user_data['order'] = {'user_id': user_id, 'username': update.effective_user.username or '', 'user_name': update.effective_user.first_name or ''}

    msg_ru = (
        "🔍 <b>Подбор автозапчастей по VIN и фото техпаспорта</b>\n\n"
        "📸 <b>Отправьте фотографию техпаспорта</b> (СТС / Certificat de înmatriculare) вашего авто,\n"
        "<i>либо просто напишите VIN-код (17 символов) или марку/модель текстом:</i>\n\n"
        "⚡ <i>Наш AI моментально распознает данные машины и исключит ошибки несовместимости деталей.</i>"
    )

    msg_ro = (
        "🔍 <b>Selectare piese auto după VIN și foto certificat</b>\n\n"
        "📸 <b>Trimiteți o fotografie a certificatului de înmatriculare</b> a mașinii,\n"
        "<i>sau scrieți codul VIN (17 caractere) ori marca/modelul în mesaj text:</i>\n\n"
        "⚡ <i>AI-ul nostru va recunoaște instant datele vehiculului pentru identificare corectă.</i>"
    )

    await update.message.reply_text(
        msg_ro if lang == 'ro' else msg_ru,
        parse_mode='HTML',
        reply_markup=ReplyKeyboardRemove()
    )
    return STEP_PHOTO_OR_VIN

async def handle_car_info(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    lang = await get_user_lang(user_id)
    order = context.user_data.get('order', {})

    wait_msg = await update.message.reply_text("🔍 Анализируем данные автомобиля через AI..." if lang == 'ru' else "🔍 Analizăm datele vehiculului prin AI...")

    # Если отправлена фотография
    if update.message.photo:
        photo_file = await update.message.photo[-1].get_file()
        photo_bytes = await photo_file.download_as_bytearray()
        car_data = await VinOcrService.recognize_tech_passport(bytes(photo_bytes), api_key=GEMINI_API_KEY)
    else:
        # Если отправлен текст
        text = update.message.text.strip()
        vin = VinOcrService.extract_vin_from_text(text)
        if vin:
            car_data = {
                'vin': vin,
                'brand': 'По VIN',
                'model': 'Уточняется',
                'year': '',
                'engine': '',
                'source': 'Ручной ввод VIN'
            }
        else:
            car_data = {
                'vin': 'Не указан',
                'brand': text[:30],
                'model': '',
                'year': '',
                'engine': '',
                'source': 'Текстовое описание'
            }

    order.update(car_data)
    context.user_data['order'] = order
    await wait_msg.delete()

    card_text = (
        f"✅ <b>Автомобиль идентифицирован:</b>\n"
        f"🚗 <b>Авто:</b> {order.get('brand')} {order.get('model')} {order.get('year')}\n"
        f"🔑 <b>VIN:</b> <code>{order.get('vin')}</code>\n"
        f"⚙️ <b>Двигатель:</b> {order.get('engine') or 'Не указан'}\n"
        f"<i>(Источник: {order.get('source', 'Система')})</i>\n\n"
        f"<b>Какие запчасти вам необходимы? Выберите категорию:</b>"
    ) if lang == 'ru' else (
        f"✅ <b>Vehicul identificat:</b>\n"
        f"🚗 <b>Auto:</b> {order.get('brand')} {order.get('model')} {order.get('year')}\n"
        f"🔑 <b>VIN:</b> <code>{order.get('vin')}</code>\n"
        f"⚙️ <b>Motor:</b> {order.get('engine') or 'Nespecificat'}\n\n"
        f"<b>Ce piese vă sunt necesare? Selectați categoria:</b>"
    )

    categories_kb = InlineKeyboardMarkup([
        [InlineKeyboardButton("🛢️ Комплект ТО (масла, фильтры)", callback_data="cat_to")],
        [InlineKeyboardButton("🛑 Тормозная система (колодки, диски)", callback_data="cat_brakes")],
        [InlineKeyboardButton("⚙️ Подвеска и ходовая часть", callback_data="cat_suspension")],
        [InlineKeyboardButton("🔋 Аккумуляторы и электрика", callback_data="cat_battery")],
        [InlineKeyboardButton("✍️ Другое (указать список детально)", callback_data="cat_custom")]
    ])

    await update.message.reply_text(card_text, parse_mode='HTML', reply_markup=categories_kb)
    return STEP_CATEGORY

async def handle_category_choice(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    data = query.data
    order = context.user_data.get('order', {})
    user_id = update.effective_user.id
    lang = await get_user_lang(user_id)

    category_map = {
        'cat_to': 'Комплект ТО (масло, фильтры)',
        'cat_brakes': 'Тормозная система (колодки, диски)',
        'cat_suspension': 'Ходовая часть и подвеска',
        'cat_battery': 'Аккумулятор / Электрика',
        'cat_custom': 'Индивидуальный список'
    }

    selected_cat = category_map.get(data, 'Автозапчасти')
    order['categories'] = [selected_cat]
    context.user_data['order'] = order

    if data == 'cat_custom':
        await query.edit_message_text(
            "✏️ Напишите подробно, какие именно запчасти вам нужны (например: <i>передний правый амортизатор, рулевые наконечники, свечи зажигания</i>):",
            parse_mode='HTML'
        )
        return STEP_COMMENT

    await query.edit_message_text(f"Выбрана категория: <b>{selected_cat}</b>", parse_mode='HTML')

    delivery_kb = InlineKeyboardMarkup([
        [InlineKeyboardButton("🏢 Самовывоз: г. Криково, ул. Арон Пумнул 1А", callback_data="del_cricova")],
        [InlineKeyboardButton("🚚 Доставка курьером (Кишинёв и регионы)", callback_data="del_courier")]
    ])

    await query.message.reply_text(
        "<b>Выберите способ получения:</b>\n"
        "• <b>Самовывоз:</b> склад-магазин в Криково (бесплатно, можно забрать в день заказа)\n"
        "• <b>Доставка:</b> курьером до дверей",
        parse_mode='HTML',
        reply_markup=delivery_kb
    )
    return STEP_DELIVERY

async def handle_custom_comment(update: Update, context: ContextTypes.DEFAULT_TYPE):
    comment = update.message.text.strip()
    order = context.user_data.get('order', {})
    order['comment'] = comment
    context.user_data['order'] = order

    delivery_kb = InlineKeyboardMarkup([
        [InlineKeyboardButton("🏢 Самовывоз: г. Криково, ул. Арон Пумнул 1А", callback_data="del_cricova")],
        [InlineKeyboardButton("🚚 Доставка курьером (Кишинёв и регионы)", callback_data="del_courier")]
    ])

    await update.message.reply_text(
        "<b>Выберите способ получения:</b>\n"
        "• <b>Самовывоз:</b> склад-магазин в Криково\n"
        "• <b>Доставка:</b> курьером по Кишинёву и Молдове",
        parse_mode='HTML',
        reply_markup=delivery_kb
    )
    return STEP_DELIVERY

async def handle_delivery_choice(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    data = query.data
    order = context.user_data.get('order', {})
    delivery_type = "Самовывоз (г. Криково, ул. Арон Пумнул 1А)" if data == "del_cricova" else "Доставка курьером"
    order['delivery_type'] = delivery_type
    context.user_data['order'] = order

    await query.edit_message_text(f"Способ получения: <b>{delivery_type}</b>", parse_mode='HTML')

    phone_kb = ReplyKeyboardMarkup(
        [[KeyboardButton("📱 Отправить номер телефона", request_contact=True)]],
        resize_keyboard=True,
        one_time_keyboard=True
    )

    await query.message.reply_text(
        "📞 <b>Остался последний шаг:</b>\n"
        "Укажите ваш контактный номер телефона для связи с менеджером и подтверждения заказа:\n"
        "<i>(Нажмите кнопку ниже или напишите номер сообщением, например: +373 68 000 000)</i>",
        parse_mode='HTML',
        reply_markup=phone_kb
    )
    return STEP_PHONE

async def handle_phone(update: Update, context: ContextTypes.DEFAULT_TYPE):
    order = context.user_data.get('order', {})
    user_id = update.effective_user.id
    lang = await get_user_lang(user_id)

    if update.message.contact:
        phone = update.message.contact.phone_number
    else:
        phone = update.message.text.strip()

    order['phone'] = phone
    context.user_data['order'] = order

    # 1. Сохранение в SQLite
    order_id = await create_order(order)
    order['order_id'] = order_id

    # 2. Экспорт пакета для 1С (демонстрация синергии с 1С!)
    export_file = Order1CExportService.export_order(order)

    # 3. Сообщение покупателю
    confirm_text = (
        f"🎉 <b>Заявка №TG-{order_id} успешно оформлена!</b>\n\n"
        f"📋 <b>Детали заказа:</b>\n"
        f"• <b>Автомобиль:</b> {order.get('brand')} {order.get('model')} {order.get('year')}\n"
        f"• <b>VIN-код:</b> <code>{order.get('vin')}</code>\n"
        f"• <b>Запрос:</b> {', '.join(order.get('categories', []))}\n"
        f"{f'• <b>Пожелания:</b> {order.get('comment')}' if order.get('comment') else ''}\n"
        f"• <b>Получение:</b> {order.get('delivery_type')}\n"
        f"• <b>Телефон:</b> {phone}\n\n"
        f"⏱ <i>Менеджер магазина свяжется с вами в течение 10–15 минут с точными вариантами цен (оригинал / премиум аналоги / эконом) и сроками.</i>\n\n"
        f"📍 <b>Наш магазин:</b> г. Криково, ул. Арон Пумнул, 1А\n"
        f"📞 <b>Горячая линия:</b> {STORE_INFO['phone']}"
    )

    await update.message.reply_text(
        confirm_text,
        parse_mode='HTML',
        reply_markup=get_main_keyboard(lang)
    )

    # 4. Оповещение менеджера магазина (если настроен MANAGER_CHAT_ID)
    if MANAGER_CHAT_ID:
        try:
            manager_msg = (
                f"🚨 <b>НОВАЯ ЗАЯВКА НА ПОДБОР [№TG-{order_id}]</b>\n\n"
                f"👤 <b>Клиент:</b> {order.get('user_name')} (@{order.get('username') or 'без username'})\n"
                f"📞 <b>Телефон:</b> <code>{phone}</code>\n"
                f"🚗 <b>Авто:</b> {order.get('brand')} {order.get('model')} {order.get('year')}\n"
                f"🔑 <b>VIN:</b> <code>{order.get('vin')}</code>\n"
                f"📦 <b>Что нужно:</b> {', '.join(order.get('categories', []))}\n"
                f"🏢 <b>Доставка:</b> {order.get('delivery_type')}\n"
                f"💾 <i>Пакет 1С сформирован: {os.path.basename(export_file)}</i>"
            )
            await context.bot.send_message(
                chat_id=MANAGER_CHAT_ID,
                text=manager_msg,
                parse_mode='HTML'
            )
        except Exception as e:
            print(f"[VinRequest] Не удалось отправить уведомление менеджеру: {e}")

    return ConversationHandler.END

async def cancel_vin_request(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    lang = await get_user_lang(user_id)
    await update.message.reply_text("Запрос на подбор отменен.", reply_markup=get_main_keyboard(lang))
    return ConversationHandler.END

vin_conv_handler = ConversationHandler(
    entry_points=[
        MessageHandler(filters.Regex(r"^(🔍 Подбор запчастей по VIN|🔍 Selectare piese după VIN)"), start_vin_request)
    ],
    states={
        STEP_PHOTO_OR_VIN: [
            MessageHandler(filters.PHOTO | (filters.TEXT & ~filters.COMMAND), handle_car_info)
        ],
        STEP_CATEGORY: [
            CallbackQueryHandler(handle_category_choice, pattern=r"^cat_")
        ],
        STEP_COMMENT: [
            MessageHandler(filters.TEXT & ~filters.COMMAND, handle_custom_comment)
        ],
        STEP_DELIVERY: [
            CallbackQueryHandler(handle_delivery_choice, pattern=r"^del_")
        ],
        STEP_PHONE: [
            MessageHandler((filters.CONTACT | filters.TEXT) & ~filters.COMMAND, handle_phone)
        ]
    },
    fallbacks=[CommandHandler("cancel", cancel_vin_request)],
    per_message=False
)
