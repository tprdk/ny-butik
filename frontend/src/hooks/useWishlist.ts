import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { wishlistApi, type WishlistItem } from '@/api/wishlist.api'
import { useAuthStore } from '@/store/auth.store'

const WISHLIST_KEY = ['wishlist']
const WISHLIST_IDS_KEY = ['wishlist', 'ids']

export function useWishlist() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const qc = useQueryClient()

  const { data: items = [] } = useQuery<WishlistItem[]>({
    queryKey: WISHLIST_KEY,
    queryFn: wishlistApi.getAll,
    enabled: isAuthenticated,
    staleTime: 60_000,
  })

  const { data: ids = [] } = useQuery<number[]>({
    queryKey: WISHLIST_IDS_KEY,
    queryFn: wishlistApi.getIds,
    enabled: isAuthenticated,
    staleTime: 60_000,
  })

  const wishlistIds = new Set(ids)

  const isWishlisted = (productId: number) => wishlistIds.has(productId)

  const addMutation = useMutation({
    mutationFn: (productId: number) => wishlistApi.add(productId),
    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: WISHLIST_IDS_KEY })
      const previousIds = qc.getQueryData<number[]>(WISHLIST_IDS_KEY) ?? []
      qc.setQueryData<number[]>(WISHLIST_IDS_KEY, [...previousIds, productId])
      return { previousIds }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WISHLIST_KEY })
      qc.invalidateQueries({ queryKey: WISHLIST_IDS_KEY })
      toast.success('Favorilere eklendi.')
    },
    onError: (_err, _productId, context) => {
      if (context?.previousIds) {
        qc.setQueryData(WISHLIST_IDS_KEY, context.previousIds)
      }
      toast.error('Bir hata oluştu.')
    },
  })

  const removeMutation = useMutation({
    mutationFn: (productId: number) => wishlistApi.remove(productId),
    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: WISHLIST_IDS_KEY })
      const previousIds = qc.getQueryData<number[]>(WISHLIST_IDS_KEY) ?? []
      qc.setQueryData<number[]>(
        WISHLIST_IDS_KEY,
        previousIds.filter((id) => id !== productId)
      )
      return { previousIds }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WISHLIST_KEY })
      qc.invalidateQueries({ queryKey: WISHLIST_IDS_KEY })
      toast.success('Favorilerden çıkarıldı.')
    },
    onError: (_err, _productId, context) => {
      if (context?.previousIds) {
        qc.setQueryData(WISHLIST_IDS_KEY, context.previousIds)
      }
      toast.error('Bir hata oluştu.')
    },
  })

  const toggle = (productId: number) => {
    if (!isAuthenticated) {
      toast.error('Favorilere eklemek için giriş yapın')
      return
    }
    if (isWishlisted(productId)) {
      removeMutation.mutate(productId)
    } else {
      addMutation.mutate(productId)
    }
  }

  const isPending = addMutation.isPending || removeMutation.isPending

  return {
    items,
    wishlistIds,
    isWishlisted,
    toggle,
    isPending,
  }
}
