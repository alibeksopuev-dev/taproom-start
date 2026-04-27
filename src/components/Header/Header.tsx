import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { Link, useRouter, useRouterState } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Button } from '#/components/ui/button';
import { Badge } from '#/components/ui/badge';
import { useCartStore } from '#/lib/store';
import { LanguageSwitcher } from '#/components/LanguageSwitcher/LanguageSwitcher';
import { organizationQueryOptions } from '#/queries/menu';

export function Header() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const itemCount = useCartStore((state) => state.getItemCount());
  const isHome = pathname === '/';
  const { data: organization } = useQuery(organizationQueryOptions());

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="hidden sm:flex items-center min-w-[44px]">
            {!isHome ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.history.back()}
                className="min-h-[44px] min-w-[44px]"
              >
                <ArrowLeft size={20} />
              </Button>
            ) : (
              <div className="w-[44px]" />
            )}
          </div>

          <Link to="/" className="flex-1 text-center">
            <div className="flex justify-center items-center">
              {organization?.logo_url ? (
                <img
                  src={organization.logo_url}
                  alt={organization.name ?? '81 Taproom'}
                  className="h-8 w-40 object-contain"
                />
              ) : (
                <span className="text-xl font-bold text-gray-900">
                  {organization?.name ?? '81 Taproom'}
                </span>
              )}
            </div>
          </Link>

          <div className="flex items-center">
            <LanguageSwitcher />
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative min-h-[44px] min-w-[44px]">
                <ShoppingCart size={20} fill={itemCount > 0 ? 'currentColor' : 'none'} />
                {itemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 px-1.5 text-xs"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
