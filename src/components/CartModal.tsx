import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Send,
  Truck,
  Store,
  QrCode,
  Banknote,
  FileCode,
  CheckCircle2,
  Scale,
} from 'lucide-react';
import type { CartItem, Language, DeliveryZone, OrderData } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  lang: Language;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOpen1CDemo: (orderData: OrderData) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  items,
  lang,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpen1CDemo,
}) => {
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('cricova');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mia_instant'>('cash');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [orderSent, setOrderSent] = useState(false);

  if (!isOpen) return null;

  const t = TRANSLATIONS[lang];

  // Calculations
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalWeight = items.reduce(
    (sum, item) => sum + (item.product.weightKg || 0) * item.quantity,
    0
  );

  let deliveryCost = 0;
  if (deliveryType === 'delivery') {
    if (deliveryZone === 'cricova') {
      deliveryCost = subtotal >= 1500 ? 0 : 50;
    } else if (deliveryZone === 'stauceni_ciorescu') {
      deliveryCost = 80;
    } else if (deliveryZone === 'goian_fauresti') {
      deliveryCost = 100;
    }
  }

  const grandTotal = subtotal + deliveryCost;

  const getOrderData = (): OrderData => ({
    items,
    customerName: name || (lang === 'ro' ? 'Client Cricova' : 'Клиент Крикова'),
    phone: phone || '069 000 000',
    deliveryType,
    deliveryZone,
    address: deliveryType === 'delivery' ? address : 'Magazin Cricova (Ridicare)',
    paymentMethod,
    notes,
    subtotal,
    deliveryCost,
    total: grandTotal,
    createdAt: new Date().toISOString(),
  });

  const handleSendTelegram = () => {
    const order = getOrderData();

    // Format readable message for Telegram
    const itemsList = items
      .map(
        (it) =>
          `• ${it.product.code1C} ${lang === 'ro' ? it.product.name_ro : it.product.name_ru} — ${it.quantity} x ${it.product.price} = ${it.quantity * it.product.price} MDL`
      )
      .join('\n');

    const msg = `🧱 *NOUĂ COMANDĂ — MATERIALE CRICOVA*\n\n` +
      `👤 *Client:* ${order.customerName}\n` +
      `📞 *Telefon:* ${order.phone}\n` +
      `🚚 *Tip:* ${order.deliveryType === 'pickup' ? 'Ridicare magazin' : `Livrare: ${order.address}`}\n` +
      `⚖️ *Greutate:* ~${totalWeight.toFixed(1)} kg\n` +
      `💳 *Plată:* ${order.paymentMethod === 'mia_instant' ? 'MIA Plăți Instant' : 'Numerar'}\n\n` +
      `📋 *Produse:*\n${itemsList}\n\n` +
      `💰 *Total:* ${order.total} MDL`;

    // If Telegram WebApp is available:
    const tg = (window as unknown as { Telegram?: { WebApp?: { sendData: (s: string) => void } } }).Telegram?.WebApp;
    if (tg && typeof tg.sendData === 'function') {
      tg.sendData(JSON.stringify(order));
    } else {
      // Fallback: Open Telegram share / contact link
      const encodedMsg = encodeURIComponent(msg);
      window.open(`https://t.me/share/url?url=${encodedMsg}`, '_blank');
    }

    setOrderSent(true);
    setTimeout(() => {
      setOrderSent(false);
      onClearCart();
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 bg-amber-500 rounded-sm"></span>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-slate-900">
                {t.cartTitle}
              </h2>
              <span className="text-xs text-slate-500">
                {items.length} {lang === 'ro' ? 'poziții' : 'позиций'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-grow">
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Store className="w-8 h-8" />
              </div>
              <p className="font-bold text-slate-800">{t.emptyCart}</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {t.emptyCartDesc}
              </p>
            </div>
          ) : (
            <>
              {/* Product items list */}
              <div className="space-y-2.5">
                {items.map((item) => {
                  const title = lang === 'ro' ? item.product.name_ro : item.product.name_ru;
                  const unit = lang === 'ro' ? item.product.unit_ro : item.product.unit_ru;

                  return (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.product.image}
                          alt={title}
                          className="w-12 h-12 rounded-xl object-cover bg-white shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span className="font-mono text-amber-700 font-semibold">{item.product.code1C}</span>
                            <span>•</span>
                            <span>{item.product.price} {t.priceCurrency} / {unit}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center bg-white border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center font-bold text-xs text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="w-16 text-right font-extrabold text-sm text-slate-900">
                          {item.product.price * item.quantity} {t.priceCurrency}
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-slate-400 hover:text-red-500 transition cursor-pointer p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Weight Notice */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium">
                <Scale className="w-4 h-4 text-amber-600" />
                <span>{t.weightNotice}</span>
                <span className="font-bold text-slate-900">{totalWeight.toFixed(1)} kg</span>
              </div>

              {/* Delivery method selector */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  {t.deliveryOptions}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDeliveryType('pickup')}
                    className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition cursor-pointer ${
                      deliveryType === 'pickup'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Store className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">
                        {lang === 'ro' ? 'Ridicare magazin' : 'Самовывоз'}
                      </div>
                      <div className="text-[10px] text-slate-400">or. Cricova (0 MDL)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setDeliveryType('delivery')}
                    className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition cursor-pointer ${
                      deliveryType === 'delivery'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">
                        {lang === 'ro' ? 'Livrare transport' : 'Доставка транспортом'}
                      </div>
                      <div className="text-[10px] text-slate-400">Cricova & Suburbii</div>
                    </div>
                  </button>
                </div>

                {/* Delivery Zone Details */}
                {deliveryType === 'delivery' && (
                  <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/70 space-y-2 animate-in fade-in">
                    <span className="text-[11px] font-bold text-amber-900 uppercase">
                      {lang === 'ro' ? 'Selectează zona de livrare:' : 'Выберите зону доставки:'}
                    </span>
                    <div className="space-y-1.5 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                        <input
                          type="radio"
                          name="zone"
                          checked={deliveryZone === 'cricova'}
                          onChange={() => setDeliveryZone('cricova')}
                          className="accent-amber-500"
                        />
                        <span>{t.zoneCricova}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                        <input
                          type="radio"
                          name="zone"
                          checked={deliveryZone === 'stauceni_ciorescu'}
                          onChange={() => setDeliveryZone('stauceni_ciorescu')}
                          className="accent-amber-500"
                        />
                        <span>{t.zoneStauceni}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                        <input
                          type="radio"
                          name="zone"
                          checked={deliveryZone === 'goian_fauresti'}
                          onChange={() => setDeliveryZone('goian_fauresti')}
                          className="accent-amber-500"
                        />
                        <span>{t.zoneGoian}</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer contact fields */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  {t.contactInfo}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className="p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-amber-500 focus:outline-hidden"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.phonePlaceholder}
                    className="p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-amber-500 focus:outline-hidden font-mono"
                  />
                </div>

                {deliveryType === 'delivery' && (
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t.addressPlaceholder}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-amber-500 focus:outline-hidden"
                  />
                )}

                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  {t.paymentMethod}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                      paymentMethod === 'cash'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    <span>{t.payCash}</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('mia_instant')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                      paymentMethod === 'mia_instant'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-amber-400" />
                    <span>{t.payMia}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Summary & Action */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>{t.subtotal}:</span>
                <span className="font-bold text-slate-800">{subtotal} {t.priceCurrency}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>{t.delivery}:</span>
                <span className="font-bold text-slate-800">
                  {deliveryCost === 0
                    ? (lang === 'ro' ? 'Gratuit' : 'Бесплатно')
                    : `${deliveryCost} ${t.priceCurrency}`}
                </span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                <span>{t.total}:</span>
                <span className="text-amber-600">{grandTotal} {t.priceCurrency}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Telegram Order Action */}
              <button
                onClick={handleSendTelegram}
                disabled={orderSent}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  orderSent
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                }`}
              >
                {orderSent ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>{t.orderSuccessTitle}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t.orderViaTelegram}</span>
                  </>
                )}
              </button>

              {/* 1C JSON Demo Action */}
              <button
                onClick={() => onOpen1CDemo(getOrderData())}
                className="w-full py-3 px-3 rounded-xl font-semibold text-xs text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
                title="Посмотреть структуру данных для 1С"
              >
                <FileCode className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'ro' ? 'Previzualizare 1C (JSON)' : 'Формат для 1С (JSON)'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
