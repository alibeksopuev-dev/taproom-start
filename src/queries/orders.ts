import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '#/lib/supabase';
import type { CreateOrderRequest, Order } from '#/types/order';

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateOrderRequest): Promise<Order> => {
      const { items, ...orderData } = request;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        ...item,
        order_id: order.id,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      const { data: fullOrder, error: fetchError } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', order.id)
        .single();

      if (fetchError) throw fetchError;
      return fullOrder as Order;
    },
    onSuccess: (order) => {
      queryClient.setQueryData(['order', order.id], order);
    },
  });
}
