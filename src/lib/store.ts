import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, BeerSize } from '#/types/menu';
import type { Language } from '#/types/i18n';

interface CartState {
  items: CartItem[];
  orderNotes: string;
  addItem: (product: Product, selectedSize?: BeerSize) => void;
  removeItem: (productId: string, selectedSize?: BeerSize) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: BeerSize) => void;
  setOrderNotes: (notes: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      orderNotes: '',

      addItem: (product, selectedSize) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.product.id === product.id && item.selectedSize === selectedSize
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id && item.selectedSize === selectedSize
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { items: [...state.items, { product, quantity: 1, selectedSize }] };
        });
      },

      removeItem: (productId, selectedSize) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.selectedSize === selectedSize)
          ),
        }));
      },

      updateQuantity: (productId, quantity, selectedSize) => {
        if (quantity <= 0) {
          get().removeItem(productId, selectedSize);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId && item.selectedSize === selectedSize
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      setOrderNotes: (notes) => set({ orderNotes: notes }),
      clearCart: () => set({ items: [], orderNotes: '' }),

      getTotal: () => {
        return get().items.reduce((total, item) => {
          let price = item.product.price;
          if (item.selectedSize && item.product.prices?.length) {
            const sp = item.product.prices.find((p) => p.size === item.selectedSize);
            if (sp) price = sp.price;
          }
          return total + price * item.quantity;
        }, 0);
      },

      getItemCount: () => get().items.reduce((count, item) => count + item.quantity, 0),
    }),
    { name: 'taproom-cart' }
  )
);

interface UIState {
  language: Language;
  searchQuery: string;
  setLanguage: (language: Language) => void;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      language: 'en',
      searchQuery: '',
      setLanguage: (language) => set({ language }),
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    { name: 'taproom-ui' }
  )
);
