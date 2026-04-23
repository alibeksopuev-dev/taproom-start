import { Minus, Plus, X } from 'lucide-react';
import { Button } from '#/components/ui/button';
import { Card } from '#/components/ui/card';
import { Badge } from '#/components/ui/badge';
import type { CartItem as CartItemType } from '#/types/menu';
import type { Language } from '#/types/i18n';
import { useCartStore } from '#/lib/store';
import { getTranslation } from '#/lib/i18n/translations';
import { formatPrice } from '#/lib/utils';

interface CartItemProps {
  item: CartItemType;
  language: Language;
}

export function CartItem({ item, language }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();
  const t = getTranslation(language);

  const getProductName = () => {
    // Names are not translated, always return the English name
    return item.product.name;
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.product.id, item.quantity - 1, item.selectedSize);
    } else {
      removeItem(item.product.id, item.selectedSize);
    }
  };

  const handleIncrease = () => {
    updateQuantity(item.product.id, item.quantity + 1, item.selectedSize);
  };

  const handleRemove = () => {
    removeItem(item.product.id, item.selectedSize);
  };

  // Calculate item price based on selected size for beers
  let itemPrice = item.product.price;

  if (item.selectedSize && item.product.prices && item.product.prices.length > 0) {
    const sizePrice = item.product.prices.find(p => p.size === item.selectedSize);
    if (sizePrice) {
      itemPrice = sizePrice.price;
    }
  }

  const itemTotal = itemPrice * item.quantity;

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">{getProductName()}</h3>
              {item.selectedSize && (
                <Badge variant="outline" className="mt-1 text-xs">
                  {t.size}: {item.selectedSize}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
            >
              <X size={18} />
            </Button>
          </div>

          <p className="text-sm text-gray-600 mb-3">
            {formatPrice(itemPrice)} × {item.quantity}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDecrease}
                className="h-9 w-9 p-0"
              >
                <Minus size={16} />
              </Button>

              <span className="min-w-[3ch] text-center font-semibold">
                {item.quantity}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleIncrease}
                className="h-9 w-9 p-0"
              >
                <Plus size={16} />
              </Button>
            </div>

            <div className="text-lg font-bold text-gray-900">
              {formatPrice(itemTotal)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
