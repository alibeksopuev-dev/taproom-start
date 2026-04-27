import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Header } from '#/components/Header/Header'
import { SearchBar } from '#/components/SearchBar/SearchBar'
import { ProductCard } from '#/components/ProductCard/ProductCard'
import { FloatingCartBar } from '#/components/FloatingCartBar/FloatingCartBar'
import { useUIStore } from '#/lib/store'
import { getTranslation } from '#/lib/i18n/translations'
import { menuQueryOptions } from '#/queries/menu'
import type { Product } from '#/types/menu'

const searchSchema = z.object({
  search: z.string().optional(),
})

export const Route = createFileRoute('/category/$categoryId')({
  validateSearch: (search) => searchSchema.parse(search),
  loader: async ({ params, context: { queryClient } }) => {
    const data = await queryClient.ensureQueryData(menuQueryOptions())
    const category = data.categories.find((c) => c.id === params.categoryId)
    return { categoryName: category?.name ?? null }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.categoryName
          ? `${loaderData.categoryName} — 81 Taproom`
          : '81 Taproom',
      },
      {
        name: 'description',
        content: loaderData?.categoryName
          ? `${loaderData.categoryName} menu at 81 Taproom, Đà Nẵng`
          : 'Craft beer taproom menu — 81 Taproom, Đà Nẵng',
      },
      {
        property: 'og:title',
        content: loaderData?.categoryName
          ? `${loaderData.categoryName} — 81 Taproom`
          : '81 Taproom',
      },
      {
        property: 'og:description',
        content: 'Craft beer taproom in Đà Nẵng, Vietnam',
      },
    ],
  }),
  component: CategoryView,
})

function CategoryView() {
  const { categoryId: categorySlug } = Route.useParams()
  const { search } = Route.useSearch()
  const { language } = useUIStore()
  const t = getTranslation(language)
  const navigate = useNavigate({ from: '/category/$categoryId' })
  const [inputValue, setInputValue] = useState(search || '')

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

  const category = useMemo(
    () => data?.categories.find((c) => c.id === categorySlug) ?? null,
    [data?.categories, categorySlug]
  )

  const products = useMemo(() => {
    if (!data?.menuItems) return []
    let items = data.menuItems.filter((p) => p.category === categorySlug)
    if (search) {
      const q = search.toLowerCase()
      items = items.filter((p) => p.name.toLowerCase().includes(q))
    }
    return items
  }, [data?.menuItems, categorySlug, search])

  const groupedProducts = useMemo(() => {
    const groups: Record<string, Product[]> = {}
    products.forEach((product) => {
      const key = product.subcategory || 'Main'
      if (!groups[key]) groups[key] = []
      groups[key].push(product)
    })
    const sorted = Object.entries(groups).sort(([a], [b]) => {
      if (a === 'BY THE GLASS') return -1
      if (b === 'BY THE GLASS') return 1
      return a.localeCompare(b)
    })
    return Object.fromEntries(sorted)
  }, [products])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-red-500">{!category ? 'Category not found' : 'Failed to load items'}</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 mb-10">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide mb-4">
          {category.name}
        </h2>
        <div className="mb-6">
          <SearchBar value={inputValue} onChange={setInputValue} placeholder={t.searchPlaceholder} />
        </div>
        <div className="space-y-8">
          {products.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {search ? 'No results found' : 'No items in this category'}
            </p>
          ) : (
            Object.entries(groupedProducts).map(([subcategory, items]) => (
              <div key={subcategory}>
                {subcategory !== 'Main' && (
                  <h2 className="text-lg font-semibold text-gray-700 mb-3 px-1">{subcategory}</h2>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  {items.map((product) => (
                    <ProductCard key={product.id} product={product} language={language} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <FloatingCartBar />
    </div>
  )
}
