export type Language = 'ro' | 'ru';

export type StockLevel = 'high' | 'medium' | 'low';

export interface Product {
  id: string;
  name_ro: string;
  name_ru: string;
  category: string;
  price: number; // in MDL
  unit_ro: string; // sac, buc, m², litru, kg
  unit_ru: string;
  code1C: string;
  inStock: boolean;
  stockCount: number;
  stockLevel?: StockLevel;
  image: string;
  description_ro: string;
  description_ru: string;
  weightKg?: number;
}

export interface Category {
  id: string;
  name_ro: string;
  name_ru: string;
  iconName: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type DeliveryZone = 'cricova' | 'stauceni_ciorescu' | 'goian_fauresti' | 'pickup';

export interface OrderData {
  items: CartItem[];
  customerName: string;
  phone: string;
  deliveryType: 'pickup' | 'delivery';
  deliveryZone: DeliveryZone;
  address: string;
  paymentMethod: 'cash' | 'mia_instant';
  notes: string;
  subtotal: number;
  deliveryCost: number;
  total: number;
  createdAt: string;
}
