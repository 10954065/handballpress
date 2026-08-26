import { describe, expect, it } from 'vitest'
import { formatDate, formatMonthYear } from './format'

describe('formatDate', () => {
  it('formats a date as "D Month YYYY"', () => {
    expect(formatDate(new Date(Date.UTC(2026, 7, 26)))).toBe('26 August 2026')
  })

  it('accepts a date string', () => {
    expect(formatDate('2026-01-05T00:00:00.000Z')).toBe('5 January 2026')
  })

  it('returns null for null or undefined input', () => {
    expect(formatDate(null)).toBeNull()
    expect(formatDate(undefined)).toBeNull()
  })
})

describe('formatMonthYear', () => {
  it('formats a year/month pair as "Month YYYY"', () => {
    expect(formatMonthYear(2026, 3)).toBe('March 2026')
  })

  it('handles December without rolling into the next year', () => {
    expect(formatMonthYear(2025, 12)).toBe('December 2025')
  })
})
