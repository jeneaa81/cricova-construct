import React, { useState } from 'react';
import { X, Calculator, Plus, CheckCircle, ArrowRight } from 'lucide-react';
import type { Language, Product } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { PRODUCTS } from '../data/products';

interface MaterialCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onAddMultipleToCart: (items: { product: Product; quantity: number }[]) => void;
}

type CalcType = 'adhesive' | 'plaster' | 'drywall';

export const MaterialCalculatorModal: React.FC<MaterialCalculatorModalProps> = ({
  isOpen,
  onClose,
  lang,
  onAddMultipleToCart,
}) => {
  const [calcType, setCalcType] = useState<CalcType>('adhesive');
  const [area, setArea] = useState<number>(20); // m2
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!isOpen) return null;

  const t = TRANSLATIONS[lang];

  // Calculations
  let resultText = '';
  let itemsToAdd: { product: Product; quantity: number }[] = [];

  const cm11Product = PRODUCTS.find((p) => p.id === 'prod-2')!; // Ceresit CM11
  const eurogipsProduct = PRODUCTS.find((p) => p.id === 'prod-3')!; // Supraten Eurogips
  const knaufProduct = PRODUCTS.find((p) => p.id === 'prod-5')!; // Knauf standard
  const profileProduct = PRODUCTS.find((p) => p.id === 'prod-7')!; // CD 60

  if (calcType === 'adhesive') {
    // 4.5 kg / m2, 25kg bag = ~5.5 m2 per bag
    const bags = Math.max(1, Math.ceil((area * 4.5) / 25));
    const cost = bags * cm11Product.price;
    resultText = `${bags} ${lang === 'ro' ? 'saci Ceresit CM11 (25kg)' : 'мешков Ceresit CM11 (25кг)'} • ~${cost} MDL`;
    itemsToAdd = [{ product: cm11Product, quantity: bags }];
  } else if (calcType === 'plaster') {
    // 9 kg / m2 per 10mm layer, 25kg bag = ~2.7 m2 per bag
    const bags = Math.max(1, Math.ceil((area * 9.5) / 25));
    const cost = bags * eurogipsProduct.price;
    resultText = `${bags} ${lang === 'ro' ? 'saci Supraten Eurogips (25kg)' : 'мешков Supraten Eurogips (25кг)'} • ~${cost} MDL`;
    itemsToAdd = [{ product: eurogipsProduct, quantity: bags }];
  } else if (calcType === 'drywall') {
    // 3 m2 per sheet + 10% reserve
    const sheets = Math.max(1, Math.ceil((area * 1.1) / 3));
    const profiles = Math.max(2, Math.ceil(sheets * 2.5));
    const cost = sheets * knaufProduct.price + profiles * profileProduct.price;
    resultText = `${sheets} ${lang === 'ro' ? 'foi gips-carton Knauf' : 'листов гипсокартона Knauf'} + ${profiles} ${lang === 'ro' ? 'profile CD 60' : 'профилей CD 60'} • ~${cost} MDL`;
    itemsToAdd = [
      { product: knaufProduct, quantity: sheets },
      { product: profileProduct, quantity: profiles },
    ];
  }

  const handleApply = () => {
    onAddMultipleToCart(itemsToAdd);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Calculator className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {t.calcTitle}
              </h2>
              <p className="text-xs text-slate-500">{t.calcSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            onClick={() => setCalcType('adhesive')}
            className={`p-2.5 rounded-xl text-xs font-semibold text-center transition cursor-pointer ${
              calcType === 'adhesive'
                ? 'bg-slate-900 text-amber-400 shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {lang === 'ro' ? 'Adeziv gresie' : 'Клей для плитки'}
          </button>
          <button
            onClick={() => setCalcType('plaster')}
            className={`p-2.5 rounded-xl text-xs font-semibold text-center transition cursor-pointer ${
              calcType === 'plaster'
                ? 'bg-slate-900 text-amber-400 shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {lang === 'ro' ? 'Tencuială ipsos' : 'Штукатурка'}
          </button>
          <button
            onClick={() => setCalcType('drywall')}
            className={`p-2.5 rounded-xl text-xs font-semibold text-center transition cursor-pointer ${
              calcType === 'drywall'
                ? 'bg-slate-900 text-amber-400 shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {lang === 'ro' ? 'Gips-carton' : 'Гипсокартон'}
          </button>
        </div>

        {/* Slider / Input for Area */}
        <div className="mt-5 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-amber-950 uppercase tracking-wider">
              {lang === 'ro' ? 'Suprafața de lucru (m²)' : 'Площадь работ (м²)'}
            </label>
            <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-amber-300 font-bold text-slate-900 text-sm">
              <span>{area}</span>
              <span className="text-xs text-slate-400">m²</span>
            </div>
          </div>

          <input
            type="range"
            min="2"
            max="150"
            step="1"
            value={area}
            onChange={(e) => setArea(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-500 mt-1">
            <span>2 m² (baie mică)</span>
            <span>50 m²</span>
            <span>150 m² (casă/fațadă)</span>
          </div>
        </div>

        {/* Result Box */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">
              {t.needBags}
            </div>
            <div className="text-sm sm:text-base font-bold mt-0.5 text-slate-100">
              {resultText}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5">
          <button
            onClick={handleApply}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              addedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md'
            }`}
          >
            {addedSuccess ? (
              <>
                <CheckCircle className="w-5 h-5 text-white" />
                <span>{lang === 'ro' ? 'Adăugat în coș!' : 'Добавлено в корзину!'}</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>{t.addCalculatedToCart}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
