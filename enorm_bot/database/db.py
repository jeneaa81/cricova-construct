import aiosqlite
import time
from pathlib import Path
from typing import Dict, Any, List

DB_PATH = Path(__file__).resolve().parent.parent / "enorm_bot.sqlite3"

async def init_db():
    """Инициализация базы данных SQLite"""
    async with aiosqlite.connect(DB_PATH) as db:
        # Таблица пользователей
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                first_name TEXT,
                lang TEXT DEFAULT 'ru',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        # Таблица заявок
        await db.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                user_name TEXT,
                phone TEXT,
                vin TEXT,
                brand TEXT,
                model TEXT,
                year TEXT,
                engine TEXT,
                categories TEXT,
                comment TEXT,
                delivery_type TEXT,
                status TEXT DEFAULT 'новый',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.commit()

async def get_user_lang(user_id: int) -> str:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT lang FROM users WHERE user_id = ?", (user_id,)) as cursor:
            row = await cursor.fetchone()
            return row[0] if row else 'ru'

async def set_user_lang(user_id: int, username: str, first_name: str, lang: str):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            INSERT INTO users (user_id, username, first_name, lang)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET lang = excluded.lang, username = excluded.username
        """, (user_id, username, first_name, lang))
        await db.commit()

async def create_order(order_data: Dict[str, Any]) -> int:
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("""
            INSERT INTO orders (
                user_id, user_name, phone, vin, brand, model, year, engine,
                categories, comment, delivery_type, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            order_data.get('user_id'),
            order_data.get('user_name', ''),
            order_data.get('phone', ''),
            order_data.get('vin', ''),
            order_data.get('brand', ''),
            order_data.get('model', ''),
            order_data.get('year', ''),
            order_data.get('engine', ''),
            ", ".join(order_data.get('categories', [])),
            order_data.get('comment', ''),
            order_data.get('delivery_type', 'Самовывоз (Криково)'),
            'новый'
        ))
        await db.commit()
        return cursor.lastrowid
