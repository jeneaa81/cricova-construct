import React from 'react';
import { Layers, Package, Box, Paintbrush, Wrench, Pipette, Hammer } from 'lucide-react';
import type { Category, Language } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  lang: Language;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Layers: <Layers className="w-4 h-4" />,
  Package: <Package className="w-4 h-4" />,
  Box: <Box className="w-4 h-4" />,
  Paintbrush: <Paintbrush className="w-4 h-4" />,
  Wrench: <Wrench className="w-4 h-4" />,
  Pipette: <Pipette className="w-4 h-4" />,
  Hammer: <Hammer className="w-4 h-4" />,
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  lang,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex items-center gap-2 min-w-max pb-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const label = lang === 'ro' ? cat.name_ro : cat.name_ru;
          const icon = ICON_MAP[cat.iconName] || <Layers className="w-4 h-4" />;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-amber-400 shadow-md ring-2 ring-slate-900'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
              }`}
            >
              <span className={isSelected ? 'text-amber-400' : 'text-slate-500'}>
                {icon}
              </span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
