import type { CartItem } from '#/types/menu';
import type { Language } from '#/types/i18n';
import { getTranslation } from '#/lib/i18n/translations';
import { formatPrice } from '#/lib/utils';

const WHATSAPP_PHONE = '+84367871781';

export function generateWhatsAppMessage(cartItems: CartItem[], orderNotes: string, language: Language): string {
  const t = getTranslation(language);
  let message = `${t.newOrder}\n\n`;

  cartItems.forEach((item, index) => {
    const { product, quantity, selectedSize } = item;
    let itemPrice = product.price;
    if (selectedSize && product.prices?.length) {
      const sp = product.prices.find((p) => p.size === selectedSize);
      if (sp) itemPrice = sp.price;
    }
    const sizeInfo = selectedSize ? ` (${selectedSize}L)` : '';
    message += `${index + 1}. ${product.name}${sizeInfo}\n`;
    message += `   ${quantity}x × ${formatPrice(itemPrice)} = ${formatPrice(itemPrice * quantity)}\n\n`;
  });

  const total = cartItems.reduce((sum, item) => {
    let price = item.product.price;
    if (item.selectedSize && item.product.prices?.length) {
      const sp = item.product.prices.find((p) => p.size === item.selectedSize);
      if (sp) price = sp.price;
    }
    return sum + price * item.quantity;
  }, 0);

  message += `${t.total}: ${formatPrice(total)}\n`;
  if (orderNotes.trim()) message += `\n${t.notes}: ${orderNotes}\n`;
  return message;
}

export function sendToWhatsApp(cartItems: CartItem[], orderNotes: string, language: Language, clearCart: () => void): void {
  const message = generateWhatsAppMessage(cartItems, orderNotes, language);
  const phoneNumber = WHATSAPP_PHONE.replace('+', '');
  window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  clearCart();
}
