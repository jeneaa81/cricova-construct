import os
import json
import time
from pathlib import Path
from typing import Dict, Any

EXPORT_DIR = Path(__file__).resolve().parent.parent / "exports_1c"
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

class Order1CExportService:
    """
    Сервис подготовки и экспорта заявок для 1С:Предприятие
    (1С:Управление торговлей Молдова, 1С:Альфа-Авто, 1С:УНФ).
    Показывает владельцу магазина готовность решения к интеграции с учетной системой.
    """

    @classmethod
    def export_order(cls, order_data: Dict[str, Any]) -> str:
        """
        Формирует пакет обмена в формате EnterpriseData / JSON и сохраняет в каталог обмена
        """
        order_id = order_data.get('order_id', int(time.time()))
        
        packet = {
            "version": "1.0",
            "format": "EnterpriseData_1C",
            "source": "Enorm_Telegram_Bot",
            "document": {
                "type": "ЗаказПокупателя",
                "number": f"TG-{order_id}",
                "date": time.strftime("%Y-%m-%dT%H:%M:%S"),
                "status": "Новый",
                "customer": {
                    "name": order_data.get('user_name', 'Розничный покупатель'),
                    "phone": order_data.get('phone', ''),
                    "telegram_id": order_data.get('user_id', ''),
                    "username": order_data.get('username', '')
                },
                "vehicle": {
                    "vin": order_data.get('vin', ''),
                    "brand": order_data.get('brand', ''),
                    "model": order_data.get('model', ''),
                    "year": order_data.get('year', ''),
                    "engine": order_data.get('engine', '')
                },
                "request_details": {
                    "categories": order_data.get('categories', []),
                    "comment": order_data.get('comment', ''),
                    "delivery_type": order_data.get('delivery_type', 'Самовывоз (г. Криково)')
                }
            }
        }

        # Сохранение в файл обмена
        file_path = EXPORT_DIR / f"order_{order_id}.json"
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(packet, f, ensure_ascii=False, indent=2)

        return str(file_path)
