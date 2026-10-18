import React, { useState } from 'react';
import { X, Database, Check, Copy, ArrowRightLeft, Sparkles } from 'lucide-react';
import type { Language, OrderData } from '../types';

interface Sync1CModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  sampleOrder?: OrderData | null;
}

export const Sync1CModal: React.FC<Sync1CModalProps> = ({
  isOpen,
  onClose,
  lang,
  sampleOrder,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'architecture' | 'json' | 'bsl'>('architecture');

  if (!isOpen) return null;

  // JSON representation of order for 1C
  const jsonPayload = JSON.stringify(
    sampleOrder || {
      id: 'ORD-CRIC-2026-0042',
      customer: {
        name: 'Ion Munteanu',
        phone: '+37369123456',
        address: 'or. Cricova, str. Chișinăului 45',
      },
      delivery: {
        type: 'delivery',
        zone: 'Cricova',
        cost: 50,
      },
      payment: 'MIA_INSTANT',
      items: [
        { code1C: '1C-00281', name: 'Ciment Lafarge M500 40kg', quantity: 10, price: 118, sum: 1180 },
        { code1C: '1C-00104', name: 'Ceresit CM 11 Plus 25kg', quantity: 5, price: 145, sum: 725 },
        { code1C: '1C-01205', name: 'Profil CD 60 3m', quantity: 12, price: 42, sum: 504 },
      ],
      totalWeightKg: 543,
      totalAmountMDL: 2459,
      timestamp: new Date().toISOString(),
    },
    null,
    2
  );

  // 1C BSL Code sample for HTTP Service
  const bsl1cCode = `// В модуле HTTP-сервиса 1С:Предприятие 8.3
// Метод: POST /api/v1/orders

Функция ЗаказыPOST(Запрос)
    ТелоJSON = Запрос.ПолучитьТелоКакСтроку("UTF-8");
    Чтение = Новый ЧтениеJSON;
    Чтение.УстановитьСтроку(ТелоJSON);
    ДанныеЗаказа = ПрочитатьJSON(Чтение);

    // Создаем типовой документ "Заказ покупателя"
    НовыйЗаказ = Документы.ЗаказПокупателя.СоздатьДокумент();
    НовыйЗаказ.Дата = ТекущаяДата();
    НовыйЗаказ.Комментарий = "Заказ из Telegram-каталога Крикова. Тел: " + ДанныеЗаказа.customer.phone;
    
    // Заполняем табличную часть товарами по артикулам 1С
    Для Каждого Стр Из ДанныеЗаказа.items Цикл
        НоваяСтрока = НовыйЗаказ.Товары.Добавить();
        НоменклатураСсылка = Справочники.Номенклатура.НайтиПоАртикулу(Стр.code1C);
        НоваяСтрока.Номенклатура = НоменклатураСсылка;
        НоваяСтрока.Количество = Стр.quantity;
        НоваяСтрока.Цена = Стр.price;
        НоваяСтрока.Сумма = Стр.sum;
    КонецЦикла;

    НовыйЗаказ.Записать(РежимЗаписиДокумента.Запись);
    
    Ответ = Новый HTTPСервисОтвет(200);
    Ответ.УстановитьТелоИзСтроки("{\\"status\\": \\"success\\", \\"orderNumber\\": \\"" + НовыйЗаказ.Номер + "\\"}", "UTF-8");
    Возврат Ответ;
КонецФункции`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Database className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg">
                {lang === 'ro'
                  ? 'Integrare cu 1C:Предприятие 8'
                  : 'Интеграция с 1С:Предприятие 8'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ro'
                  ? 'Sincronizare automată stocuri, prețuri și comenzi fără efort manual'
                  : 'Автоматическая синхронизация остатков, цен и заказов'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition cursor-pointer ${
              activeTab === 'architecture'
                ? 'border-amber-500 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {lang === 'ro' ? '1. Cum funcționează' : '1. Архитектура работы'}
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition cursor-pointer ${
              activeTab === 'json'
                ? 'border-amber-500 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {lang === 'ro' ? '2. Structură JSON' : '2. Пакет данных JSON'}
          </button>
          <button
            onClick={() => setActiveTab('bsl')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition cursor-pointer ${
              activeTab === 'bsl'
                ? 'border-amber-500 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {lang === 'ro' ? '3. Cod 1C (BSL)' : '3. Код в 1С (Пример)'}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-grow">
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-amber-600" />
                  <span>
                    {lang === 'ro'
                      ? 'Fluxul de date în 2 direcții:'
                      : 'Двусторонний обмен данными:'}
                  </span>
                </h4>

                <div className="mt-3 space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div>
                      <strong className="text-slate-900">
                        {lang === 'ro' ? 'Din 1C spre Catalog:' : 'Из 1С в Каталог:'}
                      </strong>
                      <p className="text-slate-500 mt-0.5">
                        {lang === 'ro'
                          ? 'Nomenclatorul, prețurile actuale în MDL și stocurile reale din depozitul Cricova se exportă automat prin HTTP/REST API.'
                          : 'Номенклатура, актуальные цены в леях и остатки на складе в Крикова обновляются автоматически по расписанию.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div>
                      <strong className="text-slate-900">
                        {lang === 'ro' ? 'Din Telegram spre 1C:' : 'Из Telegram в 1С:'}
                      </strong>
                      <p className="text-slate-500 mt-0.5">
                        {lang === 'ro'
                          ? 'Când clientul sau meșterul plasează comanda, în 1C se creează instant documentul «Comanda cumpărătorului» cu mărfurile rezervate.'
                          : 'Когда клиент оформляет заказ, в 1С мгновенно создается документ «Заказ покупателя» с резервом товара.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Value for Owner */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>
                    {lang === 'ro'
                      ? 'De ce proprietarul magazinului va accepta:'
                      : 'Почему владельцу магазина это выгодно:'}
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                  <li>
                    <strong>
                      {lang === 'ro' ? 'Zero greșeli la casă:' : 'Ноль ошибок оператора:'}
                    </strong>{' '}
                    {lang === 'ro'
                      ? 'Numele produselor și prețurile vin din baza oficială 1C.'
                      : 'Товары добавляются строго по кодам артикулов вашей базы.'}
                  </li>
                  <li>
                    <strong>
                      {lang === 'ro' ? 'Economie de timp:' : 'Экономия 2-3 часов в день:'}
                    </strong>{' '}
                    {lang === 'ro'
                      ? 'Vânzătorul nu mai dictează prețurile la telefon de 50 de ori pe zi.'
                      : 'Продавцы не диктуют цены и наличие по телефону.'}
                  </li>
                  <li>
                    <strong>
                      {lang === 'ro' ? 'Fiscalizare rapidă:' : 'Быстрая фактуризация:'}
                    </strong>{' '}
                    {lang === 'ro'
                      ? 'Din comandă se generează e-Factura sau cec fiscal în 1C într-un singur clic.'
                      : 'На основании заказа выписка накладной e-Factura или чека занимает 1 клик.'}
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">
                  {lang === 'ro' ? 'Format JSON trimis către 1C:' : 'Пакет JSON для 1С:'}
                </span>
                <button
                  onClick={() => handleCopy(jsonPayload)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiat!' : 'Copiază'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-72 leading-relaxed">
                {jsonPayload}
              </pre>
            </div>
          )}

          {activeTab === 'bsl' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">
                  {lang === 'ro'
                    ? 'Exemplu cod 1C (HTTP-Service):'
                    : 'Пример HTTP-сервиса в конфигурации 1С:'}
                </span>
                <button
                  onClick={() => handleCopy(bsl1cCode)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiat!' : 'Copiază'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-2xl bg-slate-900 text-amber-300 font-mono text-[11px] overflow-x-auto max-h-72 leading-relaxed">
                {bsl1cCode}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
          >
            {lang === 'ro' ? 'Am înțeles' : 'Понятно'}
          </button>
        </div>
      </div>
    </div>
  );
};
