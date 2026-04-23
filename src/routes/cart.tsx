import { createFileRoute, Link } from '@tanstack/react-router'
import { ShoppingCart } from 'lucide-react'
import { Header } from '#/components/Header/Header'
import { CartItem } from '#/components/CartItem/CartItem'
import { CartSummary } from '#/components/CartSummary/CartSummary'
import { Button } from '#/components/ui/button'
import { useCartStore, useUIStore } from '#/lib/store'
import { getTranslation } from '#/lib/i18n/translations'

export const Route = createFileRoute('/cart')({
  component: Cart,
})

function Cart() {
  const { items } = useCartStore()
  const { language } = useUIStore()
  const t = getTranslation(language)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.checkout}</h2>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ShoppingCart size={64} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">{t.emptyCart}</h3>
            <p className="text-gray-500 mb-6">{t.emptyCartMessage}</p>
            <Link to="/">
              <Button size="lg" className="min-h-[48px]">{t.browseMenu}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <CartItem key={`${item.product.id}-${item.selectedSize}`} item={item} language={language} />
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <CartSummary language={language} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
