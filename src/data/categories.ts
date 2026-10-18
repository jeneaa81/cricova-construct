import type { Category } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'all', name_ro: 'Toate produsele', name_ru: 'Все товары', iconName: 'Layers' },
  { id: 'ciment', name_ro: 'Ciment & Amestecuri', name_ru: 'Цемент и смеси', iconName: 'Package' },
  { id: 'gipscarton', name_ro: 'Gips-carton & Profile', name_ru: 'Гипсокартон и профили', iconName: 'Box' },
  { id: 'vopsele', name_ro: 'Vopsele & Grunduri', name_ru: 'Краски и грунтовки', iconName: 'Paintbrush' },
  { id: 'suruburi', name_ro: 'Fixare & Șuruburi', name_ru: 'Крепеж и метизы', iconName: 'Wrench' },
  { id: 'instalatii', name_ro: 'Instalații sanitare', name_ru: 'Сантехника и трубы', iconName: 'Pipette' },
  { id: 'unelte', name_ro: 'Unelte & Protecție', name_ru: 'Инструмент и защита', iconName: 'Hammer' },
];
