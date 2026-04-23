import { useNavigate } from '@tanstack/react-router';
import { ShoppingCart } from 'lucide-react';
import { useCartStore, useUIStore } from '#/lib/store';
import { getTranslation } from '#/lib/i18n/translations';
import { formatPrice } from '#/lib/utils';

export function FloatingCartBar() {
  const navigate = useNavigate();
  const { items, getTotal } = useCartStore();
  const { language } = useUIStore();
  const t = getTranslation(language);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = getTotal();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <button
        onClick={() => navigate({ to: '/cart' })}
        className="w-full max-w-4xl mx-auto flex items-center justify-between bg-gray-900 hover:bg-gray-800 active:bg-black text-white rounded-xl px-5 py-3.5 shadow-lg shadow-gray-900/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingCart size={20} />
            <span className="absolute -top-2 -right-2.5 bg-white text-gray-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          </div>
          <span className="font-semibold text-base">{t.viewCart}</span>
        </div>
        <span className="font-bold text-base">{formatPrice(total)}</span>
      </button>
    </div>
  );
}
