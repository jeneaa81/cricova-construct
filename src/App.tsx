import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, ShieldCheck, Truck, Clock, Sparkles } from 'lucide-react';
import type { Language, Product, CartItem, OrderData } from './types';
import { CATEGORIES } from './data/categories';
import { PRODUCTS } from './data/products';
import { TRANSLATIONS } from './data/translations';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { CartModal } from './components/CartModal';
import { MaterialCalculatorModal } from './components/MaterialCalculatorModal';
import { Sync1CModal } from './components/Sync1CModal';

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ro');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCalcOpen, setIsCalcOpen] = useState<boolean>(false);
  const [is1COpen, setIs1COpen] = useState<boolean>(false);
  const [demoOrder, setDemoOrder] = useState<OrderData | null>(null);

  const t = TRANSLATIONS[lang];

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;

      const title = lang === 'ro' ? product.name_ro : product.name_ru;
      const desc = lang === 'ro' ? product.description_ro : product.description_ru;
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !query ||
        title.toLowerCase().includes(query) ||
        desc.toLowerCase().includes(query) ||
        product.code1C.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, lang]);

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleAddMultipleToCart = (itemsToAdd: { product: Product; quantity: number }[]) => {
    setCart((prev) => {
      let updated = [...prev];
      for (const { product, quantity } of itemsToAdd) {
        const existingIdx = updated.findIndex((i) => i.product.id === product.id);
        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + quantity,
          };
        } else {
          updated.push({ product, quantity });
        }
      }
      return updated;
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleOpen1CDemoFromCart = (order: OrderData) => {
    setDemoOrder(order);
    setIsCartOpen(false);
    setIs1COpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans pb-24 sm:pb-12 text-slate-900">
      {/* Top Header */}
      <Header
        lang={lang}
        onToggleLang={() => setLang(lang === 'ro' ? 'ru' : 'ro')}
        cartCount={cartTotalItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCalculator={() => setIsCalcOpen(true)}
        onOpen1CModal={() => {
          setDemoOrder(null);
          setIs1COpen(true);
        }}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-4 sm:py-6 w-full space-y-5">
        {/* Hero Banner for Cricova */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-5 sm:p-8 shadow-xl border border-slate-800">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold backdrop-blur-xs border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'ro' ? 'Depozit „La Plopi” • or. Cricova' : 'Склад «La Plopi» • г. Крикова'}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {lang === 'ro'
                ? 'Materiale de construcție „La Plopi” în Cricova'
                : 'Стройматериалы «La Plopi» прямо в Крикова'}
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              {lang === 'ro'
                ? 'Comandă online cu ridicare imediată sau livrare rapidă cu buzul în Cricova, Stăuceni, Ciorescu și Porumbeni.'
                : 'Заказывайте онлайн с быстрым самовывозом или доставкой бусом по Крикова, Ставченам, Чореску и Порумбень.'}
            </p>

            {/* Quick trust metrics */}
            <div className="pt-2 grid grid-cols-3 gap-2 sm:gap-4 border-t border-slate-700/60 text-[11px] sm:text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{lang === 'ro' ? 'Livrare pe loc' : 'Быстрая доставка'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{lang === 'ro' ? 'Rezervare 30 min' : 'Резерв за 30 мин'}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{lang === 'ro' ? 'Plată la primire' : 'Оплата при получении'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200/90 text-sm font-medium shadow-xs focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <CategoryFilter
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          lang={lang}
        />

        {/* Results Info */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            {filteredProducts.length}{' '}
            {lang === 'ro' ? 'produse găsite' : 'товаров найдено'}
          </span>
          <button
            onClick={() => setIsCalcOpen(true)}
            className="text-amber-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>{t.calculatorBtn}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.map((product) => {
            const inCart = cart.find((i) => i.product.id === product.id);
            return (
              <ProductCard
                key={product.id}
                product={product}
                lang={lang}
                onAddToCart={handleAddToCart}
                cartQuantity={inCart ? inCart.quantity : 0}
              />
            );
          })}
        </div>
      </main>

      {/* Footer with Legal Information */}
      <footer className="max-w-6xl mx-auto px-4 w-full mt-6 border-t border-slate-200 py-6 text-center text-xs text-slate-500 space-y-1">
        <p className="font-bold text-slate-700">
          {lang === 'ro' ? 'Depozit & Magazin „La Plopi”' : 'Склад-магазин «La Plopi»'} • or. Cricova, str. Dumitru Călin
        </p>
        <p className="font-mono text-[11px] text-slate-400">
          S.R.L. „OLVALCONS GRUP” • IDNO: 1009600018315
        </p>
      </footer>

      {/* Floating Bottom Bar for Mobile when cart has items */}
      {cartTotalItems > 0 && (
        <div className="fixed bottom-3 inset-x-3 sm:hidden z-40 animate-in slide-in-from-bottom duration-300">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                {cartTotalItems}
              </span>
              <span className="font-bold text-sm">
                {lang === 'ro' ? 'Vezi comanda' : 'Посмотреть заказ'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-extrabold text-sm">
                {cartSubtotal} {t.priceCurrency}
              </span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </div>
          </button>
        </div>
      )}

      {/* Modals */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        lang={lang}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onOpen1CDemo={handleOpen1CDemoFromCart}
      />

      <MaterialCalculatorModal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
        lang={lang}
        onAddMultipleToCart={handleAddMultipleToCart}
      />

      <Sync1CModal
        isOpen={is1COpen}
        onClose={() => setIs1COpen(false)}
        lang={lang}
        sampleOrder={demoOrder}
      />
    </div>
  );
};

export default App;
