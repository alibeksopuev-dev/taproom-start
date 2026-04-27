import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { supabase } from '#/lib/supabase'
import { ORGANIZATION_ID } from '#/lib/constants'

const orderItemSchema = z.object({
  menu_item_id: z.string(),
  item_name: z.string(),
  size: z.string().optional(),
  quantity: z.number().int().positive(),
  unit_price: z.number().nonnegative(),
  total_price: z.number().nonnegative(),
})

const submitOrderSchema = z.object({
  organization_id: z.string().default(ORGANIZATION_ID),
  user_id: z.string().optional(),
  total_amount: z.number().nonnegative(),
  discount_percent: z.number().min(0).max(100).optional(),
  discount_amount: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  table_number: z.string().optional(),
  payment_method: z.enum(['vietqr', 'vnpay', 'cash', 'whatsapp']),
  items: z.array(orderItemSchema).min(1),
})

export const submitOrder = createServerFn({ method: 'POST' })
  .inputValidator(submitOrderSchema)
  .handler(async ({ data }) => {
    const { items, ...orderData } = data

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) throw orderError

    const orderItems = items.map((item) => ({
      ...item,
      order_id: order.id,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) throw itemsError

    const { data: fullOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', order.id)
      .single()

    if (fetchError) throw fetchError
    return fullOrder
  })
