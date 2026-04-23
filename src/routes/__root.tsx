import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuthStore } from '#/lib/authStore'
import appCss from '../styles.css?url'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000 },
  },
})

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: '81 Taproom' },
      { name: 'description', content: 'Craft beer taproom menu — 81 Taproom, Đà Nẵng' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
})

function AuthInit() {
  const initialize = useAuthStore((s) => s.initialize)
  useEffect(() => initialize(), [initialize])
  return null
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthInit />
          {children}
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
