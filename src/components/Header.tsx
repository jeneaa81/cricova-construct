import React from 'react';
import { ShoppingCart, Phone, Globe, Database, MapPin, Calculator } from 'lucide-react';
import type { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenCalculator: () => void;
  onOpen1CModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  cartCount,
  onOpenCart,
  onOpenCalculator,
  onOpen1CModal,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top micro-bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-amber-400 font-medium">
            <MapPin className="w-3.5 h-3.5" />
            <span>{t.locationBadge}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpen1CModal}
              className="flex items-center gap-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline font-mono">{t.howItWorks1C}</span>
            </button>

            <button
              onClick={onToggleLang}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-semibold transition cursor-pointer"
              title="Schimbă limba / Сменить язык"
            >
              <Globe className="w-3 h-3 text-amber-400" />
              <span>{lang.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-7 bg-amber-500 rounded-sm"></span>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
                {t.storeName}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                {t.storeSubtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Calculator Quick Action */}
          <button
            onClick={onOpenCalculator}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs sm:text-sm font-semibold border border-amber-200 transition shadow-xs cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-amber-600" />
            <span className="hidden md:inline">{t.calculatorBtn}</span>
          </button>

          {/* Quick Call */}
          <a
            href="tel:+37322000000"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium transition"
          >
            <Phone className="w-4 h-4 text-emerald-600" />
            <span className="hidden lg:inline">{t.phoneCall}</span>
          </a>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition shadow-sm cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'ro' ? 'Coș' : 'Корзина'}</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-950 text-amber-400 text-xs font-bold shadow">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
