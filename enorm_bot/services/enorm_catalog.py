import re
import urllib.request
import urllib.parse
from typing import List, Dict, Any

class EnormCatalogService:
    """
    Сервис живого поиска запчастей и цен прямо с сайта www.enorm.md
    """
    BASE_URL = "https://www.enorm.md/search_products/"

    @classmethod
    def search_article(cls, article: str, max_results: int = 6) -> List[Dict[str, Any]]:
        clean_article = article.strip().replace(" ", "")
        if not clean_article or len(clean_article) < 2:
            return []

        url = f"{cls.BASE_URL}?query={urllib.parse.quote(clean_article)}"
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://www.enorm.md/'
        })

        try:
            with urllib.request.urlopen(req, timeout=8) as resp:
                html = resp.read().decode('utf-8', errors='replace')
        except Exception as e:
            print(f"[EnormCatalogService] Ошибка запроса к enorm.md: {e}")
            return []

        # Поиск строк таблицы товаров
        rows = re.findall(r'<tr[^>]*>(.*?)</tr>', html, re.DOTALL | re.I)
        results = []

        for r in rows:
            cells = re.findall(r'<td[^>]*>(.*?)</td>', r, re.DOTALL | re.I)
            if len(cells) >= 5:
                # Очистка текста в ячейках
                c_texts = [re.sub(r'<[^>]+>', ' ', c).strip() for c in cells]
                c_texts = [re.sub(r'\s+', ' ', c) for c in c_texts]

                # Проверяем наличие цены в последних ячейках
                price_match = re.search(r'(\d+[\.,]?\d*)\s*(?:MDL|лей|lei)?', c_texts[-1] + ' ' + c_texts[-2])
                if price_match:
                    price_val = price_match.group(1).replace(',', '.')
                    
                    # Пытаемся извлечь бренд и артикул
                    # Обычно в строке: Код | Бренд | Название | Склад/Срок | Цена
                    name = c_texts[2] if len(c_texts) > 2 else ''
                    brand = c_texts[1] if len(c_texts) > 1 else ''
                    code = c_texts[0] if len(c_texts) > 0 else ''
                    warehouse = c_texts[3] if len(c_texts) > 3 else 'Кишинев'

                    # Очистка склада от лишних символов
                    if 'in stock' in warehouse.lower() or 'кишинев' in warehouse.lower():
                        stock_status = "✅ В наличии (Кишинёв)"
                    elif 'рабочих' in warehouse.lower() or 'заказ' in warehouse.lower():
                        stock_status = "⏳ Под заказ (1-3 дня)"
                    else:
                        stock_status = f"📦 {warehouse}"

                    results.append({
                        'code': code or clean_article.upper(),
                        'brand': brand or "Аналог/OEM",
                        'name': name,
                        'stock': stock_status,
                        'price': f"{float(price_val):.2f} MDL"
                    })

                    if len(results) >= max_results:
                        break

        return results
