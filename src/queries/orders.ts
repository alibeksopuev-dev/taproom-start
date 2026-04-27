import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitOrder } from '#/actions/order'
import type { CreateOrderRequest, Order } from '#/types/order'

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: CreateOrderRequest): Promise<Order> => {
      return submitOrder({ data: request }) as Promise<Order>
    },
    onSuccess: (order) => {
      queryClient.setQueryData(['order', order.id], order)
    },
  })
}
