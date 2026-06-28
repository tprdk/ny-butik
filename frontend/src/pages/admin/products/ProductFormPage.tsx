import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Plus, Trash2, Loader2 } from 'lucide-react'
import { adminApi } from '@/api/admin.api'
import { catalogApi } from '@/api/catalog.api'
import { ImageUploader } from '@/components/admin/ImageUploader'
import type { UploadedImage } from '@/components/admin/ImageUploader'

const variantSchema = z.object({
  colorId: z.coerce.number().optional(),
  sizeId: z.coerce.number().optional(),
  sku: z.string().min(1, 'SKU zorunlu'),
  price: z.coerce.number().min(0.01, 'Fiyat girilmeli'),
  salePrice: z.coerce.number().optional(),
  stockQuantity: z.coerce.number().min(0).default(0),
  isActive: z.boolean().default(true),
})

const schema = z.object({
  categoryId: z.coerce.number({ required_error: 'Kategori seçin' }).min(1, 'Kategori seçin'),
  name: z.string().min(1, 'Ürün adı zorunlu').max(300),
  shortDesc: z.string().max(500).optional(),
  description: z.string().optional(),
  featured: z.boolean().default(false),
  tags: z.string().optional(),
  variants: z.array(variantSchema).min(1, 'En az 1 varyant ekleyin'),
})

type FormData = z.infer<typeof schema>

