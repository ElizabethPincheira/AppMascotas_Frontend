export interface DeliveryStore {
  id: string | number;
  name: string;
  slug: string;
  slogan: string;
  region: string;
  provincia: string;
  comuna: string;
  address: string;
  eta: string;
  schedule: string;
  deliveryFee: string;
  rating: number;
  coverage: string[];
  categories: string[];
  highlight: string;
  description: string;
  heroImage: string;
  gallery: string[];
  products: StoreProduct[];
  weeklySchedule: StoreScheduleEntry[];
}

export interface StoreProduct {
  id: number;
  productoId: string;
  name: string;
  category: string;
  price: string;
  priceValue: number;
  unidadVenta: 'unidad' | 'kilo';
  image: string;
  description: string;
  disponible: boolean;
  stock?: number;
  tags: string[];
}

export interface StoreScheduleEntry {
  dia: string;
  abierto: boolean;
  apertura?: string;
  cierre?: string;
}
