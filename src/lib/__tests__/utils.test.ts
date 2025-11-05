import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  cn,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  generateColorFromString,
  getContrastColor,
  isValidEmail,
  isValidUrl,
  truncate,
  capitalize,
  slugify,
} from '../utils'

describe('cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('should handle tailwind merge conflicts', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })
})

describe('formatDate', () => {
  it('should format Date object correctly', () => {
    const date = new Date('2025-01-15')
    const result = formatDate(date)
    expect(result).toMatch(/2025/)
  })

  it('should format unix timestamp correctly', () => {
    const timestamp = 1705276800 // 2025-01-15 00:00:00 UTC
    const result = formatDate(timestamp)
    // Should contain year, month and day in some format
    expect(result).toMatch(/\d{4}/)
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('formatDateTime', () => {
  it('should format Date object with time', () => {
    const date = new Date('2025-01-15T10:30:00')
    const result = formatDateTime(date)
    expect(result).toMatch(/2025/)
    expect(result).toMatch(/\d{2}:\d{2}/)
  })

  it('should format unix timestamp with time', () => {
    const timestamp = 1705313400 // 2025-01-15 10:10:00 UTC
    const result = formatDateTime(timestamp)
    // Should contain year and time in some format
    expect(result).toMatch(/\d{4}/)
    expect(result).toMatch(/\d{2}:\d{2}/)
  })
})

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return "今すぐ" for recent times', () => {
    const now = new Date('2025-01-15T10:00:00')
    vi.setSystemTime(now)

    const recentTime = new Date('2025-01-15T09:59:30')
    expect(formatRelativeTime(recentTime)).toBe('今すぐ')
  })

  it('should return minutes for times within an hour', () => {
    const now = new Date('2025-01-15T10:00:00')
    vi.setSystemTime(now)

    const thirtyMinsAgo = new Date('2025-01-15T09:30:00')
    expect(formatRelativeTime(thirtyMinsAgo)).toBe('30分前')
  })

  it('should return hours for times within a day', () => {
    const now = new Date('2025-01-15T10:00:00')
    vi.setSystemTime(now)

    const twoHoursAgo = new Date('2025-01-15T08:00:00')
    expect(formatRelativeTime(twoHoursAgo)).toBe('2時間前')
  })

  it('should return days for times within a week', () => {
    const now = new Date('2025-01-15T10:00:00')
    vi.setSystemTime(now)

    const threeDaysAgo = new Date('2025-01-12T10:00:00')
    expect(formatRelativeTime(threeDaysAgo)).toBe('3日前')
  })

  it('should return formatted date for times over a week', () => {
    const now = new Date('2025-01-15T10:00:00')
    vi.setSystemTime(now)

    const tenDaysAgo = new Date('2025-01-05T10:00:00')
    const result = formatRelativeTime(tenDaysAgo)
    expect(result).toMatch(/2025/)
  })
})

describe('generateColorFromString', () => {
  it('should generate consistent colors for the same string', () => {
    const color1 = generateColorFromString('test')
    const color2 = generateColorFromString('test')
    expect(color1).toBe(color2)
  })

  it('should generate different colors for different strings', () => {
    const color1 = generateColorFromString('test1')
    const color2 = generateColorFromString('test2')
    expect(color1).not.toBe(color2)
  })

  it('should return HSL color format', () => {
    const color = generateColorFromString('test')
    expect(color).toMatch(/^hsl\(\d+, 70%, 60%\)$/)
  })
})

describe('getContrastColor', () => {
  it('should return black for light colors', () => {
    expect(getContrastColor('#FFFFFF')).toBe('black')
    expect(getContrastColor('#F0F0F0')).toBe('black')
  })

  it('should return white for dark colors', () => {
    expect(getContrastColor('#000000')).toBe('white')
    expect(getContrastColor('#333333')).toBe('white')
  })

  it('should handle colors without # prefix', () => {
    expect(getContrastColor('FFFFFF')).toBe('black')
    expect(getContrastColor('000000')).toBe('white')
  })
})

describe('isValidEmail', () => {
  it('should validate correct email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@example.co.jp')).toBe(true)
    expect(isValidEmail('user+tag@example.com')).toBe(true)
  })

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('invalid@')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
    expect(isValidEmail('invalid@example')).toBe(false)
  })
})

describe('isValidUrl', () => {
  it('should validate correct URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
    expect(isValidUrl('http://example.com')).toBe(true)
    expect(isValidUrl('https://example.com/path?query=value')).toBe(true)
  })

  it('should reject invalid URLs', () => {
    expect(isValidUrl('invalid')).toBe(false)
    // Note: Some URLs with typos in protocol might still be valid according to URL spec
    // so we test with clearly invalid ones
    expect(isValidUrl('not a url')).toBe(false)
    expect(isValidUrl('')).toBe(false)
  })
})

describe('truncate', () => {
  it('should truncate long strings', () => {
    expect(truncate('This is a long string', 10)).toBe('This is a ...')
  })

  it('should not truncate short strings', () => {
    expect(truncate('Short', 10)).toBe('Short')
  })

  it('should handle exact length', () => {
    expect(truncate('Exactly10!', 10)).toBe('Exactly10!')
  })
})

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello')
  })

  it('should not affect already capitalized strings', () => {
    expect(capitalize('Hello')).toBe('Hello')
  })

  it('should handle single character', () => {
    expect(capitalize('a')).toBe('A')
  })
})

describe('slugify', () => {
  it('should convert string to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('should remove special characters', () => {
    expect(slugify('Hello! @World#')).toBe('hello-world')
  })

  it('should handle multiple spaces', () => {
    expect(slugify('Hello   World')).toBe('hello-world')
  })

  it('should trim hyphens from start and end', () => {
    expect(slugify('  Hello World  ')).toBe('hello-world')
  })

  it('should replace underscores with hyphens', () => {
    expect(slugify('Hello_World')).toBe('hello-world')
  })
})
