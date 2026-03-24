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
}

export interface StoreProduct {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
  description: string;
  tags: string[];
}
