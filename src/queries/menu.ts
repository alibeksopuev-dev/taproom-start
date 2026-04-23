import { queryOptions } from '@tanstack/react-query';
import { supabase } from '#/lib/supabase';
import { toFrontendCategory, toFrontendProduct, type DbCategory, type DbMenuItem } from '#/lib/menuHelpers';
import { ORGANIZATION_ID } from '#/lib/constants';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string | null;
  is_disabled: boolean;
}

async function fetchOrganization(id: string): Promise<Organization> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Organization;
}

export function organizationQueryOptions(id: string = ORGANIZATION_ID) {
  return queryOptions({
    queryKey: ['organization', id],
    queryFn: () => fetchOrganization(id),
    staleTime: 10 * 60 * 1000,
  });
}

async function fetchMenuData(organizationId: string) {
  const [categoriesRes, itemsRes] = await Promise.all([
    supabase.from('categories').select('*').order('name', { ascending: true }),
    supabase
      .from('menu_items')
      .select('*, price_per_size (*), category:categories (*)')
      .eq('organization_id', organizationId)
      .eq('is_disabled', false)
      .order('name', { ascending: true }),
  ]);

  if (categoriesRes.error) throw categoriesRes.error;
  if (itemsRes.error) throw itemsRes.error;

  const dbCategories = (categoriesRes.data || []) as DbCategory[];
  const dbMenuItems = (itemsRes.data || []) as DbMenuItem[];

  const categories = dbCategories.map((cat, idx) => toFrontendCategory(cat, idx));
  const menuItems = dbMenuItems.map((item) => {
    const slug = (item.category as DbCategory | undefined)?.slug ?? 'unknown';
    return toFrontendProduct(item, slug);
  });

  return { categories, menuItems };
}

export function menuQueryOptions(organizationId: string = ORGANIZATION_ID) {
  return queryOptions({
    queryKey: ['menu', organizationId],
    queryFn: () => fetchMenuData(organizationId),
    staleTime: 5 * 60 * 1000,
  });
}

async function fetchOrder(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', orderId)
    .single();

  if (error) throw error;
  return data;
}

export function orderQueryOptions(orderId: string) {
  return queryOptions({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrder(orderId),
    enabled: !!orderId,
    refetchInterval: 10000,
  });
}
