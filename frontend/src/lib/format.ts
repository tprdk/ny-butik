const priceFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  minimumFractionDigits: 2,
})

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export const formatPrice = (amount: number) => priceFormatter.format(amount)

export const formatDate = (dateStr: string) => dateFormatter.format(new Date(dateStr))

export const formatDateTime = (dateStr: string) => dateTimeFormatter.format(new Date(dateStr))

export const maskEmail = (email: string) => {
  const [local, domain] = email.split('@')
  return `${local[0]}***@${domain}`
}
