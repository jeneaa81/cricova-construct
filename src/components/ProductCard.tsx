import React, { useState } from 'react';
import { Plus, Check, Tag, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import type { Product, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface ProductCardProps {
  product: Product;
  lang: Language;
  onAddToCart: (product: Product, quantity: number) => void;
  cartQuantity: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  lang,
  onAddToCart,
  cartQuantity,
}) => {
  const [justAdded, setJustAdded] = useState(false);
  const t = TRANSLATIONS[lang];

  const title = lang === 'ro' ? product.name_ro : product.name_ru;
  const description = lang === 'ro' ? product.description_ro : product.description_ru;
  const unit = lang === 'ro' ? product.unit_ro : product.unit_ru;

  const handleAdd = () => {
    onAddToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  // Stock status styling & label
  const stockLevel = product.stockLevel || (product.stockCount > 20 ? 'high' : product.stockCount > 5 ? 'medium' : 'low');

  const renderStockBadge = () => {
    if (stockLevel === 'low') {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-600/95 text-white text-[10px] font-bold shadow-xs">
          <AlertTriangle className="w-3 h-3 text-rose-200" />
          <span>{t.stockLow}</span>
          <span className="opacity-80">({product.stockCount})</span>
        </div>
      );
    }
    if (stockLevel === 'medium') {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/95 text-slate-950 text-[10px] font-bold shadow-xs">
          <AlertCircle className="w-3 h-3 text-slate-900" />
          <span>{t.stockMedium}</span>
          <span className="opacity-80">({product.stockCount})</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-semibold shadow-xs">
        <CheckCircle2 className="w-3 h-3 text-emerald-200" />
        <span>{t.stockHigh}</span>
      </div>
    );
  };

  return (
    <div className="group flex flex-col justify-between bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Product Image & Badges */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <img
          src={product.image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* 1C Code Badge - Top Right */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/85 text-amber-300 font-mono text-[10px] font-semibold backdrop-blur-xs shadow-xs">
          <Tag className="w-2.5 h-2.5 text-amber-400" />
          <span>{product.code1C}</span>
        </div>

        {/* Stock Badge - Bottom Left (never overlaps with 1C code) */}
        <div className="absolute bottom-2 left-2 z-10 backdrop-blur-xs">
          {renderStockBadge()}
        </div>

        {/* Subtle shadow gradient at bottom of image for badge contrast */}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-grow justify-between gap-2.5">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-extrabold text-slate-900">
                {product.price}
              </span>
              <span className="text-xs font-bold text-amber-600">
                {t.priceCurrency}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block">
              / {unit}
            </span>
          </div>

          <button
            onClick={handleAdd}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : cartQuantity > 0
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span className="hidden xs:inline">{t.addedToCart}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>
                  {cartQuantity > 0 ? `${cartQuantity}` : t.addToCart}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
