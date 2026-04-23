import { Plus, Check, ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '#/components/ui/button';
import { Badge } from '#/components/ui/badge';
import { Card } from '#/components/ui/card';
import type { Product, BeerSize } from '#/types/menu';
import type { Language } from '#/types/i18n';
import { useCartStore } from '#/lib/store';
import { getTranslation } from '#/lib/i18n/translations';
import { formatPrice } from '#/lib/utils';
import {
  productCardStyles,
  productNameStyles,
  productDescriptionStyles,
  productPriceStyles,
  productMetadataStyles,
  metadataBadgeStyles,
} from './product-card.styles';

interface ProductCardProps {
  product: Product;
  language: Language;
}

export function ProductCard({ product, language }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const t = getTranslation(language);

  // Use first available size as default if prices exist
  const defaultSize = product.prices && product.prices.length > 0
    ? product.prices[0].size
    : undefined;

  const [selectedSize, setSelectedSize] = useState<BeerSize | undefined>(defaultSize);
  const [wasAdded, setWasAdded] = useState(false);
  const [showImage, setShowImage] = useState(false);

  // Update selected size when product changes
  useEffect(() => {
    if (product.prices && product.prices.length > 0) {
      setSelectedSize(product.prices[0].size);
    }
  }, [product]);

  const getProductName = () => {
    return product.name;
  };

  const getProductDescription = () => {
    switch (language) {
      case 'vi':
        return product.descriptionVi || product.description;
      case 'ja':
        return product.descriptionJa || product.description;
      case 'ko':
        return product.descriptionKo || product.description;
      default:
        return product.description;
    }
  };

  const hasSizes = product.prices && product.prices.length > 0;

  const getDisplayPrice = () => {
    if (hasSizes && selectedSize) {
      const selectedPrice = product.prices!.find(p => p.size === selectedSize);
      if (selectedPrice) {
        return selectedPrice.price;
      }
    }
    return product.price;
  };

  const handleAddToCart = () => {
    if (hasSizes && selectedSize) {
      addItem(product, selectedSize);
    } else {
      addItem(product);
    }

    setWasAdded(true);
    setTimeout(() => setWasAdded(false), 400);
  };

  const hasImage = !!product.image_url;

  return (
    <Card className={productCardStyles()}>
      <div className="flex flex-col h-full">
        {/* Name row with optional photo toggle */}
        <div className="flex items-start justify-between gap-2">
          <h3 className={productNameStyles()}>{getProductName()}</h3>
          {hasImage && (
            <button
              type="button"
              onClick={() => setShowImage(!showImage)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors shrink-0 mt-0.5"
            >
              <ImageIcon size={14} />
              <span className="underline underline-offset-2">{showImage ? 'Hide' : 'Photo'}</span>
            </button>
          )}
        </div>

        {/* Expandable image */}
        {hasImage && showImage && (
          <div className="mt-2 mb-3 rounded-lg overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {product.subcategory && (
          <div className="mb-2">
            <Badge variant="outline" className="text-xs">
              {product.subcategory}
            </Badge>
          </div>
        )}

        <p className={productDescriptionStyles()}>
          {getProductDescription()}
        </p>

        {/* Metadata - Generic renderer for all custom fields */}
        {product.metadata && (
          <div className={productMetadataStyles()}>
            {/* Beer metadata: IBU and ABV */}
            {product.metadata.beer && (
              <>
                {product.metadata.beer.ibu > 0 && (
                  <span className={metadataBadgeStyles()}>
                    IBU {product.metadata.beer.ibu}
                  </span>
                )}
                {product.metadata.beer.abv > 0 && (
                  <span className={metadataBadgeStyles()}>
                    ABV {product.metadata.beer.abv}%
                  </span>
                )}
              </>
            )}

            {/* Wine metadata: country, region, grapeVariety, style */}
            {product.metadata.wine && (
              <>
                {product.metadata.wine.country && (
                  <span className={metadataBadgeStyles()}>
                    {product.metadata.wine.country}
                  </span>
                )}
                {product.metadata.wine.region && (
                  <span className={metadataBadgeStyles()}>
                    {product.metadata.wine.region}
                  </span>
                )}
                {product.metadata.wine.grapeVariety && (
                  <span className={metadataBadgeStyles()}>
                    {product.metadata.wine.grapeVariety}
                  </span>
                )}
                {product.metadata.wine.style && (
                  <span className={metadataBadgeStyles()}>
                    {product.metadata.wine.style}
                  </span>
                )}
              </>
            )}

            {/* Tags */}
            {product.metadata.tags && product.metadata.tags.map((tag, idx) => (
              <span key={idx} className={metadataBadgeStyles()}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Raw custom metadata - render any other fields not handled above */}
        {product.rawMetadata && (
          <div className={productMetadataStyles()}>
            {Object.entries(product.rawMetadata).map(([key, value]) => {
              // Skip fields that are already rendered in structured metadata
              const skipFields = new Set(['ibu', 'abv', 'region', 'country', 'grapeVariety', 'grape_variety', 'style', 'wine_region', 'wine_country', 'wine_style', 'tags']);

              if (skipFields.has(key) || value === null || value === undefined) {
                return null;
              }

              // Format the display value
              const displayValue = typeof value === 'object'
                ? JSON.stringify(value)
                : String(value);

              return (
                <span key={key} className={metadataBadgeStyles()}>
                  {key}: {displayValue}
                </span>
              );
            })}
          </div>
        )}

        {/* Size Selection */}
        {product.prices && product.prices.length > 0 && selectedSize && (
          <div className="mt-1 mb-3">
            <p className="text-sm font-medium mb-2">{t.selectSize}:</p>
            <div className="flex flex-row flex-wrap gap-2">
              {product.prices.map((priceOption) => (
                <Button
                  key={priceOption.id}
                  variant={selectedSize === priceOption.size ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSize(priceOption.size)}
                  className="flex-1 min-h-[44px] whitespace-normal h-auto py-2 text-xs"
                >
                  {priceOption.size} - {formatPrice(priceOption.price)}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 flex-wrap">
          <span className={productPriceStyles()}>{formatPrice(getDisplayPrice())}</span>
          <Button
            onClick={handleAddToCart}
            size="sm"
            className={`min-h-[44px] px-4 transition-all duration-150 ${wasAdded ? 'bg-green-600 hover:bg-green-700 text-white' : ''
              }`}
            disabled={wasAdded}
          >
            {wasAdded ? (
              <>
                <Check size={16} className="mr-1" />
                {t.added}
              </>
            ) : (
              <>
                <Plus size={16} className="mr-1" />
                {t.addToCart}
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
