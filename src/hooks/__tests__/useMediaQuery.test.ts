import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
} from '../useMediaQuery'

// Mock window.matchMedia
const createMatchMediaMock = (matches: boolean) => {
  const listeners: ((event: MediaQueryListEvent) => void)[] = []

  return {
    matches,
    media: '',
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
      if (event === 'change') {
        listeners.push(listener)
      }
    }),
    removeEventListener: vi.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
      if (event === 'change') {
        const index = listeners.indexOf(listener)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    }),
    dispatchEvent: vi.fn((event: MediaQueryListEvent) => {
      listeners.forEach((listener) => listener(event))
      return true
    }),
    // Helper to trigger change events
    _trigger: (newMatches: boolean) => {
      listeners.forEach((listener) => {
        listener({ matches: newMatches } as MediaQueryListEvent)
      })
    },
  }
}

describe('useMediaQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return false initially', () => {
    const mockMatchMedia = createMatchMediaMock(false)
    window.matchMedia = vi.fn(() => mockMatchMedia as any)

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))

    expect(result.current).toBe(false)
  })

  it('should return true when query matches', () => {
    const mockMatchMedia = createMatchMediaMock(true)
    window.matchMedia = vi.fn(() => mockMatchMedia as any)

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))

    expect(result.current).toBe(true)
  })

  it('should update when media query changes', () => {
    const mockMatchMedia = createMatchMediaMock(false)
    window.matchMedia = vi.fn(() => mockMatchMedia as any)

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))

    expect(result.current).toBe(false)

    // Simulate media query change
    act(() => {
      mockMatchMedia._trigger(true)
    })

    expect(result.current).toBe(true)

    // Change back
    act(() => {
      mockMatchMedia._trigger(false)
    })

    expect(result.current).toBe(false)
  })

  it('should cleanup event listener on unmount', () => {
    const mockMatchMedia = createMatchMediaMock(false)
    window.matchMedia = vi.fn(() => mockMatchMedia as any)

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'))

    expect(mockMatchMedia.addEventListener).toHaveBeenCalledTimes(1)

    unmount()

    expect(mockMatchMedia.removeEventListener).toHaveBeenCalledTimes(1)
  })

  it('should re-subscribe when query changes', () => {
    const mockMatchMedia1 = createMatchMediaMock(false)
    const mockMatchMedia2 = createMatchMediaMock(true)

    window.matchMedia = vi.fn((query) => {
      if (query === '(min-width: 768px)') return mockMatchMedia1 as any
      if (query === '(min-width: 1024px)') return mockMatchMedia2 as any
      return mockMatchMedia1 as any
    })

    const { result, rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      {
        initialProps: { query: '(min-width: 768px)' },
      }
    )

    expect(result.current).toBe(false)

    rerender({ query: '(min-width: 1024px)' })

    expect(result.current).toBe(true)
  })
})

describe('useIsMobile', () => {
  it('should return true for mobile viewport', () => {
    const mockMatchMedia = createMatchMediaMock(true)
    window.matchMedia = vi.fn(() => mockMatchMedia as any)

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('should return false for non-mobile viewport', () => {
    const mockMatchMedia = createMatchMediaMock(false)
    window.matchMedia = vi.fn(() => mockMatchMedia as any)

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })
})

describe('useIsTablet', () => {
  it('should return true for tablet viewport', () => {
    const mockMatchMedia = createMatchMediaMock(true)
    window.matchMedia = vi.fn(() => mockMatchMedia as any)

    const { result } = renderHook(() => useIsTablet())

    expect(result.current).toBe(true)
  })

  it('should return false for non-tablet viewport', () => {
    const mockMatchMedia = createMatchMediaMock(false)
    window.matchMedia = vi.fn(() => mockMatchMedia as any)

    const { result } = renderHook(() => useIsTablet())

    expect(result.current).toBe(false)
  })
})

describe('useIsDesktop', () => {
  it('should return true for desktop viewport', () => {
    const mockMatchMedia = createMatchMediaMock(true)
    window.matchMedia = vi.fn(() => mockMatchMedia as any)

    const { result } = renderHook(() => useIsDesktop())

    expect(result.current).toBe(true)
  })

  it('should return false for non-desktop viewport', () => {
    const mockMatchMedia = createMatchMediaMock(false)
    window.matchMedia = vi.fn(() => mockMatchMedia as any)

    const { result } = renderHook(() => useIsDesktop())

    expect(result.current).toBe(false)
  })
})
