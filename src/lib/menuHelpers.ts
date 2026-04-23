import type { Product, Category, ProductPrice } from '#/types/menu';

export interface DbPrice {
  id: string;
  size: string;
  price: number;
  menu_item_id: string;
}

export interface DbCategory {
  id: string;
  slug: string;
  name: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  translations?: Record<string, Record<string, string>>;
}

export interface DbMenuItem {
  id: string;
  name: string;
  description: string | null;
  subcategory: string | null;
  category_id: string;
  organization_id: string;
  is_disabled: boolean;
  image_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  price_per_size: DbPrice[];
  category?: DbCategory;
  translations?: Record<string, Record<string, string>>;
}

const CATEGORY_ORDER = [
  'craft-beer', 'beers', 'snacks', 'drinks', 'wines',
  'bottles-cans', 'bottles', 'cans', 'cans-and-bottles',
];

export function toFrontendCategory(db: DbCategory, index: number): Category {
  let order = CATEGORY_ORDER.indexOf(db.slug);
  if (order === -1) order = 100 + index;
  return {
    id: db.slug,
    name: db.name,
    nameVi: db.translations?.vi?.name || db.name,
    nameJa: db.translations?.ja?.name || db.name,
    nameKo: db.translations?.ko?.name || db.name,
    icon: getCategoryIcon(db.slug),
    order,
  };
}

function getCategoryIcon(slug: string): string {
  const icons: Record<string, string> = {
    'beers': '🍺',
    'craft-beer': '🍺',
    'snacks': '🍽️',
    'drinks': '🍷',
    'wines': '🍾',
    'bottles': '🥫',
    'bottles-cans': '🥫',
  };
  return icons[slug] || '📦';
}

export function toFrontendProduct(db: DbMenuItem, categorySlug: string): Product {
  const prices: ProductPrice[] = db.price_per_size
    .map((p) => ({ id: p.id, size: p.size, price: p.price }))
    .sort((a, b) => a.price - b.price);

  const defaultPrice = prices.length > 0 ? prices[0].price : 0;
  const meta = db.metadata as Record<string, unknown> | null;

  return {
    id: db.id,
    name: db.name,
    description: db.description ?? '',
    descriptionVi: db.translations?.vi?.description,
    descriptionJa: db.translations?.ja?.description,
    descriptionKo: db.translations?.ko?.description,
    price: defaultPrice,
    category: categorySlug,
    subcategory: db.subcategory ?? undefined,
    metadata: buildProductMetadata(meta),
    rawMetadata: meta || undefined,
    prices: prices.length > 0 ? prices : undefined,
    image_url: db.image_url ?? undefined,
  };
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

function buildProductMetadata(meta?: Record<string, unknown> | null): Product['metadata'] {
  const result: Product['metadata'] = {};

  const ibu = parseNumber(meta?.ibu);
  const abv = parseNumber(meta?.abv);
  if (ibu !== undefined || abv !== undefined) {
    result.beer = { ibu: ibu ?? 0, abv: abv ?? 0 };
  }

  const region = (meta?.region || meta?.wine_region) as string | undefined;
  const country = (meta?.country || meta?.wine_country) as string | undefined;
  const grapeVariety = (meta?.grapeVariety || meta?.grape_variety) as string | undefined;
  const style = (meta?.style || meta?.wine_style) as string | undefined;
  if (region || country || grapeVariety || style) {
    result.wine = { region: region ?? '', country: country ?? '', grapeVariety, style };
  }

  if (meta?.tags && Array.isArray(meta.tags)) {
    result.tags = meta.tags as string[];
  }

  return Object.keys(result).length > 0 ? result : undefined;
}
