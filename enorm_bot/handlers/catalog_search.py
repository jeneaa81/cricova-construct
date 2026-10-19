from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import ContextTypes, ConversationHandler, CommandHandler, MessageHandler, filters
from services.enorm_catalog import EnormCatalogService
from database.db import get_user_lang

WAITING_ARTICLE = 1

async def ask_for_article(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    lang = await get_user_lang(user_id)

    if lang == 'ro':
        msg = (
            "🔎 <b>Căutare piese după cod (articol)</b>\n\n"
            "Introduceți codul piesei (de exemplu: <code>OC90</code>, <code>W712</code>, <code>32122</code>):\n"
            "<i>Sistemul va verifica stocul și prețurile direct pe www.enorm.md în timp real.</i>"
        )
    else:
        msg = (
            "🔎 <b>Поиск детали по артикулу (коду)</b>\n\n"
            "Введите каталожный номер детали (например: <code>OC90</code>, <code>W712</code>, <code>32122</code>):\n"
            "<i>Бот проверит наличие и актуальные цены прямо на складе enorm.md в реальном времени.</i>"
        )

    await update.message.reply_text(msg, parse_mode='HTML')
    return WAITING_ARTICLE

async def process_article_search(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.message.text.strip()
    user_id = update.effective_user.id
    lang = await get_user_lang(user_id)

    # Показываем статус поиска
    wait_msg = await update.message.reply_text("🔄 Проверяем склады в Кишинёве..." if lang == 'ru' else "🔄 Verificăm stocurile în Chișinău...")

    results = EnormCatalogService.search_article(query, max_results=5)
    await wait_msg.delete()

    if not results:
        no_res_text = (
            f"❌ По коду <code>{query}</code> ничего не найдено на сайте.\n\n"
            f"💡 <b>Не нашли нужную деталь?</b>\n"
            f"Нажмите кнопку <b>«🔍 Подбор запчастей по VIN»</b> в меню, и наши специалисты подберут оригиналы и аналоги по каталогу TecDoc."
        ) if lang == 'ru' else (
            f"❌ Nu au fost găsite piese după codul <code>{query}</code>.\n\n"
            f"💡 <b>Nu găsiți piesa potrivită?</b>\n"
            f"Apăsați butonul <b>«🔍 Selectare piese după VIN»</b> din meniu pentru consultare tehnică."
        )
        await update.message.reply_text(no_res_text, parse_mode='HTML')
        return ConversationHandler.END

    header = f"✅ <b>Результаты поиска на enorm.md по «{query.upper()}»:</b>\n\n" if lang == 'ru' else f"✅ <b>Rezultate căutare enorm.md pentru «{query.upper()}»:</b>\n\n"
    items_text = []

    for idx, item in enumerate(results, start=1):
        item_block = (
            f"<b>{idx}. {item['brand']} — {item['code']}</b>\n"
            f"   📦 {item['name']}\n"
            f"   {item['stock']}\n"
            f"   💰 <b>Цена: {item['price']}</b>\n"
        )
        items_text.append(item_block)

    full_text = header + "\n".join(items_text)
    full_text += (
        "\n<i>Для оформления заказа или резервирования свяжитесь с менеджером: +373 (60) 80-22-33</i>"
        if lang == 'ru' else
        "\n<i>Pentru comandă sau rezervare sunați la: +373 (60) 80-22-33</i>"
    )

    inline_kb = InlineKeyboardMarkup([
        [InlineKeyboardButton("🌐 Открыть на сайте enorm.md", url=f"https://www.enorm.md/search_products/?query={query}")],
        [InlineKeyboardButton("💬 Написать менеджеру", url="https://t.me/enorm_info")]
    ])

    await update.message.reply_text(full_text, parse_mode='HTML', reply_markup=inline_kb)
    return ConversationHandler.END

async def cancel_search(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Поиск отменен.")
    return ConversationHandler.END

catalog_conv_handler = ConversationHandler(
    entry_points=[
        MessageHandler(filters.Regex(r"^(🔎 Поиск по коду|🔎 Căutare după cod)"), ask_for_article)
    ],
    states={
        WAITING_ARTICLE: [MessageHandler(filters.TEXT & ~filters.COMMAND, process_article_search)]
    },
    fallbacks=[CommandHandler("cancel", cancel_search)]
)
