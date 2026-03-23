export interface DeliveryStore {
  id: number;
  name: string;
  region: string;
  provincia: string;
  comuna: string;
  address: string;
  eta: string;
  schedule: string;
  coverage: string[];
  categories: string[];
  highlight: string;
}
