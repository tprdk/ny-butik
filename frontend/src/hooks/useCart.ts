import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cartApi } from '@/api/cart.api'
import { useCartStore } from '@/store/cart.store'
import { useAuthStore } from '@/store/auth.store'
import type { AddItemRequest } from '@/types/cart.types'

const CART_KEY = ['cart']

export function useCart() {
  const sessionId = useCartStore((s) => s.sessionId)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const qc = useQueryClient()

  const { data: cart, isLoading } = useQuery({
    queryKey: CART_KEY,
    queryFn: () => cartApi.get(isAuthenticated ? null : sessionId),
    staleTime: 30_000,
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: CART_KEY })

  const addItem = useMutation({
    mutationFn: (req: AddItemRequest) =>
      cartApi.addItem(req, isAuthenticated ? null : sessionId),
    onSuccess: (data) => qc.setQueryData(CART_KEY, data),
  })

  const updateItem = useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: number; quantity: number }) =>
      cartApi.updateItem(variantId, { quantity }, isAuthenticated ? null : sessionId),
    onSuccess: (data) => qc.setQueryData(CART_KEY, data),
  })

  const removeItem = useMutation({
    mutationFn: (variantId: number) =>
      cartApi.removeItem(variantId, isAuthenticated ? null : sessionId),
    onSuccess: (data) => qc.setQueryData(CART_KEY, data),
  })

  const clearCart = useMutation({
    mutationFn: () => cartApi.clear(isAuthenticated ? null : sessionId),
    onSuccess: (data) => qc.setQueryData(CART_KEY, data),
  })

  const applyCoupon = useMutation({
    mutationFn: (code: string) =>
      cartApi.applyCoupon(code, isAuthenticated ? null : sessionId),
    onSuccess: (data) => qc.setQueryData(CART_KEY, data),
  })

  const removeCoupon = useMutation({
    mutationFn: () => cartApi.removeCoupon(isAuthenticated ? null : sessionId),
    onSuccess: (data) => qc.setQueryData(CART_KEY, data),
  })

  const merge = useMutation({
    mutationFn: () => cartApi.merge(sessionId),
    onSuccess: (data) => qc.setQueryData(CART_KEY, data),
  })

  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0

  return {
    cart,
    isLoading,
    itemCount,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    merge,
    invalidate,
  }
}