export default function ProductFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [images, setImages] = useState<UploadedImage[]>([])
  const [savedProductId, setSavedProductId] = useState<number | null>(isEdit ? Number(id) : null)

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: catalogApi.getCategories })
  const { data: colors } = useQuery({ queryKey: ['colors'], queryFn: catalogApi.getColors })
  const { data: sizes } = useQuery({ queryKey: ['sizes'], queryFn: catalogApi.getSizes })

  const { data: existing } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => adminApi.getProduct(Number(id)),
    enabled: isEdit,
  })

  const {
    register, control, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { variants: [{ sku: '', price: 0, stockQuantity: 0, isActive: true }], featured: false },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' })

  useEffect(() => {
    if (existing) {
      reset({
        categoryId: existing.category.id,
        name: existing.name,
        shortDesc: existing.shortDesc ?? '',
        description: existing.description ?? '',
        featured: existing.featured,
        tags: existing.tags.join(', '),
        variants: existing.variants.map((v) => ({
          colorId: v.color?.id,
          sizeId: v.size?.id,
          sku: v.sku,
          price: v.price,
          salePrice: v.salePrice ?? undefined,
          stockQuantity: v.stockQuantity,
          isActive: v.isActive,
        })),
      })
      setImages(existing.images.map((img) => ({
        id: img.id, url: img.url, isPrimary: img.isPrimary, displayOrder: img.displayOrder,
      })))
    }
  }, [existing, reset])

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        categoryId: data.categoryId,
        name: data.name,
        shortDesc: data.shortDesc || undefined,
        description: data.description || undefined,
        featured: data.featured,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        variants: data.variants.map((v) => ({
          ...v,
          colorId: v.colorId || undefined,
          sizeId: v.sizeId || undefined,
          salePrice: v.salePrice || undefined,
        })),
      }
      if (isEdit) return adminApi.updateProduct(Number(id), payload)
      return adminApi.createProduct(payload)
    },
    onSuccess: (product) => {
      setSavedProductId(product.id)
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      if (!isEdit) navigate(`/admin/urunler/${product.id}/duzenle`, { replace: true })
    },
  })

  const allCats = categories?.flatMap((c) => [c, ...(c.children ?? [])]) ?? []
  const alphaS = sizes?.filter((s) => s.sizeGroup === 'ALPHA') ?? []
  const numericS = sizes?.filter((s) => s.sizeGroup === 'NUMERIC') ?? []

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <Helmet><title>{isEdit ? 'Ürün Düzenle' : 'Yeni Ürün'} — NY Butik Admin</title></Helmet>
      {/* Başlık */}
      <div className="flex items-center gap-3">
        <Link to="/admin/urunler" className="p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-neutral-900">
          {isEdit ? 'Ürün Düzenle' : 'Yeni Ürün'}
        </h1>
      </div>

      <form onSubmit={handleSubmit((d) => saveMutation.mutateAsync(d))} className="flex flex-col gap-6">
        {/* Temel bilgiler */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-neutral-800">Temel Bilgiler</h2>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Ürün Adı *</label>
            <input {...register('name')} placeholder="Örn: Abaya Klasik Model"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Kategori *</label>
            <select {...register('categoryId')}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400">
              <option value="">Kategori seçin</option>
              {allCats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.parentId ? `  └ ${c.name}` : c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Kısa Açıklama</label>
            <input {...register('shortDesc')} placeholder="Ürün listesinde görünür (max 500 karakter)"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Açıklama</label>
            <textarea {...register('description')} rows={5} placeholder="Ürün detay sayfasında görünür"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-y" />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Etiketler</label>
            <input {...register('tags')} placeholder="abaya, tesettür, günlük (virgülle ayırın)"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" {...register('featured')} className="rounded" />
            <span className="text-sm text-neutral-700">Ana sayfada öne çıkar</span>
          </label>
        </section>

        {/* Varyantlar */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-neutral-800">Varyantlar (Renk / Beden / Fiyat)</h2>
            <button type="button"
              onClick={() => append({ sku: '', price: 0, stockQuantity: 0, isActive: true })}
              className="inline-flex items-center gap-1 text-sm text-neutral-600 border border-neutral-200 px-3 py-1.5 rounded-lg hover:bg-neutral-50 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Varyant Ekle
            </button>
          </div>
          {errors.variants?.root && <p className="text-xs text-red-500">{errors.variants.root.message}</p>}

          {fields.map((field, i) => (
            <div key={field.id} className="border border-neutral-100 rounded-xl p-4 flex flex-col gap-3 bg-neutral-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Varyant {i + 1}</span>
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(i)} className="p-1 text-neutral-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-600 mb-1">Renk</label>
                  <select {...register(`variants.${i}.colorId`)}
                    className="w-full border border-neutral-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400">
                    <option value="">Renk seç</option>
                    {colors?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-neutral-600 mb-1">Beden</label>
                  <select {...register(`variants.${i}.sizeId`)}
                    className="w-full border border-neutral-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400">
                    <option value="">Beden seç</option>
                    {alphaS.length > 0 && <optgroup label="Alfa">{alphaS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</optgroup>}
                    {numericS.length > 0 && <optgroup label="Numerik">{numericS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</optgroup>}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-neutral-600 mb-1">SKU *</label>
                  <input {...register(`variants.${i}.sku`)} placeholder="Örn: ABY-SYH-M-001"
                    className="w-full border border-neutral-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400" />
                  {errors.variants?.[i]?.sku && <p className="text-xs text-red-500">{errors.variants[i]?.sku?.message}</p>}
                </div>
                <div>
                  <label className="block text-xs text-neutral-600 mb-1">Stok</label>
                  <input type="number" min={0} {...register(`variants.${i}.stockQuantity`)}
                    className="w-full border border-neutral-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-600 mb-1">Fiyat (₺) *</label>
                  <input type="number" step="0.01" min="0" {...register(`variants.${i}.price`)}
                    className="w-full border border-neutral-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400" />
                  {errors.variants?.[i]?.price && <p className="text-xs text-red-500">{errors.variants[i]?.price?.message}</p>}
                </div>
                <div>
                  <label className="block text-xs text-neutral-600 mb-1">İndirimli Fiyat (₺)</label>
                  <input type="number" step="0.01" min="0" {...register(`variants.${i}.salePrice`)}
                    className="w-full border border-neutral-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400" />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" {...register(`variants.${i}.isActive`)} />
                <span className="text-neutral-600">Aktif</span>
              </label>
            </div>
          ))}
        </section>

        {/* Görseller — yalnızca ürün kaydedilmişse */}
        {savedProductId ? (
          <section className="bg-white border border-neutral-200 rounded-xl p-6 flex flex-col gap-4">
            <h2 className="font-semibold text-neutral-800">Görseller</h2>
            <ImageUploader
              images={images}
              productId={savedProductId}
              onUpload={async (file) => {
                const img = await adminApi.uploadImage(savedProductId, file)
                setImages((prev) => [...prev, img])
                return img
              }}
              onDelete={async (imageId) => {
                await adminApi.deleteImage(savedProductId, imageId)
                setImages((prev) => prev.filter((img) => img.id !== imageId))
              }}
              onSetPrimary={async (imageId) => {
                await adminApi.setPrimaryImage(savedProductId, imageId)
                setImages((prev) => prev.map((img) => ({ ...img, isPrimary: img.id === imageId })))
              }}
              onReorder={async (imageIds) => {
                await adminApi.reorderImages(savedProductId, imageIds)
              }}
            />
          </section>
        ) : (
          <div className="border border-dashed border-neutral-200 rounded-xl p-6 text-center text-sm text-neutral-400">
            Görsel yüklemek için önce ürünü kaydedin
          </div>
        )}

        {/* Kaydet */}
        {saveMutation.isError && (
          <p className="text-sm text-red-500">Kaydetme başarısız. Lütfen formu kontrol edin.</p>
        )}
        <div className="flex gap-3">
          <button type="submit" disabled={isSubmitting || saveMutation.isPending}
            className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50">
            {(isSubmitting || saveMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Güncelle' : 'Oluştur'}
          </button>
          <Link to="/admin/urunler" className="px-6 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
            İptal
          </Link>
        </div>
      </form>
    </div>
  )
}
