export type CategoryId = string;

export interface BeerMetadata {
  ibu: number;
  abv: number;
}

export interface WineMetadata {
  region: string;
  country: string;
  grapeVariety?: string;
  style?: string;
}

export interface ProductMetadata {
  beer?: BeerMetadata;
  wine?: WineMetadata;
  tags?: string[];
}

export interface ProductPrice {
  id: string;
  size: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  nameVi?: string;
  nameJa?: string;
  nameKo?: string;
  description: string;
  descriptionVi?: string;
  descriptionJa?: string;
  descriptionKo?: string;
  price: number;
  category: CategoryId;
  metadata?: ProductMetadata;
  rawMetadata?: Record<string, unknown>;
  subcategory?: string;
  prices?: ProductPrice[];
  image_url?: string;
}

export type BeerSize = string;

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: BeerSize;
}

export interface Category {
  id: CategoryId;
  name: string;
  nameVi: string;
  nameJa: string;
  nameKo: string;
  icon: string;
  order: number;
}
