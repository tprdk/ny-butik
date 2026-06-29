import { describe, it, expect } from 'vitest'
import { formatPrice, formatDate, formatDateTime, maskEmail } from '@/lib/format'

describe('formatPrice', () => {
  it('tam sayıyı TL formatına çevirir', () => {
    const result = formatPrice(299)
    expect(result).toContain('299')
    expect(result).toContain('₺')
  })

  it('ondalıklı sayıyı doğru formatlar', () => {
    const result = formatPrice(449.9)
    expect(result).toContain('449')
    expect(result).toContain('90')
  })

  it('sıfır değerini formatlar', () => {
    const result = formatPrice(0)
    expect(result).toContain('0')
  })

  it('büyük değerleri formatlar', () => {
    const result = formatPrice(10000)
    expect(result).toContain('10')
    expect(result).toContain('₺')
  })
})

describe('maskEmail', () => {
  it('e-posta adresini maskeler', () => {
    expect(maskEmail('ayse@test.com')).toBe('a***@test.com')
  })

  it('tek harfli local parte maskeler', () => {
    expect(maskEmail('a@test.com')).toBe('a***@test.com')
  })

  it('domain kısmını değiştirmez', () => {
    const masked = maskEmail('ibrahim@nybutik.com')
    expect(masked).toContain('@nybutik.com')
    expect(masked).toContain('***')
  })
})

describe('formatDate', () => {
  it('ISO tarihini Türkçe formata çevirir', () => {
    const result = formatDate('2024-03-15T10:00:00Z')
    expect(result).toContain('2024')
    expect(result).toContain('15')
  })
})

describe('formatDateTime', () => {
  it('ISO tarih-saatini formatlar', () => {
    const result = formatDateTime('2024-03-15T14:30:00Z')
    expect(result).toContain('2024')
    expect(result).toContain('15')
  })
})
