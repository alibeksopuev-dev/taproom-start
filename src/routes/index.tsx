import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '#/components/Header/Header'
import { CategoryButton } from '#/components/CategoryButton/CategoryButton'
import { SearchBar } from '#/components/SearchBar/SearchBar'
import { ProductCard } from '#/components/ProductCard/ProductCard'
import { FloatingCartBar } from '#/components/FloatingCartBar/FloatingCartBar'
import { Button } from '#/components/ui/button'
import { useUIStore } from '#/lib/store'
import { getTranslation } from '#/lib/i18n/translations'
import { menuQueryOptions } from '#/queries/menu'
import { Wifi, Copy, Check, Loader2 } from 'lucide-react'

const searchSchema = z.object({
  search: z.string().optional(),
})

export const Route = createFileRoute('/')({
  validateSearch: (search) => searchSchema.parse(search),
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(menuQueryOptions()),
  component: Home,
})

function Home() {
  const { language } = useUIStore()
  const t = getTranslation(language)
  const { search } = Route.useSearch()
  const navigate = useNavigate({ from: '/' })
  const [inputValue, setInputValue] = useState(search || '')
  const [copied, setCopied] = useState(false)

  const { data, isLoading, error } = useQuery(menuQueryOptions())

  useEffect(() => {
    setInputValue(search || '')
  }, [search])

  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputValue !== (search || '')) {
        navigate({ search: inputValue ? { search: inputValue } : { search: undefined } })
      }
    }, 500)
    return () => clearTimeout(handler)
  }, [inputValue, search, navigate])

  const sortedCategories = useMemo(
    () =>
      (data?.categories || [])
        .sort((a, b) => a.order - b.order)
        .map((cat, idx) => ({ ...cat, order: idx + 1 })),
    [data?.categories]
  )

  const searchResults = useMemo(() => {
    if (!search || !data?.menuItems) return []
    const q = search.toLowerCase()
    return data.menuItems.filter((p) => p.name.toLowerCase().includes(q))
  }, [search, data?.menuItems])

  const copyWifiPassword = () => {
    navigator.clipboard.writeText('asanaki81')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <SearchBar value={inputValue} onChange={setInputValue} placeholder={t.searchPlaceholder} />
        </div>

        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load menu</p>
          </div>
        ) : search ? (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {isLoading ? 'Searching...' : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`}
            </h2>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid gap-4">
                {searchResults.map((product) => (
                  <ProductCard key={product.id} product={product} language={language} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found for &ldquo;{search}&rdquo;</p>
              </div>
            )}
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="flex flex-col border-t border-[#C9C6C6] mb-4">
            {sortedCategories.map((category) => (
              <CategoryButton key={category.id} category={category} language={language} />
            ))}
          </div>
        )}

        <div className="flex flex-col items-center gap-2 mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100/80 px-4 py-3 rounded-xl border border-gray-200/50 max-w-fit">
            <Wifi size={16} className="text-gray-500" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="font-medium">{t.wifiNetwork}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-mono text-xs">{t.wifiPassword}</span>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5 hover:bg-white" onClick={copyWifiPassword}>
                  {copied ? (
                    <><Check size={12} className="text-green-600" /><span className="text-green-600 font-medium">{t.copied}</span></>
                  ) : (
                    <><Copy size={12} className="text-gray-400" /><span className="text-gray-500">Copy</span></>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-4 border-t border-gray-200 pt-2">
          <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-12 text-gray-600">
            <div className="flex-1 space-y-2">
              <p className="text-xs text-gray-800">{t.footerMessage}</p>
              <div className="text-xs flex flex-wrap items-center gap-x-1">
                <span>{t.reviewsOn}</span>
                <a href="https://maps.app.goo.gl/W4c2ypuTR89VKKps7" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-gray-900">Google Maps</a>
                <span className="mx-1">/</span>
                <span>{t.newsOn}</span>
                <a href="https://www.instagram.com/81.taproom" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-gray-900">Instagram</a>
              </div>
            </div>
          </div>
          <div className="pt-4">
            <p className="text-xs text-gray-400">81 Taproom — 23 Mai Thúc Lân, Đà Nẵng, Việt Nam</p>
          </div>
        </footer>
      </main>
      <FloatingCartBar />
    </div>
  )
}
